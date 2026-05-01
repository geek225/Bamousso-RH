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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Créer un aperçu
      setLogoUrl(URL.createObjectURL(file));
    }
  };

  const handleSaveLogo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !company) return;

    setIsSaving(true);
    setMessage('');
    
    const formData = new FormData();
    formData.append('logo', selectedFile);

    try {
      const res = await api.post(`/companies/logo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
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
            <div className="w-40 h-40 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-50 dark:bg-gray-900 shrink-0 overflow-hidden relative group">
              {logoUrl ? (
                <img src={logoUrl} alt="Aperçu du logo" className="w-full h-full object-contain p-2" />
              ) : (
                <span className="text-sm text-gray-400 text-center px-4">Aucun logo</span>
              )}
              <label className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-bold">
                Changer le logo
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Fichier du Logo</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange} 
                  className="w-full p-4 rounded-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" 
                />
                <p className="text-xs text-gray-500 mt-2">Format recommandé : PNG ou SVG (fond transparent).</p>
              </div>

              {message && (
                <div className={`p-3 rounded-xl text-sm font-medium ${message.includes('Erreur') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                  {message}
                </div>
              )}

              <button 
                type="submit" 
                disabled={isSaving || !selectedFile}
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
