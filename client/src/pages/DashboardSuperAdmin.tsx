import { useEffect, useState } from 'react';
import api from '../utils/api';
import { Building2, CheckCircle, Ban, Lock, Unlock, Calendar, Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Company {
  id: string;
  name: string;
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

const DashboardSuperAdmin = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // Sub Form
  const [subMonths, setSubMonths] = useState(1);
  const [subLoading, setSubLoading] = useState(false);

  // Notif Form
  const [notifMessage, setNotifMessage] = useState('');
  const [notifLoading, setNotifLoading] = useState(false);

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/companies');
      setCompanies(res.data);
    } catch (error) {
      console.error('Error fetching companies', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchCompanies();
  }, []);

  const handleToggleLock = async (id: string, isLocked: boolean) => {
    // Update local state instantly for UI responsiveness
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, isLocked: !isLocked } : c));

    try {
      if (isLocked) {
        await api.post(`/companies/${id}/unlock`);
      } else {
        await api.post(`/companies/${id}/lock`);
      }
      void fetchCompanies();
    } catch (error) {
      console.error('Error toggling lock', error);
      // Revert state if failed
      setCompanies(prev => prev.map(c => c.id === id ? { ...c, isLocked: isLocked } : c));
    }
  };

  const handleUpdateSubscription = async () => {
    if (!selectedCompany) return;
    setSubLoading(true);
    try {
      const currentEnd = selectedCompany.subscriptionEndsAt 
        ? new Date(selectedCompany.subscriptionEndsAt) 
        : new Date();
      
      const newEnd = new Date(currentEnd);
      newEnd.setMonth(newEnd.getMonth() + subMonths);

      await api.put(`/companies/${selectedCompany.id}/subscription`, {
        subscriptionEndsAt: newEnd.toISOString(),
        subscriptionStatus: 'ACTIVE'
      });
      
      if (selectedCompany.isLocked) {
        await api.post(`/companies/${selectedCompany.id}/unlock`);
      }

      setIsSubModalOpen(false);
      void fetchCompanies();
      alert(`Abonnement prolongé de ${subMonths} mois.`);
    } catch (error) {
      console.error(error);
      alert('Erreur lors du renouvellement');
    } finally {
      setSubLoading(false);
    }
  };

  const handleSendNotification = async () => {
    if (!selectedCompany || !notifMessage) return;
    setNotifLoading(true);
    try {
      await api.post('/notifications/broadcast', {
        title: 'Message du Super-Admin',
        message: notifMessage,
        targetRoles: ['COMPANY_ADMIN'],
        targetCompanyIds: [selectedCompany.id]
      });
      setIsNotifModalOpen(false);
      setNotifMessage('');
      alert('Message envoyé avec succès au PDG.');
    } catch (error) {
      console.error(error);
      alert('Erreur lors de l\'envoi');
    } finally {
      setNotifLoading(false);
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Essai gratuit / Illimité';
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header animé et personnalisé */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-orange-400/20 to-transparent rounded-bl-full pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 text-white flex items-center justify-center shadow-lg shadow-orange-500/30">
              <span className="text-2xl font-bold">SA</span>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3 mb-1">
                Espace Super-Admin 👑
              </h1>
              <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2 font-medium">
                <Building2 className="w-4 h-4" /> Vision Globale du SaaS NexTeam
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-3xl shadow-lg text-white relative overflow-hidden">
          <Building2 className="absolute right-4 top-4 w-16 h-16 opacity-20" />
          <div className="text-blue-100 font-semibold mb-2">Entreprises Clientes</div>
          <div className="text-4xl font-extrabold">{companies.length}</div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-3xl shadow-lg text-white relative overflow-hidden">
          <CheckCircle className="absolute right-4 top-4 w-16 h-16 opacity-20" />
          <div className="text-green-100 font-semibold mb-2">Abonnements Actifs</div>
          <div className="text-4xl font-extrabold">
            {companies.filter(c => c.subscriptionStatus === 'ACTIVE' && !c.isLocked).length}
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-3xl shadow-lg text-white relative overflow-hidden">
          <Ban className="absolute right-4 top-4 w-16 h-16 opacity-20" />
          <div className="text-red-100 font-semibold mb-2">Comptes Suspendus</div>
          <div className="text-4xl font-extrabold">
            {companies.filter(c => c.isLocked).length}
          </div>
        </motion.div>
      </div>

      <div className="pt-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Liste des Abonnés SaaS</h2>
        
        {isLoading ? (
          <div className="text-center text-gray-500 py-12">Chargement des données...</div>
        ) : companies.length === 0 ? (
          <div className="text-center bg-white dark:bg-gray-800 p-12 rounded-3xl shadow-sm text-gray-500">
            Aucune entreprise inscrite pour le moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                key={company.id} 
                className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col justify-between hover:-translate-y-1 transition-transform"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate" title={company.name}>{company.name}</h3>
                    {company.isLocked ? (
                      <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-lg text-xs font-bold uppercase shrink-0">
                        <Ban className="w-3 h-3" /> Suspendu
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-lg text-xs font-bold uppercase shrink-0">
                        <CheckCircle className="w-3 h-3" /> Actif
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Responsable :</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-200">
                        {company.manager ? `${company.manager.firstName} ${company.manager.lastName}` : 'Aucun'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Inscrit le :</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {formatDate(company.createdAt)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Fin d'abonnement :</span>
                      <span className={`font-bold ${
                        company.subscriptionEndsAt && new Date(company.subscriptionEndsAt) < new Date() 
                          ? 'text-red-500 bg-red-50 px-2 rounded-md' 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {formatDate(company.subscriptionEndsAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => { setSelectedCompany(company); setIsSubModalOpen(true); }}
                      className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                    >
                      <Calendar className="w-4 h-4" /> Gérer l'Abo
                    </button>
                    <button 
                      onClick={() => { setSelectedCompany(company); setIsNotifModalOpen(true); }}
                      className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
                    >
                      <Send className="w-4 h-4" /> Rappel
                    </button>
                  </div>
                  <button 
                    onClick={() => handleToggleLock(company.id, company.isLocked)}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      company.isLocked 
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50' 
                        : 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/50'
                    }`}
                  >
                    {company.isLocked ? <><Unlock className="w-5 h-5" /> Réactiver l'Accès</> : <><Lock className="w-5 h-5" /> Suspendre l'Accès</>}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      {/* Modale d'Abonnement */}
      <AnimatePresence>
        {isSubModalOpen && selectedCompany && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-2xl max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold dark:text-white">Gérer l'Abonnement</h3>
                <button onClick={() => setIsSubModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6"/></button>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
                Entreprise : <span className="font-bold">{selectedCompany.name}</span><br/>
                Fin actuelle : {formatDate(selectedCompany.subscriptionEndsAt)}
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ajouter (mois)</label>
                <select 
                  value={subMonths} 
                  onChange={(e) => setSubMonths(Number(e.target.value))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                >
                  <option value={1}>+ 1 mois (Mensuel)</option>
                  <option value={3}>+ 3 mois (Trimestriel)</option>
                  <option value={12}>+ 12 mois (Annuel)</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setIsSubModalOpen(false)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200">Annuler</button>
                <button 
                  onClick={handleUpdateSubscription} 
                  disabled={subLoading}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex justify-center items-center"
                >
                  {subLoading ? 'En cours...' : 'Prolonger'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modale de Notification */}
      <AnimatePresence>
        {isNotifModalOpen && selectedCompany && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-2xl max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold dark:text-white">Envoyer un Rappel</h3>
                <button onClick={() => setIsNotifModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6"/></button>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                Destinataire : <span className="font-bold">Admin de {selectedCompany.name}</span>
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message</label>
                <textarea 
                  rows={4}
                  value={notifMessage} 
                  onChange={(e) => setNotifMessage(e.target.value)}
                  placeholder="Ex: Votre abonnement arrive à expiration le..."
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                ></textarea>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setIsNotifModalOpen(false)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200">Annuler</button>
                <button 
                  onClick={handleSendNotification} 
                  disabled={notifLoading || !notifMessage}
                  className="flex-1 px-4 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 flex justify-center items-center disabled:opacity-50"
                >
                  {notifLoading ? 'Envoi...' : 'Envoyer'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardSuperAdmin;
