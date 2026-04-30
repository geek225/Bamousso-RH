import { useEffect, useState } from 'react';
import { Clock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface TrialCountdownProps {
  trialEndsAt: string;
}

const TrialCountdown = ({ trialEndsAt }: TrialCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(trialEndsAt) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft(null);
      }
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft();

    return () => clearInterval(timer);
  }, [trialEndsAt]);

  if (!timeLeft) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-brand-primary/10 border border-brand-primary/20 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white shadow-lg animate-pulse">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter">Accès Privilège Actif</p>
          <p className="text-xs text-gray-500 font-bold">Découvrez la puissance de Bamousso Kôrô.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex flex-col items-center min-w-[50px]">
          <span className="text-xl font-black text-brand-primary">{timeLeft.days}</span>
          <span className="text-[10px] uppercase font-black text-gray-400">Jours</span>
        </div>
        <div className="w-[1px] h-8 bg-gray-100 dark:bg-gray-700 mx-1" />
        <div className="flex flex-col items-center min-w-[50px]">
          <span className="text-xl font-black text-brand-primary">{timeLeft.hours.toString().padStart(2, '0')}</span>
          <span className="text-[10px] uppercase font-black text-gray-400">Heures</span>
        </div>
        <div className="w-[1px] h-8 bg-gray-100 dark:bg-gray-700 mx-1" />
        <div className="flex flex-col items-center min-w-[50px]">
          <span className="text-xl font-black text-brand-primary">{timeLeft.minutes.toString().padStart(2, '0')}</span>
          <span className="text-[10px] uppercase font-black text-gray-400">Min</span>
        </div>
        <div className="w-[1px] h-8 bg-gray-100 dark:bg-gray-700 mx-1" />
        <div className="flex flex-col items-center min-w-[50px]">
          <span className="text-xl font-black text-brand-primary text-orange-500">{timeLeft.seconds.toString().padStart(2, '0')}</span>
          <span className="text-[10px] uppercase font-black text-gray-400">Sec</span>
        </div>
      </div>

      <button className="bg-brand-primary text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
        <Zap className="w-4 h-4 fill-current" /> Passer premium
      </button>
    </motion.div>
  );
};

export default TrialCountdown;
