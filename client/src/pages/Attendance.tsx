import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Clock, Play, Square, AlertCircle, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

interface Attendance {
  id: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  latitude?: number;
  longitude?: number;
  employee?: {
    firstName: string;
    lastName: string;
  };
}

const AttendancePage = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get<Attendance[]>('/attendances');
      setLogs(res.data);
    } catch (error) {
      console.error('Error fetching attendances', error);
    }
  };

  useEffect(() => {
    void fetchLogs();
  }, []);

  const handleToggle = async () => {
    setIsLoading(true);

    const postClock = async (lat?: number, lng?: number) => {
      try {
        await api.post('/attendances/toggle', { latitude: lat, longitude: lng });
        void fetchLogs();
      } catch (error) {
        console.error('Error toggling clock', error);
      } finally {
        setIsLoading(false);
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          postClock(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn("Geolocation denied or error", error);
          postClock(); // Proceed without GPS if blocked
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      postClock();
    }
  };

  const todayLog = logs.find(
    log => new Date(log.date).toDateString() === new Date().toDateString() && log.employee?.firstName === user?.firstName
  ) || logs.find(
    log => new Date(log.date).toDateString() === new Date().toDateString()
  );

  const isCheckedIn = todayLog?.checkIn && !todayLog?.checkOut;
  const isFinished = todayLog?.checkOut;

  const canManage = user?.role === 'COMPANY_ADMIN' || user?.role === 'HR_MANAGER' || user?.role === 'HR_ASSISTANT';

  const calculateHours = (checkIn: string | null, checkOut: string | null) => {
    if (!checkIn || !checkOut) return '-';
    const start = new Date(checkIn).getTime();
    const end = new Date(checkOut).getTime();
    const diffHours = (end - start) / (1000 * 60 * 60);
    return diffHours.toFixed(2) + ' h';
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
          <Clock className="w-8 h-8 text-orange-500" /> Pointage
        </h1>
        <p className="text-gray-500 mt-1">Gérez votre temps de travail et suivez les présences de l'équipe avec géolocalisation.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module de Pointage (Employé) */}
        {!canManage && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1 bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-orange-600"></div>
            
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Pointage du Jour</h2>
            <p className="text-gray-500 mb-8">{time.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            
            <div className="text-5xl font-mono font-bold text-orange-500 tracking-wider mb-10">
              {time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>

            {isFinished ? (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-full font-semibold">
                <AlertCircle className="w-5 h-5" /> Journée terminée
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleToggle}
                disabled={isLoading}
                className={`flex items-center justify-center gap-3 w-48 h-16 rounded-full text-white font-bold text-lg shadow-lg transition-all
                  ${isCheckedIn 
                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-red-500/30' 
                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-green-500/30'}
                `}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                ) : isCheckedIn ? (
                  <><Square className="w-6 h-6 fill-current" /> Terminer</>
                ) : (
                  <><Play className="w-6 h-6 fill-current" /> Commencer</>
                )}
              </motion.button>
            )}

            <div className="mt-8 text-sm text-gray-500 space-y-2 w-full text-left bg-gray-50 p-4 rounded-xl">
              <div className="flex justify-between">
                <span>Arrivée:</span>
                <span className="font-semibold text-gray-900">{todayLog?.checkIn ? new Date(todayLog.checkIn).toLocaleTimeString() : '--:--'}</span>
              </div>
              <div className="flex justify-between">
                <span>Départ:</span>
                <span className="font-semibold text-gray-900">{todayLog?.checkOut ? new Date(todayLog.checkOut).toLocaleTimeString() : '--:--'}</span>
              </div>
              {todayLog?.latitude && todayLog?.longitude && (
                <div className="flex justify-between items-center text-xs mt-2 pt-2 border-t border-gray-200">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> Position:</span>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${todayLog.latitude},${todayLog.longitude}`} target="_blank" rel="noreferrer" className="text-orange-500 font-bold hover:underline">Voir carte</a>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Historique / Vue RH */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`${canManage ? 'lg:col-span-3' : 'lg:col-span-2'} bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden`}
        >
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              {canManage ? "Pointages de l'équipe (Aujourd'hui)" : "Mon Historique"}
            </h2>
          </div>
          
          <div className="overflow-x-auto p-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-400 text-sm uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                  <th className="p-4 font-semibold">Date</th>
                  {canManage && <th className="p-4 font-semibold">Employé</th>}
                  <th className="p-4 font-semibold">Arrivée</th>
                  <th className="p-4 font-semibold">Départ</th>
                  <th className="p-4 font-semibold">Durée</th>
                  <th className="p-4 font-semibold">Position</th>
                  <th className="p-4 font-semibold">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {logs.map((log, index) => (
                  <motion.tr 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={log.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                  >
                    <td className="p-4 text-gray-900 dark:text-gray-300">{new Date(log.date).toLocaleDateString()}</td>
                    {canManage && (
                      <td className="p-4 text-gray-900 dark:text-white font-medium">
                        {log.employee?.firstName} {log.employee?.lastName}
                      </td>
                    )}
                    <td className="p-4 text-gray-600 dark:text-gray-400 font-mono">{log.checkIn ? new Date(log.checkIn).toLocaleTimeString() : '-'}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-400 font-mono">{log.checkOut ? new Date(log.checkOut).toLocaleTimeString() : '-'}</td>
                    <td className="p-4 text-orange-600 font-bold font-mono">
                      {calculateHours(log.checkIn, log.checkOut)}
                    </td>
                    <td className="p-4">
                      {log.latitude && log.longitude ? (
                        <a href={`https://www.google.com/maps/search/?api=1&query=${log.latitude},${log.longitude}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:bg-blue-50 p-2 rounded-full inline-flex">
                          <MapPin className="w-5 h-5" />
                        </a>
                      ) : (
                        <span className="text-gray-300 text-xs">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-bold uppercase tracking-wider">
                        {log.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={canManage ? 7 : 6} className="p-8 text-center text-gray-500">
                      Aucun pointage trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AttendancePage;

