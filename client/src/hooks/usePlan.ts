/**
 * Hook usePlan : accès au plan de l'entreprise connectée
 * et vérification des fonctionnalités disponibles.
 */
import { useAuth } from '../context/AuthContext';

// Hiérarchie des plans
const PLAN_LEVEL: Record<string, number> = {
  FITINI: 1,
  PIKIN: 1, // Backward compatibility
  LOUBA: 2,
  BAMOUSSO: 2, // Backward compatibility
  KORO: 3,
};

// Limites d'employés
export const PLAN_MAX_EMPLOYEES: Record<string, number | null> = {
  FITINI: 5,
  PIKIN: 5,
  LOUBA: 20,
  BAMOUSSO: 20,
  KORO: null, // Illimité
};

// Fonctionnalités disponibles par plan minimum requis
const FEATURE_MIN_PLAN: Record<string, string> = {
  employees: 'FITINI',
  leaves: 'FITINI',
  attendance: 'FITINI',
  documents: 'FITINI',
  announcements: 'FITINI',
  departments: 'FITINI',
  tasks: 'FITINI',
  messaging: 'LOUBA',
  analytics: 'LOUBA',
  conflicts: 'LOUBA',
  explanations: 'LOUBA',
  salaries: 'LOUBA',
  api: 'KORO',
  vip_hosting: 'KORO',
  dedicated_support: 'KORO',
};

export const usePlan = () => {
  const { company, user } = useAuth();

  const plan = (company as any)?.plan || 'FITINI';
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const currentLevel = PLAN_LEVEL[plan] || 1;

  /**
   * Vérifie si une fonctionnalité est disponible pour le plan actuel.
   */
  const canUse = (feature: keyof typeof FEATURE_MIN_PLAN): boolean => {
    if (isSuperAdmin) return true;
    const minPlan = FEATURE_MIN_PLAN[feature] || 'FITINI';
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
    return FEATURE_MIN_PLAN[feature] || 'FITINI';
  };

  return { plan, canUse, maxEmployees, requiredPlanFor, isSuperAdmin };
};
