import { motion } from 'framer-motion';
import { AlertTriangle, ShieldCheck, UserX, Send } from 'lucide-react';
import { useState } from 'react';

const Conflicts = () => {
  const [isAnonymous, setIsAnonymous] = useState(false);

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Gestion des Conflits</h1>
          <p className="text-gray-400 font-medium mt-1">Un espace sécurisé pour résoudre les tensions en entreprise.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-10 rounded-[2.5rem] border border-white/5">
            <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
              <Send className="w-6 h-6 text-brand-primary" /> Signalement de Conflit
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3">Nature du conflit</label>
                <select className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-brand-primary appearance-none">
                  <option className="bg-brand-900">Différend interpersonnel</option>
                  <option className="bg-brand-900">Harcèlement / Comportement inapproprié</option>
                  <option className="bg-brand-900">Désaccord professionnel</option>
                  <option className="bg-brand-900">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3">Description des faits</label>
                <textarea 
                  className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl text-white font-medium outline-none focus:ring-2 focus:ring-brand-primary h-40 resize-none"
                  placeholder="Décrivez la situation de manière objective..."
                />
              </div>

              <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-dashed border-white/10">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isAnonymous ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-gray-800'}`}>
                    <UserX className={`w-6 h-6 ${isAnonymous ? 'text-white' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">Rester Anonyme</p>
                    <p className="text-xs text-gray-500 font-medium">Votre identité ne sera pas révélée à l'autre partie.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className={`w-14 h-8 rounded-full relative transition-all ${isAnonymous ? 'bg-emerald-500' : 'bg-gray-700'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${isAnonymous ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              <button className="w-full bg-brand-primary text-white py-5 rounded-2xl font-black text-lg uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-primary/20">
                Envoyer le signalement
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-8 rounded-[2.5rem] border border-white/5">
            <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500" /> Vos Signalements
            </h3>
            <p className="text-gray-500 text-sm font-bold italic">Aucun signalement en cours.</p>
          </div>
          
          <div className="glass-card p-8 rounded-[2.5rem] border border-brand-primary/20 bg-brand-primary/5">
            <h3 className="text-lg font-black text-brand-primary mb-3 uppercase tracking-tighter">Charte de Bienveillance</h3>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              Bamousso encourage le dialogue respectueux. Tout signalement abusif pourra faire l'objet d'une demande d'explication.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Conflicts;
