import { Request, Response } from "express";
import prisma from "../utils/prisma.js";
import { z } from "zod";
import { createNotification, notifyAdmins } from "../utils/notifications.js";

const createLeaveSchema = z.object({
  type: z.enum(["PAID", "UNPAID", "SICK", "MATERNITY"]),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
  reason: z.string().optional(),
});

const updateLeaveSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});

export const requestLeave = async (req: Request, res: Response): Promise<any> => {
  try {
    const data = createLeaveSchema.parse(req.body);
    const userId = (req as any).user.id;

    if (data.startDate > data.endDate) {
      return res.status(400).json({ message: "La date de début doit être avant la date de fin." });
    }

    const leave = await prisma.leaveRequest.create({
      data: {
        type: data.type,
        startDate: data.startDate,
        endDate: data.endDate,
        reason: data.reason,
        employee: { connect: { id: userId } },
      },
    });

    // Notifier les admins
    const user = (req as any).user;
    const userName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email;
    await notifyAdmins(user.companyId, "Demande de congés", `${userName} a soumis une nouvelle demande de congés.`);

    res.status(201).json(leave);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues });
    }
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

export const getLeaves = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = (req as any).user;
    
    // Si l'utilisateur est un simple employé, il ne voit que ses congés
    if (user.role === "EMPLOYEE") {
      const leaves = await prisma.leaveRequest.findMany({
        where: { employeeId: user.id },
        include: { employee: { select: { firstName: true, lastName: true } }, approver: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' }
      });
      return res.json(leaves);
    }

    // Sinon (HR ou ADMIN), on voit les congés de toute l'entreprise
    const leaves = await prisma.leaveRequest.findMany({
      where: {
        employee: { companyId: user.companyId }
      },
      include: { employee: { select: { firstName: true, lastName: true } }, approver: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(leaves);
  } catch (error: any) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

export const reviewLeave = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = String(req.params.id);
    const { status } = updateLeaveSchema.parse(req.body);
    const user = (req as any).user;
    const approverId = user.id;

    // Vérifier l'existence et l'appartenance du congé
    const leaveExists = await prisma.leaveRequest.findFirst({
      where: {
        id,
        employee: { companyId: user.companyId }
      }
    });

    if (!leaveExists) {
      return res.status(404).json({ message: "Demande de congés introuvable ou accès refusé." });
    }

    const leave = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status,
        approverId,
      },
    });

    // Notifier l'employé
    await createNotification({
      title: "Décision de congés",
      message: `Votre demande de congés du ${new Date(leave.startDate).toLocaleDateString()} a été ${status === 'APPROVED' ? 'acceptée' : 'refusée'}.`,
      userId: leave.employeeId
    });

    res.json(leave);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues });
    }
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};
