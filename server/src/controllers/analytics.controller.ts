/**
 * Contrôleur Analytics RH - Formule Bamousso et Koro uniquement.
 * Fournit des données agrégées pour les graphiques du tableau de bord.
 */
import type { Response } from "express";
import prisma from "../utils/prisma.js";
import type { AuthRequest } from "../middleware/auth.js";

/**
 * Résumé global RH : taux d'absentéisme, effectifs, heures travaillées.
 */
export const getAnalyticsSummary = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const user = req.user;
    if (!user?.companyId) return res.status(400).json({ message: "Entreprise requise." });

    const companyId = user.companyId;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [totalEmployees, activeEmployees, totalAttendances, absentDays, pendingLeaves, approvedLeaves] = await Promise.all([
      // Total employés
      prisma.user.count({ where: { companyId, role: { not: 'SUPER_ADMIN' } } }),
      // Employés actifs
      prisma.user.count({ where: { companyId, status: 'ACTIVE', role: { not: 'SUPER_ADMIN' } } }),
      // Pointages ce mois
      prisma.attendance.count({
        where: {
          employee: { companyId },
          date: { gte: startOfMonth, lte: endOfMonth },
          status: 'PRESENT'
        }
      }),
      // Absences ce mois
      prisma.attendance.count({
        where: {
          employee: { companyId },
          date: { gte: startOfMonth, lte: endOfMonth },
          status: 'ABSENT'
        }
      }),
      // Congés en attente
      prisma.leaveRequest.count({
        where: { employee: { companyId }, status: 'PENDING' }
      }),
      // Congés approuvés ce mois
      prisma.leaveRequest.count({
        where: {
          employee: { companyId },
          status: 'APPROVED',
          startDate: { gte: startOfMonth }
        }
      }),
    ]);

    // Calcul du taux d'absentéisme
    const totalDays = totalAttendances + absentDays;
    const absenteeismRate = totalDays > 0 ? Math.round((absentDays / totalDays) * 100) : 0;

    res.json({
      totalEmployees,
      activeEmployees,
      absenteeismRate,
      totalAttendances,
      absentDays,
      pendingLeaves,
      approvedLeaves,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Erreur analytics.", error: error.message });
  }
};

/**
 * Congés par mois sur les 12 derniers mois.
 */
export const getLeavesPerMonth = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const user = req.user;
    if (!user?.companyId) return res.status(400).json({ message: "Entreprise requise." });

    const companyId = user.companyId;
    const months = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const count = await prisma.leaveRequest.count({
        where: {
          employee: { companyId },
          startDate: { gte: start, lte: end }
        }
      });

      months.push({
        month: date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
        count
      });
    }

    res.json(months);
  } catch (error: any) {
    res.status(500).json({ message: "Erreur analytics.", error: error.message });
  }
};

/**
 * Tendance des présences sur les 4 dernières semaines.
 */
export const getAttendanceTrend = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const user = req.user;
    if (!user?.companyId) return res.status(400).json({ message: "Entreprise requise." });

    const companyId = user.companyId;
    const weeks = [];
    const now = new Date();

    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7) - now.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const [present, absent] = await Promise.all([
        prisma.attendance.count({
          where: {
            employee: { companyId },
            date: { gte: weekStart, lte: weekEnd },
            status: 'PRESENT'
          }
        }),
        prisma.attendance.count({
          where: {
            employee: { companyId },
            date: { gte: weekStart, lte: weekEnd },
            status: 'ABSENT'
          }
        }),
      ]);

      weeks.push({
        week: `Sem. ${weekStart.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}`,
        present,
        absent,
      });
    }

    res.json(weeks);
  } catch (error: any) {
    res.status(500).json({ message: "Erreur analytics.", error: error.message });
  }
};

/**
 * Évolution des effectifs sur les 6 derniers mois.
 */
export const getWorkforceEvolution = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const user = req.user;
    if (!user?.companyId) return res.status(400).json({ message: "Entreprise requise." });

    const companyId = user.companyId;
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endOfThatMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

      const count = await prisma.user.count({
        where: {
          companyId,
          role: { not: 'SUPER_ADMIN' },
          createdAt: { lte: endOfThatMonth }
        }
      });

      months.push({
        month: date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
        total: count
      });
    }

    res.json(months);
  } catch (error: any) {
    res.status(500).json({ message: "Erreur analytics.", error: error.message });
  }
};
