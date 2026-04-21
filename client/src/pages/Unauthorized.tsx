import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Accès non autorisé</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        Tu n’as pas les droits nécessaires pour accéder à cette page.
      </p>
      <Link to="/" className="text-blue-600 hover:underline">
        Retour au dashboard
      </Link>
    </div>
  );
};

export default Unauthorized;

