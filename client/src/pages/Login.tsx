import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  // Sécurité pour forcer l'affichage si l'écran est noir
  useEffect(() => {
    document.body.style.backgroundColor = '#f3f4f6'; // Gris clair par défaut
    return () => { document.body.style.backgroundColor = ''; };
  }, []);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: any) => {
    try {
      const response = await api.post('/auth/login', data);
      login(response.data.token, response.data.user, response.data.company);
      if (response.data.company?.isLocked) {
        navigate('/locked');
      } else {
        const role = response.data.user?.role;
        if (role === 'SUPER_ADMIN') navigate('/dashboard/super-admin');
        else if (role === 'COMPANY_ADMIN') navigate('/dashboard/admin');
        else if (role === 'HR_MANAGER' || role === 'HR_ASSISTANT') navigate('/dashboard/hr');
        else navigate('/dashboard/employee');
      }
    } catch (err: any) {
      const status = err.response?.status;
      const message = err.response?.data?.message || 'Une erreur est survenue';
      setError(status ? `${status} - ${message}` : message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">Connexion</h2>
        
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              {...register('email', { required: 'Email requis' })}
              type="email"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-black dark:text-white dark:bg-gray-700"
            />
            {errors.email && <span className="text-red-500 text-sm">{errors.email.message as string}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mot de passe</label>
            <div className="relative">
              <input
                {...register('password', { required: 'Mot de passe requis' })}
                type={showPassword ? "text" : "password"}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-black dark:text-white dark:bg-gray-700 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <span className="text-red-500 text-sm">{errors.password.message as string}</span>}
            <div className="flex justify-end mt-2">
              <Link to="/forgot-password" className="text-sm font-bold text-orange-500 hover:text-orange-600 transition-colors">
                Mot de passe oublié ?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-medium"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
