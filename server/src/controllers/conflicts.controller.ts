import { Response } from "express";
import prisma from "../utils/prisma.js";
import { z } from "zod";

const conflictSchema = z.object({
  nature: z.string().min(1),
  description: z.string().min(1),
  isAnonymous: z.boolean().optional().default(false),
});

export const reportConflict = async (req: any, res: Response) => {
  try {
    const { nature, description, isAnonymous } = conflictSchema.parse(req.body);
    const user = req.user;

    const conflict = await prisma.conflictReport.create({
      data: {
        nature,
        description,
        isAnonymous,
        reporterId: user.id,
        companyId: user.companyId,
      },
    });

    res.status(201).json(conflict);
  } catch (error: any) {
    res.status(500).json({ message: "Erreur lors du signalement", error: error.message });
  }
};

export const getConflicts = async (req: any, res: Response) => {
  try {
    const user = req.user;
    
    let whereClause: any = { companyId: user.companyId };
    
    // Si employé, il ne voit que ses propres signalements
    if (user.role === "EMPLOYEE") {
      whereClause.reporterId = user.id;
    }

    const conflicts = await prisma.conflictReport.findMany({
      where: whereClause,
      include: {
        reporter: {
          select: { firstName: true, lastName: true, role: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(conflicts);
  } catch (error: any) {
    res.status(500).json({ message: "Erreur lors de la récupération des conflits", error: error.message });
  }
};

export const updateConflictStatus = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const conflict = await prisma.conflictReport.update({
      where: { id },
      data: { status }
    });
    
    res.json(conflict);
  } catch (error: any) {
    res.status(500).json({ message: "Erreur lors de la mise à jour", error: error.message });
  }
};
