import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useLicense } from '../../contexts/LicenseContext';
import Modal from '../common/Modal';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddProductModal({ isOpen, onClose }: AddProductModalProps) {
  const { addProduct } = useData();
  const { checkLimit } = useLicense();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    purchasePrice: 0,
    salePrice: 0,
    vatRate: 0,
    stock: 0,
    minStock: 5,
    status: 'active' as const
  });

  const categories = [
    'Informatique',
    'Téléphonie',
    'Bureautique',
    'Électronique',
    'Mobilier',
    'Consommables',
    'Services',
    'Autre'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!checkLimit('products')) {
      alert('🚨 Vous avez atteint la limite de produits de la version gratuite. Passez à la version Pro pour continuer.');
      return;
    }
    
    if (!formData.name) {
      alert('Le nom est obligatoire');
      return;
    }
    
    addProduct(formData);
    setFormData({
      name: '',
      category: '',
      purchasePrice: 0,
      salePrice: 0,
      vatRate: 0,
      stock: 0,
      minStock: 5,
      status: 'active'
    });
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouveau Produit" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom du produit *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Nom du produit"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prix d'achat (MAD)
            </label>
            <input
              type="number"
              name="purchasePrice"
              value={formData.purchasePrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prix de vente HT (MAD)
            </label>
            <input
              type="number"
              name="salePrice"
              value={formData.salePrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock initial
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock minimum
            </label>
            <input
              type="number"
              name="minStock"
              value={formData.minStock}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

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
            className="px-4 py-2 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white rounded-lg transition-all duration-200"
          >
            Ajouter Produit
          </button>
        </div>
      </form>
    </Modal>
  );
}