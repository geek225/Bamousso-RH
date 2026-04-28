import { useEffect, useState } from 'react';
import api from '../utils/api';
import { 
  Building2, CheckCircle, Ban, 
  X, Search, Filter, ShieldCheck, UserPlus, 
  Wallet, MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Company {
  id: string;
  name: string;
  plan: 'PIKINI' | 'LOUBA' | 'KORO' | 'PIKIN' | 'BAMOUSSO';
  subscriptionStatus: string;
  subscriptionEndsAt?: string | null;
  createdAt: string;
  isLocked: boolean;
  manager?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  _count?: {
    users: number;
    departments: number;
  };
}

interface SuperAdmin {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

const PLAN_LABELS: Record<string, string> = {
  PIKINI: 'PIKINI',
  LOUBA: 'LOUBA',
  KORO: 'Kôrô',
};

const PLAN_PRICES: Record<string, number> = {
  PIKINI: 50000,
  LOUBA: 150000,
  KORO: 300000,
};

const DashboardSuperAdmin = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  // @ts-ignore - Reserved for future list of admins
  const [superAdmins, setSuperAdmins] = useState<SuperAdmin[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState('ALL');

  // Modal States
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // Forms
  const [newAdmin, setNewAdmin] = useState({ email: '', password: '', firstName: '', lastName: '' });
  const [adminLoading, setAdminLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [compRes, statsRes] = await Promise.all([
        api.get('/admin/companies'),
        api.get('/admin/stats')
      ]);
      setCompanies(compRes.data);
      setSuperAdmins(statsRes.data.superAdmins);
    } catch (error) {
      console.error('Error fetching data', error);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const handleToggleLock = async (company: Company) => {
    try {
      await api.patch(`/admin/companies/${company.id}/toggle-lock`);
      void fetchData();
    } catch (error) {
      console.error('Error toggling lock', error);
    }
  };

  const handleUpdatePlan = async (newPlan: string) => {
    if (!selectedCompany) return;
    try {
      await api.patch(`/admin/companies/${selectedCompany.id}/plan`, { plan: newPlan });
      setIsPlanModalOpen(false);
      void fetchData();
    } catch (error) {
      console.error('Error updating plan', error);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoading(true);
    try {
      await api.post('/admin/super-admins', newAdmin);
      setIsAdminModalOpen(false);
      setNewAdmin({ email: '', password: '', firstName: '', lastName: '' });
      void fetchData();
      alert('Super-Admin créé avec succès');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setAdminLoading(false);
    }
  };

  const filteredCompanies = companies.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterPlan === 'ALL' || c.plan === filterPlan;
    return matchesSearch && matchesFilter;
  });

  const getDaysRemaining = (date?: string | null) => {
    if (!date) return 'Jamais';
    const diff = new Date(date).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Expiré';
    if (days === 0) return 'Aujourd\'hui';
    return `${days} jours`;
  };

  const totalRevenue = companies.reduce((acc, c) => acc + (c.subscriptionStatus === 'ACTIVE' ? PLAN_PRICES[c.plan] : 0), 0);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Illimité';
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-[2.5rem] p-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-brand-primary/20 to-transparent rounded-bl-full pointer-events-none transition-transform group-hover:scale-110 duration-700" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-primary to-brand-accent text-white flex items-center justify-center shadow-2xl shadow-brand-primary/30">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Super-Admin Panel</h1>
              <p className="text-brand-accent font-bold uppercase tracking-[0.3em] text-xs">Gestion globale • Bamousso RH</p>
            </div>
          </div>
          <button 
            onClick={() => setIsAdminModalOpen(true)}
            className="bg-brand-primary hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-brand-primary/20 transition-all active:scale-95 premium-glow"
          >
            <UserPlus className="w-5 h-5" /> Ajouter un Admin
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Entreprises', value: companies.length, icon: Building2, color: 'from-blue-600 to-blue-800' },
          { label: 'Abonnements Actifs', value: companies.filter(c => c.subscriptionStatus === 'ACTIVE').length, icon: CheckCircle, color: 'from-emerald-600 to-emerald-800' },
          { label: 'Revenu Mensuel', value: `${totalRevenue.toLocaleString()} FCFA`, icon: Wallet, color: 'from-amber-600 to-amber-800' },
          { label: 'Suspendus', value: companies.filter(c => c.isLocked).length, icon: Ban, color: 'from-rose-600 to-rose-800' }
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            key={stat.label} className={`glass-card p-8 rounded-[2rem] relative overflow-hidden group`}
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-[3rem] transition-transform group-hover:scale-125 duration-500`} />
            <stat.icon className="w-8 h-8 text-white/20 mb-6" />
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{stat.label}</p>
            <p className="text-3xl font-black text-white tracking-tighter">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="glass-card rounded-[2.5rem] p-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
          <h2 className="text-3xl font-black text-white tracking-tight">Gestion des Entreprises</h2>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input 
                type="text" placeholder="Rechercher..."
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl w-full md:w-72 focus:ring-2 focus:ring-brand-primary text-white font-bold placeholder:text-gray-600"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <select 
                value={filterPlan} onChange={e => setFilterPlan(e.target.value)}
                className="pl-12 pr-10 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-brand-primary appearance-none font-bold text-white cursor-pointer"
              >
                <option value="ALL" className="bg-brand-900">Tous les plans</option>
                <option value="PIKINI" className="bg-brand-900">Pikini</option>
                <option value="LOUBA" className="bg-brand-900">Louba</option>
                <option value="KORO" className="bg-brand-900">Kôrô</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredCompanies.map(company => (
              <motion.div 
                layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                key={company.id} className={`p-8 rounded-[2rem] border transition-all duration-300 group hover:shadow-2xl ${company.isLocked ? 'bg-rose-500/10 border-rose-500/20' : 'bg-white/5 border-white/10 hover:border-brand-primary/30'}`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-black text-white leading-tight group-hover:text-brand-primary transition-colors">{company.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-2 h-2 rounded-full bg-brand-primary shadow-[0_0_8px_rgba(255,87,34,0.8)]" />
                      <span className="text-[10px] font-black text-brand-accent uppercase tracking-[0.2em]">{PLAN_LABELS[company.plan]}</span>
                    </div>
                  </div>
                  <button onClick={() => { setSelectedCompany(company); setIsPlanModalOpen(true); }} className="p-3 hover:bg-white/10 rounded-2xl transition-colors">
                    <MoreVertical className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    <span>Administrateur</span>
                    <span className="text-gray-300">{company.manager?.firstName} {company.manager?.lastName}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    <span>Effectif</span>
                    <span className="text-gray-300 font-black">{company._count?.users || 0} membres</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    <span>Échéance</span>
                    <div className="text-right">
                      <div className="text-brand-accent">{formatDate(company.subscriptionEndsAt)}</div>
                      <div className="text-[9px] text-emerald-500">{getDaysRemaining(company.subscriptionEndsAt)}</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => handleToggleLock(company)}
                    className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all ${company.isLocked ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-rose-600 text-white shadow-lg shadow-rose-600/20 active:scale-95'}`}
                  >
                    {company.isLocked ? 'Réactiver' : 'Suspendre'}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Plan Update Modal */}
      <AnimatePresence>
        {isPlanModalOpen && selectedCompany && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card rounded-[3rem] p-10 max-w-sm w-full shadow-2xl border-white/20">
              <h3 className="text-3xl font-black text-white mb-8 tracking-tight">Changer le plan</h3>
              <div className="space-y-4">
                {Object.keys(PLAN_LABELS).map(p => (
                  <button 
                    key={p} onClick={() => handleUpdatePlan(p)}
                    className={`w-full p-6 rounded-[2rem] border-2 text-left transition-all duration-300 ${selectedCompany.plan === p ? 'border-brand-primary bg-brand-primary/10' : 'border-white/5 hover:border-white/20 bg-white/5'}`}
                  >
                    <p className="font-black text-white text-lg">{PLAN_LABELS[p]}</p>
                    <p className="text-sm text-brand-accent font-bold mt-1">{PLAN_PRICES[p]} FCFA / mois</p>
                  </button>
                ))}
              </div>
              <button onClick={() => setIsPlanModalOpen(false)} className="w-full mt-8 py-4 text-gray-500 font-black hover:text-white transition-colors uppercase tracking-widest text-xs">Annuler</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Creation Modal */}
      <AnimatePresence>
        {isAdminModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card rounded-[3rem] p-10 max-w-md w-full shadow-2xl border-white/20">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-3xl font-black text-white tracking-tight">Nouvel Admin</h3>
                <button onClick={() => setIsAdminModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-6 h-6 text-gray-500" /></button>
              </div>
              <form onSubmit={handleCreateAdmin} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <input required placeholder="Prénom" className="p-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-brand-primary w-full text-white font-bold"
                    value={newAdmin.firstName} onChange={e => setNewAdmin({...newAdmin, firstName: e.target.value})} />
                  <input required placeholder="Nom" className="p-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-brand-primary w-full text-white font-bold"
                    value={newAdmin.lastName} onChange={e => setNewAdmin({...newAdmin, lastName: e.target.value})} />
                </div>
                <input required type="email" placeholder="Email professionnel" className="p-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-brand-primary w-full text-white font-bold"
                  value={newAdmin.email} onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} />
                <input required type="password" placeholder="Mot de passe" className="p-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-brand-primary w-full text-white font-bold"
                  value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} />
                <button disabled={adminLoading} className="w-full py-5 bg-brand-primary hover:bg-orange-600 text-white rounded-2xl font-black shadow-xl shadow-brand-primary/20 active:scale-95 transition-all premium-glow uppercase tracking-widest">
                  {adminLoading ? 'Création...' : 'Créer le compte'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardSuperAdmin;
