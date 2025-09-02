import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import Modal from '../common/Modal';

interface AddLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddLeaveModal({ isOpen, onClose }: AddLeaveModalProps) {
  const { employees, addLeave, getEmployeeById } = useData();
  const [formData, setFormData] = useState({
    employeeId: '',
    startDate: '',
    endDate: '',
    type: 'annual' as const,
    status: 'pending' as const,
    reason: '',
    includeSaturdays: false,
    manualHolidays: 0
  });

  const leaveTypes = [
    { value: 'annual', label: 'Congé annuel' },
    { value: 'sick', label: 'Congé maladie' },
    { value: 'maternity', label: 'Congé maternité' },
    { value: 'other', label: 'Autre' }
  ];

  const calculateWorkingDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    
    if (end < start) return 0;
    
    let workingDays = 0;
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay(); // 0 = Dimanche, 6 = Samedi
      
      // Exclure les dimanches (toujours)
      if (dayOfWeek === 0) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }
      
      // Exclure les samedis si l'option n'est pas cochée
      if (dayOfWeek === 6 && !formData.includeSaturdays) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }
      
      workingDays++;
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Soustraire les jours fériés saisis manuellement
    return Math.max(0, workingDays - formData.manualHolidays);
  };

  const workingDays = calculateWorkingDays();
  const totalCalendarDays = formData.startDate && formData.endDate ? 
    Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.employeeId || !formData.startDate || !formData.endDate) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      alert('La date de fin doit être après la date de début');
      return;
    }

    const employee = getEmployeeById(formData.employeeId);
    if (!employee) {
      alert('Employé non trouvé');
      return;
    }
    
    addLeave({
      employeeId: formData.employeeId,
      employee,
      startDate: formData.startDate,
      endDate: formData.endDate,
      type: formData.type,
      days: workingDays,
      status: formData.status,
      reason: formData.reason
    });
    
    setFormData({
      employeeId: '',
      startDate: '',
      endDate: '',
      type: 'annual',
      status: 'pending',
      reason: '',
      includeSaturdays: false,
      manualHolidays: 0
    });
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouveau Congé" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Employé *
          </label>
          <select
            name="employeeId"
            value={formData.employeeId}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Sélectionner un employé</option>
            {employees.map(employee => (
              <option key={employee.id} value={employee.id}>
                {employee.firstName} {employee.lastName} - {employee.position}
              </option>
            ))}
          </select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de début *
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de fin *
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="includeSaturdays"
              checked={formData.includeSaturdays}
              onChange={handleChange}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Inclure les samedis comme jours travaillés</span>
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Par défaut, seuls les dimanches sont exclus du calcul
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de jours fériés dans cette période
          </label>
          <input
            type="number"
            name="manualHolidays"
            value={formData.manualHolidays}
            onChange={handleChange}
            min="0"
            max="10"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="0"
          />
          <p className="text-xs text-gray-500 mt-1">
            Saisissez manuellement le nombre de jours fériés qui tombent dans cette période de congé
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de congé
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {leaveTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="pending">En attente</option>
              <option value="approved">Approuvé</option>
              <option value="rejected">Refusé</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Raison (optionnel)
          </label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Raison du congé..."
          />
        </div>

        {workingDays > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-purple-800 font-medium">Jours ouvrés calculés:</span>
              <span className="text-purple-900 font-bold">{workingDays} jour{workingDays > 1 ? 's' : ''}</span>
            </div>
            <div className="text-xs text-purple-700 space-y-1">
              <p>• Période totale: {totalCalendarDays} jour{totalCalendarDays > 1 ? 's' : ''} calendaires</p>
              <p>• Dimanches exclus automatiquement</p>
              <p>• Samedis {formData.includeSaturdays ? 'inclus' : 'exclus'}</p>
              <p>• Jours fériés saisis manuellement: {formData.manualHolidays}</p>
              {formData.manualHolidays > 0 && (
                <p className="text-purple-600 font-medium">→ Jours fériés déduits du calcul</p>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white rounded-lg transition-all duration-200"
          >
            Ajouter Congé
          </button>
        </div>
      </form>
    </Modal>
  );
}