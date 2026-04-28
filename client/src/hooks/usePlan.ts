/**
 * Hook usePlan : accès au plan de l'entreprise connectée
 * et vérification des fonctionnalités disponibles.
 */
import { useAuth } from '../context/AuthContext';

// Hiérarchie des plans
const PLAN_LEVEL: Record<string, number> = {
  PIKIN: 1,
  BAMOUSSO: 2,
  KORO: 3,
};

// Limites d'employés
export const PLAN_MAX_EMPLOYEES: Record<string, number | null> = {
  PIKIN: 20,
  BAMOUSSO: 100,
  KORO: null, // Illimité
};

// Fonctionnalités disponibles par plan minimum requis
const FEATURE_MIN_PLAN: Record<string, string> = {
  employees: 'PIKIN',
  leaves: 'PIKIN',
  attendance: 'PIKIN',
  documents: 'PIKIN',
  announcements: 'PIKIN',
  departments: 'PIKIN',
  messaging: 'BAMOUSSO',
  analytics: 'BAMOUSSO',
  api: 'KORO',
  vip_hosting: 'KORO',
  dedicated_support: 'KORO',
};

export const usePlan = () => {
  const { company, user } = useAuth();

  const plan = (company as any)?.plan || 'PIKIN';
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const currentLevel = PLAN_LEVEL[plan] || 1;

  /**
   * Vérifie si une fonctionnalité est disponible pour le plan actuel.
   */
  const canUse = (feature: keyof typeof FEATURE_MIN_PLAN): boolean => {
    if (isSuperAdmin) return true;
    const minPlan = FEATURE_MIN_PLAN[feature] || 'PIKIN';
    const minLevel = PLAN_LEVEL[minPlan] || 1;
    return currentLevel >= minLevel;
  };

  /**
   * Retourne la limite maximale d'employés (null = illimité).
   */
  const maxEmployees = (): number | null => {
    if (isSuperAdmin) return null;
    return PLAN_MAX_EMPLOYEES[plan] ?? 20;
  };

  /**
   * Retourne le nom du plan requis pour une fonctionnalité.
   */
  const requiredPlanFor = (feature: keyof typeof FEATURE_MIN_PLAN): string => {
    return FEATURE_MIN_PLAN[feature] || 'PIKIN';
  };

  return { plan, canUse, maxEmployees, requiredPlanFor, isSuperAdmin };
};
