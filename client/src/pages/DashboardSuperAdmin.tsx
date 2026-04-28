import { useEffect, useState } from 'react';
import api from '../utils/api';
import { 
  Building2, CheckCircle, Ban, Lock, Unlock, Calendar, 
  Send, X, Search, Filter, ShieldCheck, UserPlus, 
  TrendingUp, Wallet, Zap, MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Company {
  id: string;
  name: string;
  plan: 'PIKIN' | 'BAMOUSSO' | 'KORO';
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
  PIKIN: 'Pikin (Débutant)',
  BAMOUSSO: 'Bamousso (Maman)',
  KORO: 'Koro (Ancien)',
};

const PLAN_PRICES: Record<string, number> = {
  PIKIN: 200,
  BAMOUSSO: 300,
  KORO: 400,
};

const DashboardSuperAdmin = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [superAdmins, setSuperAdmins] = useState<SuperAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState('ALL');

  // Modal States
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // Forms
  const [subMonths, setSubMonths] = useState(1);
  const [subLoading, setSubLoading] = useState(false);
  const [notifMessage, setNotifMessage] = useState('');
  const [notifLoading, setNotifLoading] = useState(false);
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
    } finally {
      setIsLoading(false);
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

  const totalRevenue = companies.reduce((acc, c) => acc + (c.subscriptionStatus === 'ACTIVE' ? PLAN_PRICES[c.plan] : 0), 0);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Illimité';
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-orange-400/20 to-transparent rounded-bl-full pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 text-white flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">Super-Admin Panel</h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Gestion globale de Bamousso RH</p>
            </div>
          </div>
          <button 
            onClick={() => setIsAdminModalOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95"
          >
            <UserPlus className="w-5 h-5" /> Ajouter un Admin
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-500 p-6 rounded-3xl shadow-lg text-white">
          <Building2 className="w-10 h-10 opacity-20 mb-4" />
          <p className="text-blue-100 text-sm font-bold uppercase">Entreprises</p>
          <p className="text-4xl font-black">{companies.length}</p>
        </div>
        <div className="bg-green-500 p-6 rounded-3xl shadow-lg text-white">
          <CheckCircle className="w-10 h-10 opacity-20 mb-4" />
          <p className="text-green-100 text-sm font-bold uppercase">Abonnements Actifs</p>
          <p className="text-4xl font-black">{companies.filter(c => c.subscriptionStatus === 'ACTIVE').length}</p>
        </div>
        <div className="bg-purple-500 p-6 rounded-3xl shadow-lg text-white">
          <Wallet className="w-10 h-10 opacity-20 mb-4" />
          <p className="text-purple-100 text-sm font-bold uppercase">Revenu Mensuel</p>
          <p className="text-4xl font-black">{totalRevenue.toLocaleString()} FCFA</p>
        </div>
        <div className="bg-red-500 p-6 rounded-3xl shadow-lg text-white">
          <Ban className="w-10 h-10 opacity-20 mb-4" />
          <p className="text-red-100 text-sm font-bold uppercase">Suspendus</p>
          <p className="text-4xl font-black">{companies.filter(c => c.isLocked).length}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">Gestion des Entreprises</h2>
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" placeholder="Rechercher..."
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl w-full md:w-64 focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select 
                value={filterPlan} onChange={e => setFilterPlan(e.target.value)}
                className="pl-12 pr-8 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 appearance-none font-bold text-gray-700 dark:text-gray-200"
              >
                <option value="ALL">Tous les plans</option>
                <option value="PIKIN">Pikin</option>
                <option value="BAMOUSSO">Bamousso</option>
                <option value="KORO">Koro</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredCompanies.map(company => (
              <motion.div 
                layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                key={company.id} className={`p-6 rounded-3xl border transition-all ${company.isLocked ? 'bg-red-50/50 border-red-100' : 'bg-gray-50 dark:bg-gray-700/30 border-gray-100 dark:border-gray-700'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{company.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Zap className="w-3 h-3 text-orange-500" />
                      <span className="text-xs font-black text-orange-600 uppercase tracking-wider">{PLAN_LABELS[company.plan]}</span>
                    </div>
                  </div>
                  <button onClick={() => { setSelectedCompany(company); setIsPlanModalOpen(true); }} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors">
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-xs font-bold text-gray-500 uppercase">
                    <span>Admin</span>
                    <span className="text-gray-900 dark:text-gray-300">{company.manager?.firstName} {company.manager?.lastName}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-gray-500 uppercase">
                    <span>Employés</span>
                    <span className="text-gray-900 dark:text-gray-300">{company._count?.users || 0}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-gray-500 uppercase">
                    <span>Expire le</span>
                    <span className="text-gray-900 dark:text-gray-300">{formatDate(company.subscriptionEndsAt)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleToggleLock(company)}
                    className={`flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${company.isLocked ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 'bg-red-600 text-white shadow-lg shadow-red-600/20'}`}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Changer le plan</h3>
              <div className="space-y-4">
                {Object.keys(PLAN_LABELS).map(p => (
                  <button 
                    key={p} onClick={() => handleUpdatePlan(p)}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${selectedCompany.plan === p ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-100 dark:border-gray-700 hover:border-orange-200'}`}
                  >
                    <p className="font-black text-gray-900 dark:text-white">{PLAN_LABELS[p]}</p>
                    <p className="text-sm text-gray-500">{PLAN_PRICES[p]} FCFA / mois</p>
                  </button>
                ))}
              </div>
              <button onClick={() => setIsPlanModalOpen(false)} className="w-full mt-6 py-4 text-gray-400 font-bold hover:text-gray-600">Annuler</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Creation Modal */}
      <AnimatePresence>
        {isAdminModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">Nouveau Super-Admin</h3>
                <button onClick={() => setIsAdminModalOpen(false)}><X className="w-6 h-6 text-gray-400" /></button>
              </div>
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input required placeholder="Prénom" className="p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 w-full"
                    value={newAdmin.firstName} onChange={e => setNewAdmin({...newAdmin, firstName: e.target.value})} />
                  <input required placeholder="Nom" className="p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 w-full"
                    value={newAdmin.lastName} onChange={e => setNewAdmin({...newAdmin, lastName: e.target.value})} />
                </div>
                <input required type="email" placeholder="Email" className="p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 w-full"
                  value={newAdmin.email} onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} />
                <input required type="password" placeholder="Mot de passe" className="p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 w-full"
                  value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} />
                <button disabled={adminLoading} className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black shadow-lg shadow-orange-500/20 active:scale-95 transition-all">
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
