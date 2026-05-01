import { Request, Response } from "express";
import prisma from "../utils/prisma.js";
import { uploadToSupabase } from "../utils/supabase.js";

export const uploadLogo = async (req: Request, res: Response): Promise<any> => {
  try {
    const file = (req as any).file;
    const user = (req as any).user;

    if (!file) {
      return res.status(400).json({ message: "Aucun fichier fourni." });
    }

    // Upload vers Supabase Storage
    const logoUrl = await uploadToSupabase(file);

    if (!logoUrl) {
      return res.status(500).json({ message: "Erreur lors de l'upload du logo vers Supabase." });
    }

    // Mettre à jour l'entreprise
    const company = await prisma.company.update({
      where: { id: user.companyId },
      data: { logoUrl }
    });

    res.json({ message: "Logo mis à jour avec succès", logoUrl, company });
  } catch (error: any) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};
