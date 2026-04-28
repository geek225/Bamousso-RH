import { motion } from 'framer-motion';
import { Banknote, TrendingUp, Download, Eye, Wallet, History } from 'lucide-react';

const Salaries = () => {
  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Gestion des Salaires</h1>
          <p className="text-gray-400 font-medium mt-1">Suivi des rémunérations et fiches de paie.</p>
        </div>
        <div className="flex gap-4">
          <button className="glass-card px-6 py-3 rounded-xl font-bold text-sm text-white flex items-center gap-2 hover:border-brand-primary/50 transition-all">
            <Download className="w-4 h-4" /> Rapport global
          </button>
          <button className="bg-brand-primary text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-brand-primary/20">
            Générer la paie
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-8 rounded-[2rem] border border-white/5 bg-gradient-to-br from-emerald-600/10 to-emerald-900/10">
          <Wallet className="w-8 h-8 text-emerald-500 mb-6" />
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Masse Salariale / Mois</p>
          <p className="text-3xl font-black text-white tracking-tighter">0 FCFA</p>
        </div>
        <div className="glass-card p-8 rounded-[2rem] border border-white/5">
          <TrendingUp className="w-8 h-8 text-brand-primary mb-6" />
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Dernière Augmentation</p>
          <p className="text-3xl font-black text-white tracking-tighter">Aucune</p>
        </div>
        <div className="glass-card p-8 rounded-[2rem] border border-white/5">
          <History className="w-8 h-8 text-brand-accent mb-6" />
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Prochain Virement</p>
          <p className="text-3xl font-black text-white tracking-tighter">-- / --</p>
        </div>
      </div>

      <div className="glass-card p-10 rounded-[2.5rem] border border-white/5">
        <h2 className="text-2xl font-black text-white mb-8">Employés & Rémunérations</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="pb-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Employé</th>
                <th className="pb-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Salaire de base</th>
                <th className="pb-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Dernière Paie</th>
                <th className="pb-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Statut</th>
                <th className="pb-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr>
                <td colSpan={5} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <Banknote className="w-12 h-12 text-gray-800" />
                    <p className="text-gray-600 font-bold">Aucune donnée de paie disponible pour le moment.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Salaries;
