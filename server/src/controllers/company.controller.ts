import type { Request, Response } from "express";
import prisma from "../utils/prisma.js";
import { z } from "zod";
import { uploadToSupabase } from "../utils/supabase.js";

const createCompanySchema = z.object({
  name: z.string().min(3),
  address: z.string().optional(),
  managerId: z.string().min(1, "Un administrateur est requis"),
  isActive: z.boolean().optional(),
  subscriptionStatus: z.string().optional(),
  subscriptionEndsAt: z.coerce.date().optional(),
});

const updateCompanySchema = z.object({
  name: z.string().min(3).optional(),
  address: z.string().optional(),
  managerId: z.string().optional(),
  isActive: z.boolean().optional(),
  subscriptionStatus: z.string().optional(),
  subscriptionEndsAt: z.coerce.date().optional(),
  isLocked: z.boolean().optional(),
});

const updateSubscriptionSchema = z.object({
  subscriptionEndsAt: z.coerce.date().nullable(),
  subscriptionStatus: z.string().optional(),
});

export const createCompany = async (req: Request, res: Response) => {
  try {
    const { name, address, managerId, isActive, subscriptionStatus, subscriptionEndsAt } =
      createCompanySchema.parse(req.body);

    // Verify manager exists and has no company
    const manager = await prisma.user.findUnique({ where: { id: managerId }, include: { managedCompany: true } });
    if (!manager) {
      return res.status(404).json({ message: "Administrateur non trouvé" });
    }
    if (manager.managedCompany) {
      return res.status(400).json({ message: "Cet administrateur gère déjà une entreprise" });
    }

    // Transaction to create company and update manager
    const company = await prisma.$transaction(async (prisma) => {
      const newCompany = await prisma.company.create({
        data: {
          name,
          address: address || null,
          managerId,
          isActive: isActive ?? true,
          subscriptionStatus: subscriptionStatus || "ACTIVE",
          subscriptionEndsAt: subscriptionEndsAt || null,
          isLocked: false,
          lockedAt: null,
        },
      });

      await prisma.user.update({
        where: { id: managerId },
        data: {
          companyId: newCompany.id,
          role: "COMPANY_ADMIN",
        },
      });

      return newCompany;
    });

    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ message: "Error creating company", error });
  }
};

export const getCompanies = async (req: Request, res: Response) => {
  try {
    const companies = await prisma.company.findMany({
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: { users: true, departments: true },
        },
      },
    });
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: "Error fetching companies", error });
  }
};

export const getCompanyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) return res.status(400).json({ message: "ID required" });

    const company = await prisma.company.findUnique({
      where: { id: String(id) },
      include: {
        manager: true,
        users: true,
        departments: true,
      },
    });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json(company);
  } catch (error) {
    res.status(500).json({ message: "Error fetching company", error });
  }
};

export const updateCompany = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;
    if (!currentUser) return res.status(401).json({ message: "Non authentifié" });

    const { id } = req.params;
    const { name, address, managerId, isActive, subscriptionStatus, subscriptionEndsAt, isLocked } =
      updateCompanySchema.parse(req.body);

    if (!id) return res.status(400).json({ message: "ID required" });

    // Sécurité : Un COMPANY_ADMIN ne peut modifier que sa propre entreprise
    if (currentUser.role !== "SUPER_ADMIN" && String(id) !== currentUser.companyId) {
      return res.status(403).json({ message: "Accès refusé : vous ne pouvez modifier que votre propre entreprise." });
    }

    const currentCompany = await prisma.company.findUnique({ where: { id: String(id) } });
    if (!currentCompany) return res.status(404).json({ message: "Company not found" });

    const updateData: any = {};
    if (name) updateData.name = name;
    if (address !== undefined) updateData.address = address;
    if (managerId !== undefined) updateData.managerId = managerId;

    // Protection Mass Assignment : Seul SUPER_ADMIN peut modifier le statut, l'abonnement ou le verrouillage
    if (currentUser.role === "SUPER_ADMIN") {
      if (isActive !== undefined) updateData.isActive = isActive;
      if (subscriptionStatus !== undefined) updateData.subscriptionStatus = subscriptionStatus;
      if (subscriptionEndsAt !== undefined) updateData.subscriptionEndsAt = subscriptionEndsAt;
      if (isLocked !== undefined) {
        updateData.isLocked = isLocked;
        updateData.lockedAt = isLocked ? new Date() : null;
      }
    } else if (isActive !== undefined || subscriptionStatus !== undefined || subscriptionEndsAt !== undefined || isLocked !== undefined) {
        return res.status(403).json({ message: "Action non autorisée : seul le super administrateur peut modifier ces paramètres d'abonnement." });
    }

    const company = await prisma.$transaction(async (prisma) => {
      // If manager changes, handle User relations
      if (managerId && managerId !== currentCompany.managerId) {
         // Verify new manager
         const newManager = await prisma.user.findUnique({ where: { id: managerId } });
         if (!newManager) throw new Error("New manager not found");
         if (newManager.companyId && newManager.companyId !== String(id)) {
             throw new Error("New manager already manages another company");
         }

         // Unlink old manager
         if (currentCompany.managerId) {
             await prisma.user.update({
                 where: { id: currentCompany.managerId },
                 data: { companyId: null }
             });
         }
         // Link new manager
         await prisma.user.update({
             where: { id: managerId },
             data: { companyId: String(id), role: "COMPANY_ADMIN" }
         });
      }

      return await prisma.company.update({
        where: { id: String(id) },
        data: updateData,
      });
    });

    res.json(company);
  } catch (error) {
    res.status(500).json({ message: "Error updating company", error });
  }
};

export const deleteCompany = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) return res.status(400).json({ message: "ID required" });

    await prisma.$transaction(async (tx) => {
        // Supprimer tous les utilisateurs liés à cette entreprise
        await tx.user.deleteMany({
            where: { companyId: String(id) }
        });

        // Supprimer l'entreprise (les autres relations comme Department, Task sont onDelete: Cascade)
        await tx.company.delete({
            where: { id: String(id) },
        });
    });

    res.json({ message: "Company deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting company", error });
  }
};

/**
 * Verrouille une entreprise (blocage total).
 */
export const lockCompany = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "ID required" });

    const company = await prisma.company.update({
      where: { id: String(id) },
      data: { isLocked: true, lockedAt: new Date(), subscriptionStatus: "SUSPENDED" },
    });

    res.json({ message: "Entreprise verrouillée.", company });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du verrouillage", error });
  }
};

/**
 * Déverrouille une entreprise.
 */
export const unlockCompany = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "ID required" });

    const company = await prisma.company.update({
      where: { id: String(id) },
      data: { isLocked: false, lockedAt: null, subscriptionStatus: "ACTIVE" },
    });

    res.json({ message: "Entreprise déverrouillée.", company });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du déverrouillage", error });
  }
};

/**
 * Met à jour le logo de l'entreprise.
 */
export const updateLogo = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const file = (req as any).file;
    const currentUser = (req as any).user;

    if (!id) return res.status(400).json({ message: "ID de l'entreprise requis" });

    // Sécurité IDOR
    if (currentUser.role !== "SUPER_ADMIN" && String(id) !== currentUser.companyId) {
      return res.status(403).json({ message: "Accès refusé : vous ne pouvez modifier que le logo de votre entreprise." });
    }

    let logoUrl: string | undefined;

    if (file) {
      // Upload vers Supabase Storage
      logoUrl = await uploadToSupabase(file);
      if (!logoUrl) {
        return res.status(500).json({ message: "Erreur lors de l'upload du fichier vers Supabase." });
      }
    } else {
      return res.status(400).json({ message: "Aucun fichier de logo fourni." });
    }

    const company = await prisma.company.update({
      where: { id: String(id) },
      data: { logoUrl },
    });

    res.json({ message: "Logo mis à jour avec succès.", company });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour du logo", error });
  }
};

/**
 * Met à jour l'abonnement d'une entreprise (Super Admin).
 */
export const updateSubscription = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { subscriptionEndsAt, subscriptionStatus } = updateSubscriptionSchema.parse(req.body);

    if (!id) return res.status(400).json({ message: "ID required" });

    const dataToUpdate: any = { subscriptionEndsAt };
    if (subscriptionStatus) {
      dataToUpdate.subscriptionStatus = subscriptionStatus;
    }

    const company = await prisma.company.update({
      where: { id: String(id) },
      data: dataToUpdate,
    });

    res.json({ message: "Abonnement mis à jour.", company });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour de l'abonnement", error });
  }
};
