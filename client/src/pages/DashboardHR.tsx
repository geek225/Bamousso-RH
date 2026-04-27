import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Layers, Calendar, Clock, FileText, Megaphone, TrendingUp, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

const DashboardHR = () => {
  const { company, user } = useAuth();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const modules = [
    { name: 'Annuaire', desc: 'Gestion des talents', icon: Users, path: '/employees', color: 'bg-blue-500' },
    { name: 'Organisation', desc: 'Départements', icon: Layers, path: '/departments', color: 'bg-indigo-500' },
    { name: 'Temps & Présences', desc: 'Validation des pointages', icon: Clock, path: '/attendance', color: 'bg-green-500' },
    { name: 'Absences', desc: 'Validation des congés', icon: Calendar, path: '/leaves', color: 'bg-yellow-500' },
    { name: 'Coffre-fort RH', desc: 'Partage de documents', icon: FileText, path: '/documents', color: 'bg-purple-500' },
    { name: 'Communication', desc: 'Publier une annonce', icon: Megaphone, path: '/announcements', color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header animé */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-400/20 to-transparent rounded-bl-full pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3 mb-2">
              Espace RH • {user?.firstName} 👋
            </h1>
            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Briefcase className="w-4 h-4" /> {company?.name || 'Bamousso'} • Pôle Ressources Humaines
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-6 py-3 rounded-2xl flex items-center gap-3 font-semibold shadow-inner">
            <TrendingUp className="w-5 h-5" />
            Vue d'ensemble RH
          </div>
        </div>
      </motion.div>

      {/* Grille de modules */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {modules.map((mod, index) => (
          <motion.div key={index} variants={item}>
            <Link
              to={mod.path}
              className="group block bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:-translate-y-2 relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 ${mod.color} opacity-5 rounded-full -mr-10 -mt-10 transition-transform duration-500 group-hover:scale-150`}></div>
              
              <div className="flex items-start gap-4 relative z-10">
                <div className={`w-14 h-14 rounded-2xl ${mod.color} flex items-center justify-center text-white shadow-lg shadow-${mod.color.replace('bg-', '')}/30 transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                  <mod.icon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">{mod.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{mod.desc}</p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end relative z-10">
                <div className="text-blue-500 text-sm font-semibold opacity-0 -translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                  Accéder &rarr;
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default DashboardHR;
