import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useData } from '../../contexts/DataContext';
import { Package, Trophy } from 'lucide-react';

export default function TopProducts() {
  const { t } = useLanguage();
  const { products, invoices } = useData();

  // Calculer les ventes réelles par produit
  const productSales = products.map(product => {
    let totalQuantity = 0;
    let totalRevenue = 0;
    
    invoices.forEach(invoice => {
      invoice.items.forEach(item => {
        if (item.description === product.name) {
          totalQuantity += item.quantity;
          totalRevenue += item.total;
        }
      });
    });
    
    return {
      name: product.name,
      sales: totalQuantity,
      revenue: totalRevenue,
      category: product.category || 'Non catégorisé',
      uniti: product.unit || 'unité'
    };
  });
  
  // Trier par quantité vendue et prendre le top 3
  const topProducts = productSales
    .filter(product => product.sales > 0)
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 3);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Top 3 Produits les Plus Vendus</h3>
          <p className="text-sm text-gray-600">Classement par quantité vendue</p>
        </div>
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
          <Trophy className="w-5 h-5 text-white" />
        </div>
      </div>

      <div className="space-y-4">
        {topProducts.length > 0 ? (
          topProducts.map((product, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                    index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                    index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                    'bg-gradient-to-br from-orange-400 to-orange-600'
                  }`}>
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.category}</p>
                  </div>
                </div>
              </div>
              
              <div className="text-right space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">
                    {product.revenue.toLocaleString()} MAD
                  </span>
                </div>
                <p className="text-xs text-gray-500">{product.sales.toFixed(3)} {product.uniti} </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucun produit enregistré</p>
            <p className="text-sm text-gray-400 mt-1">Ajoutez des produits pour voir les statistiques</p>
          </div>
        )}
      </div>
    </div>
  );
}