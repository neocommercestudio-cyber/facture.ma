import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  FileText, 
  Users, 
  Package,
  Calendar,
  Download,
  Filter,
  Eye
} from 'lucide-react';

export default function Reports() {
  const { t } = useLanguage();
  const { invoices, clients, products } = useData();
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('sales');

  // Calculs des statistiques
  const paidInvoices = invoices.filter(invoice => invoice.status === 'paid');
  const unpaidInvoices = invoices.filter(invoice => invoice.status === 'unpaid');
  const collectedInvoices = invoices.filter(invoice => invoice.status === 'collected');
  
  const totalRevenue = paidInvoices
    .reduce((sum, invoice) => sum + invoice.totalTTC, 0);

  const unpaidRevenue = unpaidInvoices
    .reduce((sum, invoice) => sum + invoice.totalTTC, 0);

  const collectedRevenue = collectedInvoices
    .reduce((sum, invoice) => sum + invoice.totalTTC, 0);

  // Données réelles pour l'évolution des ventes (6 derniers mois)
  const getSalesDataForLastMonths = () => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('fr-FR', { month: 'short' });
      
      // Calculer les ventes réelles pour ce mois
      const monthSales = paidInvoices
        .filter(invoice => {
          const invoiceDate = new Date(invoice.date);
          return invoiceDate.getMonth() === date.getMonth() && 
                 invoiceDate.getFullYear() === date.getFullYear();
        })
        .reduce((sum, invoice) => sum + invoice.totalTTC, 0);
      
      months.push({ month: monthName, sales: monthSales });
    }
    
    return months;
  };

  const monthlyData = getSalesDataForLastMonths();
  const maxSales = Math.max(...monthlyData.map(d => d.sales), 1); // Éviter division par 0
  const lowStockProducts = products.filter(product => product.stock <= product.minStock).length;

  const stats = [
    {
      title: 'Factures Payées',
      value: `${paidInvoices.length} (${totalRevenue.toLocaleString()} MAD)`,
      icon: DollarSign,
      color: 'from-emerald-500 to-teal-600',
      change: `${totalRevenue.toLocaleString()} MAD`
    },
    {
      title: 'Factures Non Payées',
      value: `${unpaidInvoices.length} (${unpaidRevenue.toLocaleString()} MAD)`,
      icon: FileText,
      color: 'from-red-500 to-pink-600',
      change: `${unpaidRevenue.toLocaleString()} MAD`
    },
    {
      title: 'Factures Encaissées',
      value: `${collectedInvoices.length} (${collectedRevenue.toLocaleString()} MAD)`,
      icon: FileText,
      color: 'from-yellow-500 to-orange-600',
      change: `${collectedRevenue.toLocaleString()} MAD`
    },
    {
      title: 'Total Clients',
      value: clients.length.toString(),
      icon: Users,
      color: 'from-violet-500 to-purple-600',
      change: `${clients.length} clients`
    }
  ];

  const reportTypes = [
    { id: 'sales', label: 'Ventes', icon: TrendingUp },
    { id: 'invoices', label: 'Factures', icon: FileText },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'products', label: 'Produits', icon: Package }
  ];

  const periods = [
    { id: 'week', label: 'Cette semaine' },
    { id: 'month', label: 'Ce mois' },
    { id: 'quarter', label: 'Ce trimestre' },
    { id: 'year', label: 'Cette année' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('reports')}</h1>
        <div className="flex space-x-3">
          <button className="inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filtres</span>
          </button>
          <button className="inline-flex items-center space-x-2 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200">
            <Download className="w-4 h-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de rapport
            </label>
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              {reportTypes.map(type => (
                <option key={type.id} value={type.id}>{type.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Période
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              {periods.map(period => (
                <option key={period.id} value={period.id}>{period.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </p>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-medium text-emerald-600">
                      {stat.change}
                    </span>
                    <span className="text-xs text-gray-500">vs période précédente</span>
                  </div>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

   {/* Moyenne mensuelle */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Résumé Financier</h3>
            <p className="text-sm text-gray-600">Performance globale</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-2xl font-bold text-green-600">{totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-green-700">MAD Encaissés</p>
            <p className="text-xs text-gray-500">{paidInvoices.length} factures payées</p>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-2xl font-bold text-red-600">{unpaidRevenue.toLocaleString()}</p>
            <p className="text-sm text-red-700">MAD En Attente</p>
            <p className="text-xs text-gray-500">{unpaidInvoices.length} factures non payées</p>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-2xl font-bold text-blue-600">
              {monthlyData.length > 0 ? Math.round(monthlyData.reduce((acc, d) => acc + d.sales, 0) / monthlyData.length).toLocaleString() : '0'}
            </p>
            <p className="text-sm text-blue-700">MAD Moyenne/Mois</p>
            <p className="text-xs text-gray-500">6 derniers mois</p>
          </div>
          
        </div>
      </div>
      

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution des ventes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Évolution des Ventes</h3>
              <p className="text-sm text-gray-600">Chiffre d'affaires par mois</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="space-y-4">
            {monthlyData.map((data, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-8 text-sm font-medium text-gray-600">
                  {data.month}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-3 relative overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${maxSales > 0 ? (data.sales / maxSales) * 100 : 0}%` }}
                  />
                </div>
                <div className="w-20 text-sm font-medium text-gray-900 text-right">
                  {data.sales.toLocaleString()} MAD
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Clients */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Top Clients</h3>
              <p className="text-sm text-gray-600">Clients les plus rentables</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="space-y-4">
            {clients.slice(0, 5).map((client, index) => {
              const clientRevenue = invoices
                .filter(invoice => invoice.clientId === client.id && invoice.status === 'paid')
                .reduce((sum, invoice) => sum + invoice.totalTTC, 0);
              
              const clientInvoicesCount = invoices
                .filter(invoice => invoice.clientId === client.id)
                .length;
              
              return (
                <div key={client.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{client.name}</p>
                      <p className="text-sm text-gray-500">ICE: {client.ice}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {clientRevenue.toLocaleString()} MAD
                    </p>
                    <p className="text-xs text-gray-500">
                      {clientInvoicesCount} facture{clientInvoicesCount > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {clients.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucun client enregistré</p>
            </div>
          )}
        </div>
      </div>

      {/* Tableau détaillé */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Rapport Détaillé</h3>
            <button className="text-teal-600 hover:text-teal-700 font-medium text-sm flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>Voir tout</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.slice(0, 10).map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(invoice.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Facture
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.client.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {invoice.totalTTC.toLocaleString()} MAD
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      invoice.status === 'paid' || invoice.status === 'collected'
                        ? 'bg-emerald-100 text-emerald-800'
                        : invoice.status === 'unpaid'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {invoice.status === 'paid' ? 'Payé' : 
                       invoice.status === 'collected' ? 'Encaissé' :
                       invoice.status === 'unpaid' ? 'Non payé' : 'Autre'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {invoices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucune donnée disponible pour générer des rapports</p>
          </div>
        )}
      </div>

   
    </div>
  );
}