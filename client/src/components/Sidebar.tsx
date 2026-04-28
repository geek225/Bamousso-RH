import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Building2, LayoutDashboard, LogOut, Moon, Sun, Users, Layers, X, 
  Calendar, Clock, FileText, Megaphone, Settings as SettingsIcon,
  ListTodo, AlertTriangle, Banknote, MessageCircle, FileWarning, BarChart3
} from 'lucide-react';
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
  const plan = company?.plan || 'FITINI';

  return (
    <>
      {/* Overlay pour mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar principale */}
      <div className={`
        w-64 bg-[#1a0f0a] text-white h-screen fixed left-0 top-0 flex flex-col z-50 transition-all duration-300 ease-in-out border-r border-white/5 shadow-2xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-white/5 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black flex items-center gap-2 tracking-tighter">
              {company?.logoUrl && !isSuperAdmin ? (
                <img src={company.logoUrl} alt="Logo Entreprise" className="w-9 h-9 object-contain rounded-xl" />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center shadow-lg">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
              )}
              <span className="text-white">
                {!isSuperAdmin && company?.name ? company.name : 'BAMOUSSO'}
              </span>
            </h1>
            <button onClick={onClose} className="lg:hidden p-2 hover:bg-white/10 rounded-full">
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mt-2 opacity-80">{formatRole(user.role)}</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          <Link to={dashboardPath} className={`flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-300 font-bold text-sm ${location.pathname.startsWith('/dashboard') ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-[1.02]' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}>
            <LayoutDashboard className="w-5 h-5" />
            Tableau de bord
          </Link>

          {!isSuperAdmin && canManageHr && (
            <>
              <Link to="/employees" className={`flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-300 font-bold text-sm ${location.pathname === '/employees' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-[1.02]' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}>
                <Users className="w-5 h-5" />
                Employés
              </Link>
              <Link to="/departments" className={`flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-300 font-bold text-sm ${location.pathname === '/departments' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-[1.02]' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}>
                <Layers className="w-5 h-5" />
                Départements
              </Link>
            </>
          )}

          {!isSuperAdmin && (
            <>
              <Link to="/attendance" className={`flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-300 font-bold text-sm ${location.pathname === '/attendance' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-[1.02]' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}>
                <Clock className="w-5 h-5" />
                Pointage
              </Link>

              <Link to="/leaves" className={`flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-300 font-bold text-sm ${location.pathname === '/leaves' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-[1.02]' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}>
                <Calendar className="w-5 h-5" />
                Congés
              </Link>

              <Link to="/tasks" className={`flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-300 font-bold text-sm ${location.pathname === '/tasks' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-[1.02]' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}>
                <ListTodo className="w-5 h-5" />
                Tâches
              </Link>

              {(plan === 'LOUBA' || plan === 'KORO') && (
                <>
                  <Link to="/messaging" className={`flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-300 font-bold text-sm ${location.pathname === '/messaging' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-[1.02]' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}>
                    <MessageCircle className="w-5 h-5" />
                    Messagerie
                  </Link>

                  <Link to="/conflicts" className={`flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-300 font-bold text-sm ${location.pathname === '/conflicts' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-[1.02]' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}>
                    <AlertTriangle className="w-5 h-5" />
                    Conflits
                  </Link>

                  <Link to="/explanations" className={`flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-300 font-bold text-sm ${location.pathname === '/explanations' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-[1.02]' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}>
                    <FileWarning className="w-5 h-5" />
                    Explications
                  </Link>

                  <Link to="/salaries" className={`flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-300 font-bold text-sm ${location.pathname === '/salaries' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-[1.02]' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}>
                    <Banknote className="w-5 h-5" />
                    Salaires
                  </Link>

                  {canManageHr && (
                    <Link to="/analytics" className={`flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-300 font-bold text-sm ${location.pathname === '/analytics' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-[1.02]' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}>
                      <BarChart3 className="w-5 h-5" />
                      Analytique
                    </Link>
                  )}
                </>
              )}

              <Link to="/documents" className={`flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-300 font-bold text-sm ${location.pathname === '/documents' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-[1.02]' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}>
                <FileText className="w-5 h-5" />
                Documents
              </Link>

              <Link
                to="/announcements"
                className={`flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-300 font-bold text-sm ${location.pathname === '/announcements' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-[1.02]' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}
              >
                <Megaphone className="w-5 h-5" />
                Annonces
              </Link>
            </>
          )}
          {canManageHr ? (
            <Link
              to="/settings"
              className={`flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-300 font-bold text-sm ${location.pathname === '/settings' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-[1.02]' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}
            >
              <SettingsIcon className="w-5 h-5" />
              Paramètres
            </Link>
          ) : null}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-4">
          <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-center gap-2 p-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all duration-300 text-sm font-bold"
          >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              {theme === 'light' ? 'Mode Nuit' : 'Mode Jour'}
          </button>

          <div className="flex items-center gap-3 p-3 glass-card rounded-2xl">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center text-white shrink-0 shadow-lg">
                  <span className="font-black text-lg">{user.firstName[0]}{user.lastName[0]}</span>
              </div>
              <div className="min-w-0">
                  <p className="font-bold text-sm text-white truncate">{user.firstName} {user.lastName}</p>
                  <p className="text-[10px] text-gray-400 truncate uppercase tracking-wider font-bold">{user.email}</p>
              </div>
          </div>

          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl transition-all duration-300 text-sm font-black"
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
