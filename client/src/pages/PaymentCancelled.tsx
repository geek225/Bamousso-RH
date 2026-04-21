import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const PaymentCancelled = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md border border-gray-100 dark:border-gray-700"
      >
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Paiement Annulé</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Le processus de paiement a été interrompu. Aucune transaction n'a été effectuée.
        </p>
        <div className="flex flex-col gap-4">
          <button 
            onClick={() => navigate('/')}
            className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-3 rounded-xl font-bold hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" /> Retour à l'accueil
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentCancelled;
