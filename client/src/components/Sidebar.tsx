import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Building2, LayoutDashboard, LogOut, Moon, Sun, Users, Layers, X, Calendar, Clock, FileText, Megaphone, Settings as SettingsIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import ConfirmationModal from './ConfirmationModal';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user, company, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const formatRole = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'Super Administrateur';
      case 'COMPANY_ADMIN': return 'Admin entreprise';
      case 'HR_MANAGER': return 'RH Manager';
      case 'HR_ASSISTANT': return 'Assistant RH';
      case 'EMPLOYEE': return 'Employé';
      default: return role;
    }
  };

  // Fermer la sidebar sur mobile quand on change de page
  useEffect(() => {
    onClose();
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const dashboardPath =
    user.role === 'SUPER_ADMIN'
      ? '/dashboard/super-admin'
      : user.role === 'COMPANY_ADMIN'
        ? '/dashboard/admin'
        : user.role === 'HR_MANAGER' || user.role === 'HR_ASSISTANT'
          ? '/dashboard/hr'
          : '/dashboard/employee';

  const canManageHr =
    user.role === 'COMPANY_ADMIN' || user.role === 'HR_MANAGER' || user.role === 'HR_ASSISTANT';

  const isSuperAdmin = user.role === 'SUPER_ADMIN';

  return (
    <>
      {/* Overlay pour mobile - ferme la sidebar quand on clique à côté */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar principale */}
      <div className={`
        w-64 bg-white dark:bg-gray-900 text-gray-800 dark:text-white h-screen fixed left-0 top-0 flex flex-col z-50 transition-all duration-300 ease-in-out border-r border-gray-200 dark:border-gray-800 shadow-xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold flex items-center gap-2 tracking-tight">
              {/* Affichage du logo de l'entreprise s'il existe, sinon l'icône par défaut */}
              {company?.logoUrl && !isSuperAdmin ? (
                <img src={company.logoUrl} alt="Logo Entreprise" className="w-8 h-8 object-contain rounded-md" />
              ) : (
                <Building2 className="w-7 h-7 text-brand-primary" />
              )}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-brand-accent">
                {!isSuperAdmin && company?.name ? company.name : 'BAMOUSSO'}
              </span>
            </h1>
            <p className="text-xs text-text-tertiary mt-1 uppercase tracking-wider">{formatRole(user.role)}</p>
          </div>
          {/* Bouton fermer sur mobile */}
          <button onClick={onClose} className="lg:hidden p-2 hover:bg-surface-tonal rounded">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          <Link to={dashboardPath} className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 font-medium ${location.pathname.startsWith('/dashboard') ? 'bg-brand-accent/10 text-brand-primary shadow-sm' : 'hover:bg-surface-tonal text-text-secondary'}`}>
            <LayoutDashboard className="w-5 h-5" />
            Tableau de bord
          </Link>

          {!isSuperAdmin && canManageHr && (
            <>
              <Link
                to="/employees"
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 font-medium ${location.pathname === '/employees' ? 'bg-orange-50 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 shadow-sm' : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
              >
                <Users className="w-5 h-5" />
                Employés
              </Link>
              <Link
                to="/departments"
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 font-medium ${location.pathname === '/departments' ? 'bg-orange-50 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 shadow-sm' : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
              >
                <Layers className="w-5 h-5" />
                Départements
              </Link>
            </>
          )}

          {!isSuperAdmin && (
            <>
              <Link
                to="/attendance"
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 font-medium ${location.pathname === '/attendance' ? 'bg-orange-50 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 shadow-sm' : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
              >
                <Clock className="w-5 h-5" />
                Pointage
              </Link>

              <Link
                to="/leaves"
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 font-medium ${location.pathname === '/leaves' ? 'bg-orange-50 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 shadow-sm' : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
              >
                <Calendar className="w-5 h-5" />
                Congés
              </Link>

              <Link
                to="/documents"
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 font-medium ${location.pathname === '/documents' ? 'bg-orange-50 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 shadow-sm' : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
              >
                <FileText className="w-5 h-5" />
                Documents
              </Link>

              <Link
                to="/announcements"
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 font-medium ${location.pathname === '/announcements' ? 'bg-orange-50 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 shadow-sm' : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
              >
                <Megaphone className="w-5 h-5" />
                Annonces
              </Link>
            </>
          )}
          {canManageHr ? (
            <Link
              to="/settings"
              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 font-medium ${location.pathname === '/settings' ? 'bg-brand-accent/10 text-brand-primary shadow-sm' : 'hover:bg-surface-tonal text-text-secondary'}`}
            >
              <SettingsIcon className="w-5 h-5" />
              Paramètres
            </Link>
          ) : null}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
          <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-center gap-2 p-2.5 bg-surface-tonal hover:bg-surface-border text-text-secondary rounded-xl transition-all duration-300 text-sm font-medium"
          >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              {theme === 'light' ? 'Mode Nuit' : 'Mode Jour'}
          </button>

          <div className="flex items-center gap-3 p-3 bg-surface-tonal rounded-xl shadow-sm border border-surface-border">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center text-white shrink-0 shadow-md">
                  <span className="font-bold text-lg">{user.firstName[0]}{user.lastName[0]}</span>
              </div>
              <div className="min-w-0">
                  <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
              </div>
          </div>

          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 p-2.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-500 rounded-xl transition-all duration-300 text-sm font-semibold"
          >
            <LogOut className="w-4 h-4" />
            Se déconnecter
          </button>
        </div>

        <ConfirmationModal
          isOpen={isLogoutModalOpen}
          onClose={() => setIsLogoutModalOpen(false)}
          onConfirm={handleLogout}
          title="Confirmer la déconnexion"
          message="Êtes-vous sûr de vouloir vous déconnecter ?"
          confirmText="Se déconnecter"
          cancelText="Annuler"
          variant="danger"
        />
      </div>
    </>
  );
};

export default Sidebar;
