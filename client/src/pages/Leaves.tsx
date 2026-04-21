import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';

interface LeaveRequest {
  id: string;
  type: 'PAID' | 'UNPAID' | 'SICK' | 'MATERNITY';
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason?: string;
  employee: {
    firstName: string;
    lastName: string;
  };
}

const Leaves = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isRequesting, setIsRequesting] = useState(false);
  const [type, setType] = useState('PAID');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const fetchLeaves = async () => {
    try {
      const res = await api.get<LeaveRequest[]>('/leaves');
      setLeaves(res.data);
    } catch (error) {
      console.error('Error fetching leaves', error);
    }
  };

  useEffect(() => {
    void fetchLeaves();
  }, []);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/leaves', { type, startDate, endDate, reason });
      setIsRequesting(false);
      setStartDate('');
      setEndDate('');
      setReason('');
      void fetchLeaves();
    } catch (error) {
      console.error('Error requesting leave', error);
    }
  };

  const handleReview = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await api.put(`/leaves/${id}/status`, { status });
      void fetchLeaves();
    } catch (error) {
      console.error('Error updating status', error);
    }
  };

  const canManage = user?.role === 'COMPANY_ADMIN' || user?.role === 'HR_MANAGER' || user?.role === 'HR_ASSISTANT';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-500" /> Congés
          </h1>
          <p className="text-gray-600 dark:text-gray-300">Gérez les demandes de congés et d'absences.</p>
        </div>
        {!canManage && (
          <button
            onClick={() => setIsRequesting(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Nouvelle demande
          </button>
        )}
      </div>

      {isRequesting && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Demander un congé</h2>
          <form onSubmit={handleRequest} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Type de congé</label>
                <select value={type} onChange={e => setType(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option value="PAID">Congé Payé</option>
                  <option value="UNPAID">Congé Sans Solde</option>
                  <option value="SICK">Maladie</option>
                  <option value="MATERNITY">Maternité/Paternité</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Date de début</label>
                <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Date de fin</label>
                <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Motif (Optionnel)</label>
                <input type="text" value={reason} onChange={e => setReason(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="ex: Vacances d'été" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsRequesting(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition">Annuler</button>
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Soumettre</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employé</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              {canManage && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {leaves.map(leave => (
              <tr key={leave.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                  {leave.employee.firstName} {leave.employee.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                  {leave.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                  {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${leave.status === 'APPROVED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                      leave.status === 'REJECTED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                    {leave.status}
                  </span>
                </td>
                {canManage && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {leave.status === 'PENDING' && (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleReview(leave.id, 'APPROVED')} className="text-green-600 hover:text-green-900 dark:text-green-500 dark:hover:text-green-400"><CheckCircle className="w-5 h-5"/></button>
                        <button onClick={() => handleReview(leave.id, 'REJECTED')} className="text-red-600 hover:text-red-900 dark:text-red-500 dark:hover:text-red-400"><XCircle className="w-5 h-5"/></button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {leaves.length === 0 && (
              <tr>
                <td colSpan={canManage ? 5 : 4} className="px-6 py-4 text-center text-sm text-gray-500">Aucune demande de congé trouvée.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaves;
