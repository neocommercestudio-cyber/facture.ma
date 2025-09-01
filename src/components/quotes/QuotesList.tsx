import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useLicense } from '../../contexts/LicenseContext';
import ProTemplateModal from '../license/ProTemplateModal';
import { Plus, Search, Filter, Download, Eye, Edit, Trash2, FileText } from 'lucide-react';

export default function QuotesList() {
  const { t } = useLanguage();
  const { licenseType } = useLicense();
  const { quotes, deleteQuote, convertQuoteToInvoice } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showProModal, setShowProModal] = useState(false);
  const [blockedTemplateName, setBlockedTemplateName] = useState('');
  const [showUpgradePage, setShowUpgradePage] = useState(false);

  const isTemplateProOnly = (templateId: string = 'template1') => {
    const proTemplates = ['template2', 'template3', 'template4', 'template5'];
    return proTemplates.includes(templateId);
  };

  const getTemplateName = (templateId: string = 'template1') => {
    const templates = {
      'template1': 'Classique',
      'template2': 'Moderne Coloré',
      'template3': 'Minimaliste',
      'template4': 'Corporate',
      'template5': 'Premium Élégant'
    };
    return templates[templateId as keyof typeof templates] || 'Template';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            Accepté
          </span>
        );
      case 'sent':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Envoyé
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Brouillon
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Refusé
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            Expiré
          </span>
        );
      default:
        return null;
    }
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteQuote = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce devis ?')) {
      deleteQuote(id);
    }
  };

  const handleDownloadQuote = (id: string) => {
    // Vérifier si le template par défaut est Pro et l'utilisateur est Free
    if (isTemplateProOnly('template1') && licenseType !== 'pro') {
      setBlockedTemplateName(getTemplateName('template1'));
      setShowProModal(true);
      return;
    }
    // Logique de téléchargement normale ici
    console.log('Téléchargement du devis:', id);
  };

  const handleConvertToInvoice = (id: string) => {
    if (window.confirm('Voulez-vous convertir ce devis en facture ?')) {
      convertQuoteToInvoice(id);
      alert('Devis converti en facture avec succès !');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Devis</h1>
        <Link
          to="/quotes/create"
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Devis</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Rechercher par client ou numéro..."
              />
            </div>
          </div>
          
          <div className="flex space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="draft">Brouillon</option>
              <option value="sent">Envoyé</option>
              <option value="accepted">Accepté</option>
              <option value="rejected">Refusé</option>
              <option value="expired">Expiré</option>
            </select>
            
            <button className="inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filtres</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quotes Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Devis
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date émission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valide jusqu'au
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant TTC
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredQuotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{quote.number}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{quote.client.name}</div>
                      <div className="text-xs text-gray-500">ICE: {quote.client.ice}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(quote.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(quote.validUntil).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {quote.totalTTC.toLocaleString()} MAD
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(quote.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-3">
                      <button className="text-blue-600 hover:text-blue-700 transition-colors" title="Voir">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-700 transition-colors" title="Télécharger PDF">
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleConvertToInvoice(quote.id)}
                        className="text-teal-600 hover:text-teal-700 transition-colors" 
                        title="Convertir en facture"
                        disabled={quote.status === 'accepted'}
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button className="text-amber-600 hover:text-amber-700 transition-colors" title="Modifier">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteQuote(quote.id)}
                        className="text-red-600 hover:text-red-700 transition-colors" 
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredQuotes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun devis trouvé</p>
          </div>
        )}
      </div>

      {/* Modal Pro Template */}
      {showProModal && (
        <ProTemplateModal
          isOpen={showProModal}
          onClose={() => setShowProModal(false)}
          templateName={blockedTemplateName}
        />
      )}

      {/* Page d'upgrade */}
      {showUpgradePage && (
        <div className="fixed inset-0 z-[60] bg-gray-500 bg-opacity-75">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
              <div className="text-center">
                <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-4">Passez à la version Pro</h3>
                <p className="text-gray-600 mb-6">
                  Débloquez tous les templates premium et fonctionnalités avancées !
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowUpgradePage(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Fermer
                  </button>
                  <button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg">
                    Acheter Pro
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}