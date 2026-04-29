import { Lock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface LockedFeatureProps {
  featureName: string;
  requiredPlan: string;
  onUpgrade?: () => void;
}

const PLAN_COLORS: Record<string, string> = {
  LOUBA: 'from-orange-400 to-amber-500',
  KORO: 'from-purple-500 to-indigo-600',
};

const PLAN_LABELS: Record<string, string> = {
  FITINI: 'FITINI',
  LOUBA: 'LOUBA',
  KORO: 'Kôrô',
};

const LockedFeature = ({ featureName, requiredPlan, onUpgrade }: LockedFeatureProps) => {
  const gradient = PLAN_COLORS[requiredPlan] || 'from-orange-400 to-amber-500';
  const planLabel = PLAN_LABELS[requiredPlan] || requiredPlan;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[60vh] p-8"
    >
      <div className="max-w-md w-full text-center">
        {/* Icône animée */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${gradient} flex items-center justify-center mx-auto mb-8 shadow-2xl`}
        >
          <Lock className="w-12 h-12 text-white" />
        </motion.div>

        {/* Message */}
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3">
          {featureName} est verrouillé
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
          Cette fonctionnalité est disponible à partir de la formule{' '}
          <span className="font-bold text-orange-500">{planLabel}</span>.
          Passez à la formule supérieure pour y accéder.
        </p>

        {/* Bouton upgrade */}
        <button
          onClick={onUpgrade}
          className={`w-full bg-gradient-to-r ${gradient} text-white py-4 px-8 rounded-2xl font-bold text-lg shadow-xl hover:opacity-90 transition-all hover:scale-105 flex items-center justify-center gap-3`}
        >
          <Zap className="w-5 h-5" />
          Passer à {planLabel}
        </button>

        <p className="mt-4 text-sm text-gray-400">
          Contactez-nous pour upgrader votre formule
        </p>
      </div>
    </motion.div>
  );
};

export default LockedFeature;
