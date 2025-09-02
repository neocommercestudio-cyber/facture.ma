import React from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { DollarSign, FileText, Users, Package } from 'lucide-react';

export default function StatsCards() {
  const { t } = useLanguage();
  const { clients, products, invoices } = useData();

  // Chiffre d'affaires total des factures créées cette année
  const currentYear = new Date().getFullYear();
  const paidInvoices = invoices.filter(invoice => 
    new Date(invoice.createdAt).getFullYear() === currentYear && 
    (invoice.status === 'paid' || invoice.status === 'collected')
  );
  
  const totalRevenue = paidInvoices
    .reduce((sum, invoice) => sum + invoice.totalTTC, 0);

  // Nombre total de factures créées cette année
  const totalInvoicesThisYear = invoices.filter(invoice => 
    new Date(invoice.createdAt).getFullYear() === currentYear
  ).length;

  // Factures en attente de paiement
  const unpaidInvoices = invoices.filter(invoice => 
    new Date(invoice.createdAt).getFullYear() === currentYear && 
    invoice.status === 'unpaid'
  ).length;

  const stats = [
    {
      title: 'CA Encaissé ' + currentYear,
      value: `${totalRevenue.toLocaleString()} MAD`,
      subtitle: 'Factures payées/encaissées',
      icon: DollarSign,
      bgColor: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    },
    {
      title: 'Factures Non Payées',
      value: unpaidInvoices.toString(),
      subtitle: 'En attente de paiement',
      icon: FileText,
      bgColor: 'bg-gradient-to-br from-red-500 to-pink-600',
    },
    {
      title: 'Total Clients',
      value: clients.length.toString(),
      subtitle: 'Clients enregistrés',
      icon: Users,
      bgColor: 'bg-gradient-to-br from-violet-500 to-purple-600',
    },
    {
      title: 'Total Produits',
      value: products.length.toString(),
      subtitle: 'Produits en catalogue',
      icon: Package,
      bgColor: 'bg-gradient-to-br from-orange-500 to-red-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500">
                    {stat.subtitle}
                  </p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}