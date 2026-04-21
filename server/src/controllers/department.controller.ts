import type { Request, Response } from "express";
import prisma from "../utils/prisma.js";
import { z } from "zod";
import type { AuthRequest } from "../middleware/auth.js";

const departmentSchema = z.object({
  name: z.string().min(2, "Le nom du département est requis"),
});

export const createDepartment = async (req: AuthRequest, res: Response) => {
  try {
    const { name } = departmentSchema.parse(req.body);
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(400).json({ message: "Utilisateur non rattaché à une entreprise." });
    }

    const newDepartment = await prisma.department.create({
      data: {
        name,
        companyId,
      },
    });

    res.status(201).json(newDepartment);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création du département", error });
  }
};

export const getDepartments = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const where: any = {};
    
    if (user?.role === 'SUPER_ADMIN') {
        if (req.query.companyId) {
            where.companyId = String(req.query.companyId);
        }
    } else {
        if (!user?.companyId) {
            return res.status(400).json({ message: "Utilisateur non rattaché à une entreprise." });
        }
        where.companyId = user.companyId;
    }

    const departments = await prisma.department.findMany({
      where,
      include: {
        _count: {
          select: { employees: true },
        },
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du chargement des départements", error });
  }
};

export const updateDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = departmentSchema.parse(req.body);

    if (!id) return res.status(400).json({ message: "ID manquant" });

    const updatedDepartment = await prisma.department.update({
      where: { id: String(id) },
      data: {
        name,
      },
    });

    res.json(updatedDepartment);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour", error });
  }
};

export const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "ID manquant" });

    await prisma.department.delete({
      where: { id: String(id) },
    });
    res.status(200).json({ message: "Département supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression", error });
  }
};
