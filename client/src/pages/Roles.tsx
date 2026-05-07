import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { usePlan } from '../hooks/usePlan';
import { Shield, Plus, Trash2, CheckCircle2, AlertTriangle, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';
import LockedFeature from '../components/LockedFeature';

interface Role {
  id: string;
  name: string;
  permissions: string[];
  _count: { users: number };
}

const AVAILABLE_PERMISSIONS = [
  { id: 'MANAGE_EMPLOYEES', label: 'Gérer les employés', desc: 'Ajouter, modifier ou supprimer des profils.' },
  { id: 'MANAGE_LEAVES', label: 'Gérer les congés', desc: 'Approuver ou refuser les demandes.' },
  { id: 'MANAGE_ATTENDANCE', label: 'Gérer le pointage', desc: 'Voir et modifier l\'historique des présences.' },
  { id: 'MANAGE_PAYROLL', label: 'Gérer la paie', desc: 'Accéder aux salaires et fiches de paie.' },
  { id: 'VIEW_ANALYTICS', label: 'Voir l\'analytique', desc: 'Accès aux tableaux de bord et métriques.' },
];

const RolesPage = () => {
  const { user } = useAuth();
  const { plan } = usePlan();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const [formData, setFormData] = useState({ name: '', permissions: [] as string[] });

  const fetchRoles = async () => {
    try {
      const res = await api.get('/roles');
      setRoles(res.data);
    } catch (error) {
      console.error('Error fetching roles', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (plan !== 'FITINI') {
      void fetchRoles();
    } else {
      setLoading(false);
    }
  }, [plan]);

  if (plan === 'FITINI') {
    return <LockedFeature featureName="Rôles sur-mesure (RBAC)" requiredPlan="LOUBA" />;
  }

  const handleTogglePermission = (permId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter(p => p !== permId)
        : [...prev.permissions, permId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRole) {
        await api.put(`/roles/${editingRole.id}`, formData);
      } else {
        await api.post('/roles', formData);
      }
      setIsModalOpen(false);
      setEditingRole(null);
      setFormData({ name: '', permissions: [] });
      void fetchRoles();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de la sauvegarde du rôle.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce rôle ?")) return;
    try {
      await api.delete(`/roles/${id}`);
      void fetchRoles();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Impossible de supprimer ce rôle.');
    }
  };

  const openEditModal = (role: Role) => {
    setEditingRole(role);
    setFormData({ name: role.name, permissions: role.permissions });
    setIsModalOpen(true);
  };

  if (loading) {
    return <div className="flex justify-center p-20"><div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-orange-500" /> Rôles et Permissions
          </h1>
          <p className="text-gray-500 mt-1">Créez des profils sur-mesure pour votre équipe.</p>
        </div>
        <button 
          onClick={() => { setEditingRole(null); setFormData({ name: '', permissions: [] }); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-5 h-5" /> Nouveau Rôle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Rôles système par défaut */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 opacity-70">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-blue-500" />
            <h3 className="font-bold text-lg">Admin Entreprise</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">Rôle système non modifiable.</p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">ALL_ACCESS</span>
          </div>
        </div>

        {/* Rôles personnalisés */}
        {roles.map(role => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            key={role.id} 
            className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all flex flex-col"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{role.name}</h3>
                <p className="text-sm text-gray-500">{role._count.users} employé(s)</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEditModal(role)} className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(role.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-400 uppercase mb-3">Permissions ({role.permissions.length})</p>
              <div className="flex flex-wrap gap-2">
                {role.permissions.map(p => (
                  <span key={p} className="px-3 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-xs font-bold rounded-full">
                    {p.replace('MANAGE_', '').replace('VIEW_', '')}
                  </span>
                ))}
                {role.permissions.length === 0 && <span className="text-sm text-gray-400 italic">Aucune permission</span>}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal Création/Édition */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingRole ? 'Modifier le rôle' : 'Créer un nouveau rôle'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nom du Profil (ex: Comptable)</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="Manager IT"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Permissions attribuées</label>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {AVAILABLE_PERMISSIONS.map(perm => {
                    const isSelected = formData.permissions.includes(perm.id);
                    return (
                      <div 
                        key={perm.id}
                        onClick={() => handleTogglePermission(perm.id)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3
                          ${isSelected ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-100 dark:border-gray-700 hover:border-orange-200'}`}
                      >
                        <div className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center border shrink-0
                          ${isSelected ? 'bg-orange-500 border-orange-500 text-white' : 'border-gray-300'}`}>
                          {isSelected && <CheckCircle2 className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className={`font-bold ${isSelected ? 'text-orange-700 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300'}`}>{perm.label}</p>
                          <p className="text-xs text-gray-500 mt-1">{perm.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={!formData.name} className="px-6 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 disabled:opacity-50 transition-colors">
                  {editingRole ? 'Mettre à jour' : 'Créer le rôle'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default RolesPage;
