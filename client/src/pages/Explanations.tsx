import { motion } from 'framer-motion';
import { FileWarning, Send, History, CheckCircle2, AlertCircle } from 'lucide-react';

const Explanations = () => {
  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Demandes d'Explication</h1>
          <p className="text-gray-400 font-medium mt-1">Gérez les procédures disciplinaires avec rigueur et transparence.</p>
        </div>
        <button className="bg-brand-primary text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-brand-primary/20 flex items-center gap-2">
          <Send className="w-5 h-5" /> Nouvelle Demande
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="glass-card p-8 rounded-[2rem] border border-white/5">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">En attente de réponse</p>
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <p className="text-3xl font-black text-white">0</p>
          </div>
        </div>
        <div className="glass-card p-8 rounded-[2rem] border border-white/5">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Clôturées</p>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <p className="text-3xl font-black text-white">0</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-10 rounded-[2.5rem] border border-white/5 overflow-hidden">
        <div className="flex items-center gap-4 mb-10">
          <History className="w-6 h-6 text-brand-primary" />
          <h2 className="text-2xl font-black text-white tracking-tight">Historique des Demandes</h2>
        </div>
        
        <div className="space-y-4">
          <div className="p-8 bg-white/5 rounded-3xl border border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 group hover:bg-white/10 transition-all">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                <FileWarning className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Absence non justifiée</h3>
                <p className="text-sm text-gray-500">Exemple de demande pré-remplie pour le test.</p>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Date d'émission</p>
                <p className="text-sm text-white font-bold">-- / -- / ----</p>
              </div>
              <span className="px-5 py-2 bg-amber-500/10 text-amber-500 rounded-full text-[10px] font-black uppercase tracking-widest">En attente</span>
            </div>
          </div>

          <div className="py-20 text-center">
            <p className="text-gray-600 font-bold italic">Aucune autre demande à afficher.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explanations;
