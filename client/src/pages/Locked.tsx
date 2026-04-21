import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Locked = () => {
  const { company, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md w-full max-w-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Accès suspendu
        </h1>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          {company?.name ? (
            <>
              L’entreprise <span className="font-semibold">{company.name}</span> est actuellement
              verrouillée (abonnement non à jour).
            </>
          ) : (
            <>Cette entreprise est actuellement verrouillée (abonnement non à jour).</>
          )}
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              // TODO: brancher page paiement/renouvellement
              window.location.href = 'mailto:support@ton-saas.com?subject=Renouvellement%20abonnement';
            }}
            className="w-full sm:w-auto bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition font-medium"
          >
            Contacter le support
          </button>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full sm:w-auto bg-gray-200 text-gray-900 py-2 px-4 rounded hover:bg-gray-300 transition font-medium dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
};

export default Locked;

