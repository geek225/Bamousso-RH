import { Request, Response } from "express";

export const getConflicts = async (req: Request, res: Response) => {
  try {
    // Logique future pour récupérer les conflits
    res.json({ message: "Fonctionnalité Conflits (requiert plan LOUBA)", data: [] });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des conflits", error });
  }
};
