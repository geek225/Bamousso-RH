import { Request, Response } from "express";

export const getSalaries = async (req: Request, res: Response) => {
  try {
    // Logique future pour récupérer les salaires
    res.json({ message: "Fonctionnalité Salaires (requiert plan LOUBA)", data: [] });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des salaires", error });
  }
};
