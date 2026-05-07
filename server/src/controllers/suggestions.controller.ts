import { Response } from "express";
import prisma from "../utils/prisma.js";
import { z } from "zod";
import { notifyAdmins } from "../utils/notifications.js";

const suggestionSchema = z.object({
  nature: z.string().min(1),
  description: z.string().min(1),
  isAnonymous: z.boolean().optional().default(false),
});

export const reportSuggestion = async (req: any, res: Response) => {
  try {
    const { nature, description, isAnonymous } = suggestionSchema.parse(req.body);
    const user = req.user;

    const suggestion = await prisma.suggestion.create({
      data: {
        nature,
        description,
        isAnonymous,
        reporterId: user.id,
        companyId: user.companyId,
      },
    });

    // Notifier les admins
    await notifyAdmins(user.companyId, "Nouvelle suggestion", `Une nouvelle suggestion (${nature}) a été déposée.`, "SUGGESTION", suggestion.id);

    res.status(201).json(suggestion);
  } catch (error: any) {
    res.status(500).json({ message: "Erreur lors de l'envoi de la suggestion", error: error.message });
  }
};

export const getSuggestions = async (req: any, res: Response) => {
  try {
    const user = req.user;
    
    let whereClause: any = { companyId: user.companyId };
    
    // Si employé, il ne voit que ses propres suggestions
    if (user.role === "EMPLOYEE") {
      whereClause.reporterId = user.id;
    }

    const suggestions = await prisma.suggestion.findMany({
      where: whereClause,
      include: {
        reporter: {
          select: { firstName: true, lastName: true, role: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(suggestions);
  } catch (error: any) {
    res.status(500).json({ message: "Erreur lors de la récupération des suggestions", error: error.message });
  }
};

export const updateSuggestionStatus = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const suggestion = await prisma.suggestion.update({
      where: { id },
      data: { status }
    });
    
    res.json(suggestion);
  } catch (error: any) {
    res.status(500).json({ message: "Erreur lors de la mise à jour", error: error.message });
  }
};
