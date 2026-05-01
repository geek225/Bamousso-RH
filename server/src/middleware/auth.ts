import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../utils/prisma.js";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    companyId?: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ message: "Internal server error: Security configuration missing." });
    }

    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded as any;

    // Verrouillage entreprise (blocage total) : bypass SUPER_ADMIN
    if (req.user?.role !== "SUPER_ADMIN") {
      if (!req.user?.companyId) {
        return res.status(403).json({ message: "Entreprise non associée à ce compte." });
      }

      const company = await prisma.company.findUnique({
        where: { id: req.user.companyId },
        select: { isActive: true, isLocked: true, trialEndsAt: true } as any,
      });

      // Blocage strict : Si l'entreprise est inactive, on refuse tout accès 
      // SAUF pour la route /auth/me qui permet au frontend de vérifier si le paiement est validé.
      if (!company || !company.isActive) {
        const isAuthMe = req.path === '/me' || req.originalUrl.includes('/auth/me');
        if (!isAuthMe || req.user.role !== "COMPANY_ADMIN") {
          return res.status(403).json({ message: "Compte en attente d'activation. Veuillez finaliser votre paiement." });
        }
      }

      // Vérification essai expiré
      const isTrialExpired = (company as any).trialEndsAt && new Date() > (company as any).trialEndsAt;
      if (isTrialExpired && req.user.role !== "COMPANY_ADMIN") {
        return res.status(403).json({ 
          code: "TRIAL_EXPIRED",
          message: "La période d'essai de 7 jours est terminée. Veuillez contacter votre administrateur." 
        });
      }

      if (company.isLocked) {
        return res.status(423).json({
          code: "COMPANY_LOCKED",
          message: "Accès suspendu : l'entreprise est verrouillée (abonnement / non-paiement).",
        });
      }
    }

    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token." });
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied." });
    }
    next();
  };
};
