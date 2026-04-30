import { Response } from "express";
import prisma from "../utils/prisma.js";
import { z } from "zod";

const sendMessageSchema = z.object({
  recipientId: z.string().uuid(),
  content: z.string().min(1),
  attachmentUrl: z.string().optional(),
  attachmentType: z.string().optional(),
});

export const getMessages = async (req: any, res: Response) => {
  try {
    const { contactId } = req.params;
    const userId = req.user.id;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, recipientId: contactId },
          { senderId: contactId, recipientId: userId },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ message: "Erreur lors de la récupération des messages", error: error.message });
  }
};

export const sendMessage = async (req: any, res: Response) => {
  try {
    const { recipientId, content, attachmentUrl, attachmentType } = sendMessageSchema.parse(req.body);
    const userId = req.user.id;

    const message = await prisma.message.create({
      data: {
        content,
        senderId: userId,
        recipientId,
        attachmentUrl,
        attachmentType,
      },
    });

    res.status(201).json(message);
  } catch (error: any) {
    res.status(500).json({ message: "Erreur lors de l'envoi du message", error: error.message });
  }
};

export const getContacts = async (req: any, res: Response) => {
  try {
    const user = req.user;

    // 1. Récupérer les employés de la même entreprise
    const employees = await prisma.user.findMany({
      where: {
        companyId: user.companyId,
        id: { not: user.id },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
      },
    });

    // 2. Récupérer un super-admin pour le support
    const superAdmin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      }
    });

    const contacts = employees.map(emp => ({
      id: emp.id,
      name: `${emp.firstName} ${emp.lastName}`,
      role: emp.role,
      isSupport: false
    }));

    if (superAdmin) {
      contacts.unshift({
        id: superAdmin.id,
        name: 'Support Bamousso',
        role: 'SUPER_ADMIN',
        isSupport: true
      });
    }

    res.json(contacts);
  } catch (error: any) {
    res.status(500).json({ message: "Erreur lors de la récupération des contacts", error: error.message });
  }
};
