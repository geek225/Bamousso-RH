import { Request, Response } from "express";
import prisma from "../utils/prisma.js";
import { z } from "zod";
import type { AuthRequest } from "../middleware/auth.js";

const createTaskSchema = z.object({
  title: z.string().min(1, "Le titre de la tâche est requis"),
  description: z.string().optional(),
  status: z.enum(["A_FAIRE", "EN_COURS", "TERMINEE"]).optional(),
  dueDate: z.coerce.date().optional(),
  assignedToId: z.string().uuid("ID utilisateur assigné invalide").optional().nullable(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1, "Le titre de la tâche est requis").optional(),
  description: z.string().optional(),
  status: z.enum(["A_FAIRE", "EN_COURS", "TERMINEE"]).optional(),
  dueDate: z.coerce.date().optional().nullable(),
  assignedToId: z.string().uuid("ID utilisateur assigné invalide").optional().nullable(),
});

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Non authentifié." });

    const whereClause: any = {};

    // Les SUPER_ADMIN peuvent voir toutes les tâches (potentiellement avec filtrage par companyId)
    // Les autres ne voient que les tâches de leur entreprise
    if (user.role !== "SUPER_ADMIN") {
      whereClause.companyId = user.companyId;
    }
    if (req.query.companyId && user.role === "SUPER_ADMIN") {
      whereClause.companyId = String(req.query.companyId);
    }

    // Filtrer par statut si fourni
    if (req.query.status && typeof req.query.status === 'string') {
      whereClause.status = req.query.status;
    }

    // Filtrer par assigné à (current user ou autre)
    if (req.query.assignedToMe === 'true') {
      whereClause.assignedToId = user.id;
    } else if (req.query.assignedToId && typeof req.query.assignedToId === 'string') {
      whereClause.assignedToId = req.query.assignedToId;
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
        creator: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ message: "Erreur lors de la récupération des tâches", error: error.message });
  }
};

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, status, dueDate, assignedToId } = createTaskSchema.parse(req.body);
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Non authentifié." });
    if (!user.companyId) return res.status(400).json({ message: "Utilisateur non rattaché à une entreprise." });

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        status: status || "A_FAIRE",
        dueDate,
        companyId: user.companyId,
        createdBy: user.id,
        assignedToId,
      },
    });

    res.status(201).json(newTask);
  } catch (error: any) {
    res.status(500).json({ message: "Erreur lors de la création de la tâche", error: error.message });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, status, dueDate, assignedToId } = updateTaskSchema.parse(req.body);
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Non authentifié." });

    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) return res.status(404).json({ message: "Tâche non trouvée." });

    // Vérifier l'appartenance à l'entreprise et les permissions
    if (user.role !== "SUPER_ADMIN" && existingTask.companyId !== user.companyId) {
      return res.status(403).json({ message: "Non autorisé à modifier cette tâche." });
    }

    // Seul le créateur, un COMPANY_ADMIN ou SUPER_ADMIN peut modifier la tâche
    const canModify = user.id === existingTask.createdBy ||
                      user.role === "COMPANY_ADMIN" ||
                      user.role === "SUPER_ADMIN";

    if (!canModify) {
      return res.status(403).json({ message: "Vous n'êtes pas autorisé à modifier cette tâche." });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        status,
        dueDate,
        assignedToId,
      },
    });

    res.json(updatedTask);
  } catch (error: any) {
    res.status(500).json({ message: "Erreur lors de la mise à jour de la tâche", error: error.message });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Non authentifié." });

    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) return res.status(404).json({ message: "Tâche non trouvée." });

    // Vérifier l'appartenance à l'entreprise et les permissions
    if (user.role !== "SUPER_ADMIN" && existingTask.companyId !== user.companyId) {
      return res.status(403).json({ message: "Non autorisé à supprimer cette tâche." });
    }

    // Seul le créateur, un COMPANY_ADMIN ou SUPER_ADMIN peut supprimer la tâche
    const canDelete = user.id === existingTask.createdBy ||
                      user.role === "COMPANY_ADMIN" ||
                      user.role === "SUPER_ADMIN";

    if (!canDelete) {
      return res.status(403).json({ message: "Vous n'êtes pas autorisé à supprimer cette tâche." });
    }

    await prisma.task.delete({ where: { id } });
    res.status(200).json({ message: "Tâche supprimée avec succès." });
  } catch (error: any) {
    res.status(500).json({ message: "Erreur lors de la suppression de la tâche", error: error.message });
  }
};
