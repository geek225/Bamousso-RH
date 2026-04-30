import { motion } from 'framer-motion';
import { ShieldCheck, UserX, Send, MessageSquare, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

interface Conflict {
  id: string;
  nature: string;
  description: string;
  isAnonymous: boolean;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
  reporter?: {
    firstName: string;
    lastName: string;
  };
}

const Conflicts = () => {
  const { user } = useAuth();
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [nature, setNature] = useState('Différend interpersonnel');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isAdmin = user?.role === 'COMPANY_ADMIN' || user?.role === 'HR_MANAGER';

  const fetchConflicts = async () => {
    try {
      const res = await api.get('/conflicts');
      setConflicts(res.data);
    } catch (error) {
      console.error('Error fetching conflicts', error);
    }
  };

  useEffect(() => {
    void fetchConflicts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/conflicts', { nature, description, isAnonymous });
      setNature('Différend interpersonnel');
      setDescription('');
      setIsAnonymous(false);
      void fetchConflicts();
      alert('Votre signalement a été envoyé en toute sécurité.');
    } catch (error) {
      console.error('Error reporting conflict', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/conflicts/${id}`, { status });
      void fetchConflicts();
    } catch (error) {
      console.error('Error updating status', error);
    }
  };

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
          {!isAdmin ? (
            // VUE EMPLOYÉ : Formulaire de signalement
            <div className="glass-card p-10 rounded-[2.5rem] border border-white/5">
              <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                <Send className="w-6 h-6 text-brand-primary" /> Signalement de Conflit
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3">Nature du conflit</label>
                  <select 
                    value={nature}
                    onChange={e => setNature(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-brand-primary appearance-none"
                  >
                    <option className="bg-brand-900">Différend interpersonnel</option>
                    <option className="bg-brand-900">Harcèlement / Comportement inapproprié</option>
                    <option className="bg-brand-900">Désaccord professionnel</option>
                    <option className="bg-brand-900">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3">Description des faits</label>
                  <textarea 
                    required
                    value={description}
                    onChange={e => setDescription(e.target.value)}
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
                    type="button"
                    onClick={() => setIsAnonymous(!isAnonymous)}
                    className={`w-14 h-8 rounded-full relative transition-all ${isAnonymous ? 'bg-emerald-500' : 'bg-gray-700'}`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${isAnonymous ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                <button 
                  disabled={isLoading}
                  type="submit" 
                  className="w-full bg-brand-primary text-white py-5 rounded-2xl font-black text-lg uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-primary/20 flex justify-center items-center"
                >
                  {isLoading ? 'Envoi...' : 'Envoyer le signalement'}
                </button>
              </form>
            </div>
          ) : (
            // VUE ADMIN : Liste des signalements
            <div className="space-y-6">
              {conflicts.map((conflict) => (
                <div key={conflict.id} className="glass-card p-8 rounded-[2rem] border border-white/5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        conflict.status === 'OPEN' ? 'bg-rose-500/20 text-rose-500' : 
                        conflict.status === 'IN_PROGRESS' ? 'bg-amber-500/20 text-amber-500' : 
                        'bg-emerald-500/20 text-emerald-500'
                      }`}>
                        {conflict.status}
                      </div>
                      <span className="text-xs text-gray-500 font-bold">{new Date(conflict.createdAt).toLocaleString('fr-FR')}</span>
                    </div>
                    <div className="flex gap-2">
                      {conflict.status !== 'RESOLVED' && (
                        <button 
                          onClick={() => updateStatus(conflict.id, conflict.status === 'OPEN' ? 'IN_PROGRESS' : 'RESOLVED')}
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-[10px] font-black text-white uppercase tracking-widest rounded-xl transition-all"
                        >
                          {conflict.status === 'OPEN' ? 'Prendre en charge' : 'Marquer comme résolu'}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-black text-white mb-2">{conflict.nature}</h3>
                    <p className="text-gray-400 font-medium leading-relaxed">{conflict.description}</p>
                  </div>
                  
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                        {conflict.isAnonymous ? <UserX className="w-4 h-4 text-gray-500" /> : <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                      </div>
                      <span className="text-xs font-bold text-gray-500">
                        Signalé par : {conflict.isAnonymous ? 'Anonyme' : `${conflict.reporter?.firstName} ${conflict.reporter?.lastName}`}
                      </span>
                    </div>
                    <button className="flex items-center gap-2 text-brand-primary text-xs font-black uppercase tracking-widest hover:underline">
                      <MessageSquare className="w-4 h-4" /> Ouvrir le chat
                    </button>
                  </div>
                </div>
              ))}
              {conflicts.length === 0 && (
                <div className="glass-card p-20 text-center rounded-[2.5rem] border border-dashed border-white/10">
                  <ShieldCheck className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-500 font-bold">Aucun conflit signalé pour le moment.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="glass-card p-8 rounded-[2.5rem] border border-white/5">
            <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500" /> {isAdmin ? 'Suivi Interne' : 'Vos Signalements'}
            </h3>
            {!isAdmin ? (
              <div className="space-y-4">
                {conflicts.map(c => (
                  <div key={c.id} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-white font-bold text-sm line-clamp-1">{c.nature}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[10px] text-gray-500 font-bold">{new Date(c.createdAt).toLocaleDateString()}</span>
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                        c.status === 'OPEN' ? 'text-rose-500' : 'text-emerald-500'
                      }`}>{c.status}</span>
                    </div>
                  </div>
                ))}
                {conflicts.length === 0 && <p className="text-gray-500 text-sm font-bold italic">Aucun signalement en cours.</p>}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                  <Info className="w-5 h-5 text-emerald-500 shrink-0" />
                  <p className="text-[10px] text-emerald-500/80 font-bold leading-tight">
                    En tant qu'administrateur, vous recevez les signalements et pouvez agir pour résoudre les tensions.
                  </p>
                </div>
              </div>
            )}
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
