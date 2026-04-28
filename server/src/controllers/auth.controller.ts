/**
 * Contrôleur pour la gestion de l'authentification.
 * Gère l'inscription, la connexion et la génération des tokens JWT.
 */
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Prisma } from "@prisma/client";
import prisma from "../utils/prisma.js";
import { z } from "zod";
import { sendResetPasswordEmail } from "../utils/mailer";

// Schéma de validation pour l'inscription d'un utilisateur
const registerSchema = z.object({
  email: z.string().email("Format d'email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  role: z
    .enum([
      "SUPER_ADMIN",
      "COMPANY_ADMIN",
      "HR_MANAGER",
      "HR_ASSISTANT",
      "EMPLOYEE",
    ])
    .optional(),
});

// Schéma de validation pour la connexion
const loginSchema = z.object({
  email: z.string().email("Format d'email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

// Création d'une entreprise + 1er admin (self-serve)
const registerCompanySchema = z.object({
  companyName: z.string().min(2, "Le nom de l'entreprise est requis"),
  email: z.string().email("Format d'email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Format d'email invalide"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(10, "Token invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

/**
 * Enregistre un nouvel utilisateur (principalement utilisé pour les employés par défaut).
 */
export const register = async (req: Request, res: Response) => {
  try {
    // Validation des données entrantes avec Zod
    const { email, password, firstName, lastName, role } = registerSchema.parse(req.body);

    // Vérification si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Cet utilisateur existe déjà" });
    }

    // Cryptage du mot de passe avec Bcrypt (10 rounds de salage)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création de l'utilisateur dans la base de données
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || "EMPLOYEE",
      },
    });

    res.status(201).json({ 
      message: "Utilisateur créé avec succès", 
      user: { id: user.id, email: user.email, role: user.role } 
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'inscription", error });
  }
};

/**
 * Crée une entreprise (tenant) et le premier compte admin entreprise.
 */
export const registerCompany = async (req: Request, res: Response) => {
  try {
    const { companyName, email, password, firstName, lastName } = registerCompanySchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Cet utilisateur existe déjà" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: companyName,
          isActive: true,
          subscriptionStatus: "ACTIVE",
          subscriptionEndsAt: null,
          isLocked: false,
          lockedAt: null,
        },
      });

      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role: "COMPANY_ADMIN",
          companyId: company.id,
          status: "ACTIVE",
        },
      });

      return { company, user };
    });

    const token = jwt.sign(
      { id: result.user.id, role: result.user.role, companyId: result.user.companyId },
      process.env.JWT_SECRET || "secret_par_defaut_a_changer",
      { expiresIn: "1d" }
    );

    res.status(201).json({
      token,
      company: { id: result.company.id, name: result.company.name },
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        companyId: result.user.companyId,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création de l'entreprise", error });
  }
};

/**
 * Mot de passe oublié : génère un token de reset (hashé en DB).
 * Note MVP : l'envoi email n'est pas branché ici (on pourra ajouter SMTP/Sendgrid).
 */
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    // Réponse neutre pour éviter l'énumération d'emails
    if (!user) {
      return res.json({ message: "Si le compte existe, un email de réinitialisation a été envoyé." });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: tokenHash, passwordResetExpiresAt: expiresAt },
    });

    // Envoi de l'email réel via Resend
    const { success, error: mailError } = await sendResetPasswordEmail(email, rawToken);

    if (!success) {
      console.error("Erreur d'envoi email:", mailError);
      // On continue quand même pour ne pas bloquer l'UX, 
      // mais en production l'admin verra l'erreur dans les logs.
    }

    const isProd = process.env.NODE_ENV === "production";

    return res.json({
      message: "Si le compte existe, un email de réinitialisation a été envoyé.",
      ...(isProd ? {} : { devResetToken: rawToken }),
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la demande de réinitialisation", error });
  }
};

/**
 * Réinitialisation mot de passe via token.
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body);
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: tokenHash,
        passwordResetExpiresAt: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Token invalide ou expiré." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
      },
    });

    res.json({ message: "Mot de passe mis à jour avec succès." });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la réinitialisation", error });
  }
};

/**
 * Connecte un utilisateur et génère un token JWT.
 */
export const login = async (req: Request, res: Response) => {
  try {
    // Validation des données de connexion
    const { email, password } = loginSchema.parse(req.body);

    // Recherche de l'utilisateur et inclusion de son entreprise
    const user = await prisma.user.findUnique({
      where: { email },
      include: { company: true },
    });

    if (!user) {
      return res.status(400).json({ message: "Identifiants invalides" });
    }

    // Vérification si l'entreprise est active (sauf pour le Super Admin)
    if (user.company && !user.company.isActive && user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ 
        message: "L'accès à cette entreprise a été suspendu. Veuillez contacter l'administrateur." 
      });
    }

    // Comparaison du mot de passe saisi avec le mot de passe crypté en base
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Identifiants invalides" });
    }

    // Génération du token JWT (valable 1 jour)
    const token = jwt.sign(
      { id: user.id, role: user.role, companyId: user.companyId },
      process.env.JWT_SECRET || "secret_par_defaut_a_changer",
      { expiresIn: "1d" }
    );

    // Retour des informations utilisateur et du token au client
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role, 
        firstName: user.firstName, 
        lastName: user.lastName, 
        companyId: user.companyId,
        status: (user as any).status,
      },
      company: user.company
        ? {
            id: user.company.id,
            name: user.company.name,
            isLocked: (user.company as any).isLocked,
            isActive: user.company.isActive,
          }
        : null,
    });
  } catch (error) {
    console.error("Login error:", error);

    if (error instanceof Prisma.PrismaClientInitializationError) {
      return res.status(500).json({
        message:
          "Connexion base de données impossible. Vérifie DATABASE_URL sur Vercel (idéalement 'Transaction pooler' Supabase + pgbouncer=true) et que le mot de passe DB est correct.",
      });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return res.status(500).json({
        message: "Erreur base de données (Prisma).",
        code: error.code,
      });
    }

    res.status(500).json({ message: "Erreur lors de la connexion" });
  }
};
