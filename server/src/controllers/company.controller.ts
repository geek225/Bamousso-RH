import { Request, Response } from "express";
import prisma from "../utils/prisma.js";
import { uploadToSupabase } from "../utils/supabase.js";

export const createCompany = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, address, plan, extraEmployees } = req.body;
    const company = await prisma.company.create({
      data: { name, address, plan: plan || "FITINI", extraEmployees: extraEmployees || 0, isActive: true }
    });
    res.status(201).json(company);
  } catch (error: any) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

export const getCompanies = async (req: Request, res: Response): Promise<any> => {
  try {
    const companies = await prisma.company.findMany({
      include: { _count: { select: { users: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(companies);
  } catch (error: any) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

export const getCompanyById = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    const company = await prisma.company.findUnique({
      where: { id },
      include: { users: { select: { id: true, firstName: true, lastName: true, email: true, role: true } } }
    });
    if (!company) return res.status(404).json({ message: "Entreprise introuvable." });
    res.json(company);
  } catch (error: any) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

export const updateCompany = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    const { name, address, plan, extraEmployees, isActive } = req.body;
    const company = await prisma.company.update({
      where: { id },
      data: { name, address, plan, extraEmployees, isActive }
    });
    res.json(company);
  } catch (error: any) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

export const deleteCompany = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    await prisma.company.delete({ where: { id } });
    res.json({ message: "Entreprise supprimée avec succès." });
  } catch (error: any) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

export const lockCompany = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    const company = await prisma.company.update({
      where: { id },
      data: { isLocked: true, lockedAt: new Date() }
    });
    res.json(company);
  } catch (error: any) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

export const unlockCompany = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    const company = await prisma.company.update({
      where: { id },
      data: { isLocked: false, lockedAt: null }
    });
    res.json(company);
  } catch (error: any) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

export const updateSubscription = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    const { plan, extraEmployees, subscriptionStatus, subscriptionEndsAt } = req.body;
    const company = await prisma.company.update({
      where: { id },
      data: { plan, extraEmployees, subscriptionStatus, subscriptionEndsAt: subscriptionEndsAt ? new Date(subscriptionEndsAt) : undefined }
    });
    res.json(company);
  } catch (error: any) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

export const updateStatus = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    const { isActive } = req.body;
    const company = await prisma.company.update({
      where: { id },
      data: { isActive }
    });
    res.json(company);
  } catch (error: any) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

export const updateLogo = async (req: Request, res: Response): Promise<any> => {
  try {
    const file = (req as any).file;
    const id = req.params.id as string;
    if (!file) return res.status(400).json({ message: "Aucun fichier fourni." });
    const logoUrl = await uploadToSupabase(file);
    if (!logoUrl) return res.status(500).json({ message: "Erreur lors de l'upload vers Supabase." });
    const company = await prisma.company.update({
      where: { id },
      data: { logoUrl }
    });
    res.json({ message: "Logo mis à jour", logoUrl, company });
  } catch (error: any) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};
