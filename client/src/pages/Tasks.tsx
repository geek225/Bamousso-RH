import { motion } from 'framer-motion';
import { ListTodo, Plus, Clock, CheckCircle2 } from 'lucide-react';

const Tasks = () => {
  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Gestion des Tâches</h1>
          <p className="text-gray-400 font-medium mt-1">Organisez le travail de vos équipes au quotidien.</p>
        </div>
        <button className="bg-brand-primary hover:bg-brand-800 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-brand-primary/20 flex items-center gap-2">
          <Plus className="w-5 h-5" /> Nouvelle Tâche
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-card p-8 rounded-[2.5rem] border border-white/5">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Clock className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-white">À Faire</h2>
          </div>
          <div className="space-y-4">
            <p className="text-gray-500 text-sm font-bold italic">Aucune tâche en attente.</p>
          </div>
        </div>

        <div className="glass-card p-8 rounded-[2.5rem] border border-white/5">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
              <ListTodo className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-white">En Cours</h2>
          </div>
          <div className="space-y-4">
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <h3 className="text-white font-bold mb-1">Finaliser le rapport RH</h3>
              <p className="text-xs text-gray-500 uppercase tracking-widest font-black">Échéance : Demain</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-8 rounded-[2.5rem] border border-white/5">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-white">Terminé</h2>
          </div>
          <div className="space-y-4">
            <p className="text-gray-500 text-sm font-bold italic">Historique vide.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
