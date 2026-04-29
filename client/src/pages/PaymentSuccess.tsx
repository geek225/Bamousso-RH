import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Vérification de votre paiement en cours...');

  useEffect(() => {
    const verifyPayment = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        // Si pas de token, c'est peut-être une redirection directe (simulation)
        setStatus('success');
        return;
      }

      try {
        const response = await api.get(`/payment/confirm/${token}`);
        if (response.data.success) {
          setStatus('success');
        } else {
          setStatus('error');
          setMessage("Nous n'avons pas pu confirmer votre paiement.");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus('error');
        setMessage("Une erreur est survenue lors de la vérification.");
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md border border-gray-100 dark:border-gray-700 w-full"
      >
        {status === 'verifying' && (
          <>
            <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Vérification...</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Paiement Réussi !</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Merci pour votre confiance. Votre abonnement Bamousso est maintenant actif. Vous pouvez vous connecter à votre espace entreprise.
            </p>
            <button 
              onClick={() => navigate('/login')}
              className="w-full bg-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all hover:scale-[1.02] shadow-lg shadow-orange-500/30"
            >
              Accéder à mon espace
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Oups !</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">{message}</p>
            <button 
              onClick={() => navigate('/')}
              className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-3 rounded-xl font-bold hover:scale-[1.02] transition-all"
            >
              Retourner à l'accueil
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
