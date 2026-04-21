import type { Request, Response } from "express";
import prisma from "../utils/prisma.js";
import { z } from "zod";

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
    const { id } = req.params;
    const { name, address, managerId, isActive, subscriptionStatus, subscriptionEndsAt, isLocked } =
      updateCompanySchema.parse(req.body);

    if (!id) return res.status(400).json({ message: "ID required" });

    const currentCompany = await prisma.company.findUnique({ where: { id: String(id) } });
    if (!currentCompany) return res.status(404).json({ message: "Company not found" });

    const updateData: any = {};
    if (name) updateData.name = name;
    if (address !== undefined) updateData.address = address;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (subscriptionStatus !== undefined) updateData.subscriptionStatus = subscriptionStatus;
    if (subscriptionEndsAt !== undefined) updateData.subscriptionEndsAt = subscriptionEndsAt;
    if (isLocked !== undefined) {
      updateData.isLocked = isLocked;
      updateData.lockedAt = isLocked ? new Date() : null;
    }
    if (managerId !== undefined) updateData.managerId = managerId;

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

    await prisma.$transaction(async (prisma) => {
        // Unlink all users from this company
        await prisma.user.updateMany({
            where: { companyId: String(id) },
            data: { companyId: null }
        });

        // Delete related data (simplified for now, assuming cascade or empty)
        // If foreign keys prevent deletion, we might need to delete children first
        // But for this task, let's assume the company is relatively new/empty or try/catch
        await prisma.company.delete({
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
    const { logoUrl } = req.body;

    if (!id || !logoUrl) return res.status(400).json({ message: "ID et logoUrl requis" });

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
