import { Request, Response } from "express";
import prisma from "../utils/prisma.js";

export const createAnnouncement = async (req: Request, res: Response): Promise<any> => {
  try {
    const { title, content, category } = req.body;
    const authorId = (req as any).user.id;

    const post = await prisma.forumPost.create({
      data: {
        title,
        content,
        category: category || "ANNOUNCEMENT",
        authorId
      }
    });

    res.status(201).json(post);
  } catch (error: any) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

export const getAnnouncements = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = (req as any).user;
    
    // Tout le monde dans l'entreprise voit les annonces
    const posts = await prisma.forumPost.findMany({
      where: {
        author: { companyId: user.companyId }
      },
      include: { 
        author: { select: { firstName: true, lastName: true, jobTitle: true, role: true } },
        comments: { include: { author: { select: { firstName: true, lastName: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(posts);
  } catch (error: any) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};
