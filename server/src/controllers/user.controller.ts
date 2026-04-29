import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../utils/prisma.js";
import { z } from "zod";
import type { AuthRequest } from "../middleware/auth.js";

// Validation logic and exports

const createUserSchema = z.object({
  email: z.string().email(),
  // En mode invitation, on peut laisser vide : on générera un mdp aléatoire + l'employé fera "mot de passe oublié"
  password: z.string().min(6).optional(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.enum([
    "SUPER_ADMIN",
    "COMPANY_ADMIN",
    "HR_MANAGER",
    "HR_ASSISTANT",
    "EMPLOYEE",
  ]),
  companyId: z.string().optional(),
  jobTitle: z.string().optional(),
  phone: z.string().optional(),
  hireDate: z.coerce.date().optional(),
  status: z.enum(["INVITED", "ACTIVE", "INACTIVE"]).optional(),
  departmentId: z.string().optional(),
  managerId: z.string().optional(),
});

export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      role,
      companyId,
      jobTitle,
      phone,
      hireDate,
      status,
      departmentId,
      managerId,
    } = createUserSchema.parse(req.body);
    const currentUser = req.user;

    if (!currentUser) return res.status(401).json({ message: "Unauthorized" });

    // RBAC (pivot RH)
    // - SUPER_ADMIN: peut créer n'importe où (via companyId)
    // - COMPANY_ADMIN / HR_MANAGER: peut créer dans son entreprise
    // - HR_ASSISTANT: peut créer uniquement des EMPLOYEE (dans son entreprise)
    if (currentUser.role === "HR_ASSISTANT" && role !== "EMPLOYEE") {
      return res.status(403).json({ message: "HR Assistant ne peut créer que des employés." });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const rawPassword =
      password && password.length >= 6
        ? password
        : Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // Forcer l'entreprise cible selon le rôle
    const targetCompanyId =
      currentUser.role === "SUPER_ADMIN" ? companyId || null : currentUser.companyId || null;

    if (currentUser.role !== "SUPER_ADMIN" && companyId && companyId !== currentUser.companyId) {
      return res.status(403).json({ message: "Impossible de créer un utilisateur pour une autre entreprise." });
    }

    // Vérification des limites d'employés selon le forfait
    if (targetCompanyId) {
      const company = await prisma.company.findUnique({
        where: { id: targetCompanyId },
        select: { plan: true, _count: { select: { users: true } } }
      });

      if (company) {
        const currentCount = company._count.users;
        const plan = company.plan || 'FITINI';
        
        let limit = Infinity;
        if (plan === 'FITINI') limit = 5;
        else if (plan === 'LOUBA') limit = 20;

        if (currentCount >= limit) {
          return res.status(403).json({ 
            message: `Limite d'employés atteinte pour votre forfait ${plan} (${limit} employés max).` 
          });
        }
      }
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        companyId: targetCompanyId,
        jobTitle: jobTitle || null,
        phone: phone || null,
        hireDate: hireDate || null,
        status: status || "INVITED",
        departmentId: departmentId || null,
        managerId: managerId || null,
      },
    });

    res.status(201).json({ id: user.id, email: user.email, role: user.role });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Email invalide ou format incorrect" });
    }
    res.status(500).json({ message: "Erreur lors de la création de l'employé", error });
  }
};

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { role, companyId } = req.query;
    const currentUser = req.user;

    const whereClause: any = {};

    // Filter by role if provided
    if (role && typeof role === 'string') whereClause.role = role;
    // Filter by companyId si SUPER_ADMIN
    if (companyId && typeof companyId === 'string') whereClause.companyId = companyId;

    // RBAC: filtrage multi-entreprise
    if (currentUser?.role !== "SUPER_ADMIN") {
      if (!currentUser?.companyId) {
        return res.status(400).json({ message: "Compte sans entreprise associée" });
      }
      whereClause.companyId = currentUser.companyId;
      // Exclure SUPER_ADMIN des listes entreprise
      whereClause.role = { not: "SUPER_ADMIN" };
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        jobTitle: true,
        phone: true,
        hireDate: true,
        status: true,
        departmentId: true,
        managerId: true,
        company: {
          select: {
            id: true,
            name: true,
          }
        },
        department: {
          select: { id: true, name: true },
        }
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      email,
      firstName,
      lastName,
      role,
      companyId,
      password,
      jobTitle,
      phone,
      hireDate,
      status,
      departmentId,
      managerId,
    } = req.body; // Allow partial updates without password
    const currentUser = req.user;

    if (!currentUser) return res.status(401).json({ message: "Unauthorized" });
    if (!id) return res.status(400).json({ message: "Missing id" });

    const targetUser = await prisma.user.findUnique({ where: { id: String(id) } });
    if (!targetUser) return res.status(404).json({ message: "Utilisateur non trouvé" });

    // RBAC Security Checks
    // Removed IT_ADMIN legacy checks

    // Optional: Validate data if needed, or use Zod with .partial()
    
    const updateData: any = {
        email,
        firstName,
        lastName,
        role,
        companyId: companyId || undefined,
        jobTitle,
        phone,
        hireDate,
        status,
        departmentId,
        managerId,
    };

    if (password) {
        updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: String(id) },
      data: updateData,
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    if (!currentUser) return res.status(401).json({ message: "Unauthorized" });
    if (!id) return res.status(400).json({ message: "Missing id" });

    // 1. Prevent self-deletion
    if (currentUser.id === id) {
        return res.status(403).json({ message: "Vous ne pouvez pas supprimer votre propre compte." });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: String(id) } });
    if (!targetUser) return res.status(404).json({ message: "Utilisateur non trouvé" });

    // 2. RBAC (multi-entreprise)
    if (currentUser.role !== "SUPER_ADMIN") {
      if (!currentUser.companyId || targetUser.companyId !== currentUser.companyId) {
        return res.status(403).json({ message: "Impossible de supprimer un utilisateur d'une autre entreprise." });
      }
      // HR_ASSISTANT ne supprime pas les admins
      if (currentUser.role === "HR_ASSISTANT" && targetUser.role !== "EMPLOYEE") {
        return res.status(403).json({ message: "HR Assistant ne peut supprimer que des employés." });
      }
      // Éviter suppression du COMPANY_ADMIN par un rôle inférieur (simple MVP)
      if (targetUser.role === "COMPANY_ADMIN" && currentUser.role !== "COMPANY_ADMIN") {
        return res.status(403).json({ message: "Seul l'admin entreprise peut supprimer un autre admin." });
      }
    }

    // 3. Robust Cleanup (Manual because some relations don't have onDelete: Cascade)
    await prisma.$transaction(async (tx) => {
      // a. Si l'utilisateur est manager d'une entreprise, on retire le lien
      await tx.company.updateMany({
        where: { managerId: id },
        data: { managerId: null }
      });

      // b. Supprimer les messages (envoyés et reçus)
      await tx.message.deleteMany({
        where: {
          OR: [
            { senderId: id },
            { recipientId: id }
          ]
        }
      });

      // c. Supprimer les notifications (champ userId non lié formellement mais à nettoyer)
      await tx.notification.deleteMany({
        where: { userId: id }
      });

      // d. Enfin, supprimer l'utilisateur (les autres relations comme Attendance, Leave, etc. sont en Cascade dans le schema)
      await tx.user.delete({
        where: { id: String(id) },
      });
    });

    res.status(200).json({ message: "Utilisateur supprimé avec succès" });
  } catch (error: any) {
    console.error("Delete User Error:", error);
    res.status(500).json({ message: "Erreur lors de la suppression", error: error.message });
  }
};

export const updateUserPassword = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { password } = req.body;

        if (!id || !password) return res.status(400).json({ message: "Missing id or password" });

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: { id: String(id) },
            data: { password: hashedPassword }
        });

        res.json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error updating password", error });
    }
};

export const suspendUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    if (!currentUser) return res.status(401).json({ message: "Unauthorized" });

    const targetUser = await prisma.user.findUnique({ where: { id: String(id) } });
    if (!targetUser) return res.status(404).json({ message: "Utilisateur non trouvé" });

    // RBAC: Check same company
    if (currentUser.role !== "SUPER_ADMIN" && targetUser.companyId !== currentUser.companyId) {
      return res.status(403).json({ message: "Non autorisé." });
    }

    await prisma.user.update({
      where: { id: String(id) },
      data: { status: "INACTIVE" } // Using INACTIVE or SUSPENDED. Prisma schema default allows string.
    });

    res.json({ message: "Utilisateur suspendu avec succès." });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suspension", error });
  }
};

export const activateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    if (!currentUser) return res.status(401).json({ message: "Unauthorized" });

    const targetUser = await prisma.user.findUnique({ where: { id: String(id) } });
    if (!targetUser) return res.status(404).json({ message: "Utilisateur non trouvé" });

    // RBAC: Check same company
    if (currentUser.role !== "SUPER_ADMIN" && targetUser.companyId !== currentUser.companyId) {
      return res.status(403).json({ message: "Non autorisé." });
    }

    await prisma.user.update({
      where: { id: String(id) },
      data: { status: "ACTIVE" }
    });

    res.json({ message: "Utilisateur réactivé avec succès." });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la réactivation", error });
  }
};
