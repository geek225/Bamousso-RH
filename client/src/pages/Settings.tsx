import { useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, Image as ImageIcon, Save } from 'lucide-react';
import { motion } from 'framer-motion';

const SettingsPage = () => {
  const { company, login, user, token } = useAuth();
  const [logoUrl, setLogoUrl] = useState(company?.logoUrl || '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSaveLogo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;

    setIsSaving(true);
    setMessage('');
    try {
      const res = await api.put(`/companies/${company.id}/logo`, { logoUrl });
      // Mettre à jour le contexte avec le nouveau logo
      if (token && user) {
        login(token, user, res.data.company);
      }
      setMessage('Logo mis à jour avec succès !');
    } catch (error) {
      console.error('Error updating logo', error);
      setMessage('Erreur lors de la mise à jour du logo.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-orange-500" /> Paramètres de l'Entreprise
        </h1>
        <p className="text-gray-500 mt-1">Personnalisez l'expérience Bamousso pour vos collaborateurs.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700"
      >
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-gray-400" /> Identité Visuelle
        </h2>
        
        <form onSubmit={handleSaveLogo} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-50 dark:bg-gray-900 shrink-0 overflow-hidden relative">
              {logoUrl ? (
                <img src={logoUrl} alt="Aperçu du logo" className="w-full h-full object-contain p-2" />
              ) : (
                <span className="text-sm text-gray-400 text-center px-4">Aucun logo</span>
              )}
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">URL du Logo</label>
                <input 
                  type="url" 
                  value={logoUrl} 
                  onChange={e => setLogoUrl(e.target.value)} 
                  className="w-full p-4 rounded-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition" 
                  placeholder="https://votre-site.com/logo.png" 
                />
                <p className="text-xs text-gray-500 mt-2">Pour l'instant, veuillez fournir un lien public vers votre logo (format PNG recommandé).</p>
              </div>

              {message && (
                <div className={`p-3 rounded-xl text-sm font-medium ${message.includes('Erreur') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                  {message}
                </div>
              )}

              <button 
                type="submit" 
                disabled={isSaving}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-shadow disabled:opacity-50"
              >
                {isSaving ? 'Enregistrement...' : <><Save className="w-5 h-5" /> Enregistrer le logo</>}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default SettingsPage;
