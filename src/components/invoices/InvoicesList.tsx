import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useLicense } from '../../contexts/LicenseContext';
import InvoiceViewer from './InvoiceViewer';
import EditInvoice from './EditInvoice';
import ProTemplateModal from '../license/ProTemplateModal';
import { Plus, Search, Filter, Download, Eye, Edit, Trash2, Crown } from 'lucide-react';
import html2pdf from 'html2pdf.js';

export default function InvoicesList() {
  const { t } = useLanguage();
  const { licenseType } = useLicense();
  const { invoices, deleteInvoice, updateInvoice } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewingInvoice, setViewingInvoice] = useState<string | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<string | null>(null);
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
      case 'paid':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            {t('paid')}
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            {t('pending')}
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            {t('overdue')}
          </span>
        );
      default:
        return null;
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteInvoice = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      deleteInvoice(id);
    }
  };

  const handleViewInvoice = (id: string) => {
    setViewingInvoice(id);
  };

  const handleDownloadInvoice = (id: string) => {
    const invoice = invoices.find(inv => inv.id === id);
    if (invoice) {
      // Vérifier si le template par défaut est Pro et l'utilisateur est Free
      if (isTemplateProOnly('template1') && licenseType !== 'pro') {
        setBlockedTemplateName(getTemplateName('template1'));
        setShowProModal(true);
        return;
      }
      downloadInvoicePDF(invoice, 'template1'); // Template par défaut pour la liste
    }
  };

  const downloadInvoicePDF = (invoice: any, templateId: string = 'template1') => {
    // Créer un élément temporaire avec le contenu du template
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = generateTemplateHTMLWithTemplate(invoice, templateId);
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    document.body.appendChild(tempDiv);

    // Options pour html2pdf
    const options = {
      margin: [10, 10, 10, 10],
      filename: `Facture_${invoice.number}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        onclone: function(clonedDoc) {
          // Remplacer les images externes par un placeholder en cas d'erreur CORS
          const images = clonedDoc.querySelectorAll('img');
          images.forEach(img => {
            img.onerror = function() {
              this.style.display = 'none';
            };
          });
        },
        backgroundColor: '#ffffff'
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' 
      }
    };

    // Générer et télécharger le PDF
    html2pdf()
      .set(options)
      .from(tempDiv)
      .save()
      .then(() => {
        // Nettoyer l'élément temporaire
        document.body.removeChild(tempDiv);
      })
      .catch((error) => {
        console.error('Erreur lors de la génération du PDF:', error);
        document.body.removeChild(tempDiv);
        alert('Erreur lors de la génération du PDF');
      });
  };

  const handleEditInvoice = (id: string) => {
    setEditingInvoice(id);
  };

  const handleSaveEdit = (id: string, updatedData: any) => {
    updateInvoice(id, updatedData);
    setEditingInvoice(null);
  };


  const generateTemplateHTMLWithTemplate = (invoice: any, templateId: string) => {
    // Générer le HTML selon le template spécifié
    let templateContent = '';
    
    switch (templateId) {
      case 'template1':
        templateContent = generateTemplate1HTML(invoice);
        break;
      case 'template2':
        templateContent = generateTemplate2HTML(invoice);
        break;
      case 'template3':
        templateContent = generateTemplate3HTML(invoice);
        break;
      case 'template4':
        templateContent = generateTemplate4HTML(invoice);
        break;
      case 'template5':
        templateContent = generateTemplate5HTML(invoice);
        break;
      default:
        templateContent = generateTemplate1HTML(invoice);
    }
    
    const baseStyles = `
      <style>
        @page {
          size: A4;
          margin: 15mm;
        }
        @media print {
          body { 
            margin: 0; 
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print { display: none !important; }
        }
        body {
          font-family: Arial, sans-serif;
          line-height: 1.5;
          color: #333;
          margin: 0;
          padding: 0;
          font-size: 14px;
          background: white;
          max-width: 800px;
          margin: 0 auto;
        }
      </style>
    `;

    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Facture ${invoice.number}</title>
        ${baseStyles}
      </head>
      <body>
        ${templateContent}
      </body>
      </html>
    `;
  };

  const generateTemplate1HTML = (invoice: any) => {
    return `
      <div style="padding: 20px; font-family: Arial, sans-serif; background: white;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #d1d5db;">
          <div>
            <h2 style="margin: 0 0 8px 0; font-size: 20px; color: #1f2937; font-weight: bold;">${invoice.client.name || 'Entreprise'}</h2>
            <p style="margin: 2px 0; font-size: 12px;">${invoice.client.address || ''}</p>
            <p style="margin: 2px 0; font-size: 12px;">${invoice.client.phone || ''}</p>
            <div style="margin-top: 8px; font-size: 11px; color: #6b7280;">
              <p style="margin: 1px 0;">ICE: ${invoice.client.ice || ''}</p>
            </div>
          </div>
          <div style="text-align: right;">
            <h1 style="margin: 0 0 8px 0; font-size: 28px; color: #059669; font-weight: bold;">FACTURE</h1>
            <p style="margin: 2px 0; font-size: 12px;"><strong>N°:</strong> ${invoice.number}</p>
            <p style="margin: 2px 0; font-size: 12px;"><strong>Date:</strong> ${new Date(invoice.date).toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
        
        <!-- Table -->
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb; font-weight: bold;">DÉSIGNATION</th>
              <th style="padding: 12px; text-align: center; border: 1px solid #e5e7eb; font-weight: bold;">QUANTITÉ</th>
              <th style="padding: 12px; text-align: center; border: 1px solid #e5e7eb; font-weight: bold;">P.U. HT</th>
              <th style="padding: 12px; text-align: center; border: 1px solid #e5e7eb; font-weight: bold;">TOTAL HT</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map((item: any) => `
              <tr>
                <td style="padding: 12px; border: 1px solid #e5e7eb; text-align: center;">${item.description}</td>
                <td style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">${item.quantity.toFixed(3)}</td>
                <td style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">${item.unitPrice.toFixed(2)} MAD</td>
                <td style="padding: 12px; text-align: center; border: 1px solid #e5e7eb; font-weight: 500;">${item.total.toFixed(2)} MAD</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <!-- Totals -->
        <div style="display: flex; justify-content: space-between; margin: 20px 0;">
          <!-- Bloc gauche -->
          <div style="width: 45%; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px;">
            <p style="font-size: 14px; font-weight: bold; text-align: center; margin-bottom: 10px;">Arrêtée la présente facture à la somme de :</p>
            <p style="font-size: 14px; margin: 0;">• ${invoice.totalInWords}</p>
          </div>

          <!-- Bloc droit -->
          <div style="width: 45%; background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
            <div style="display: flex; justify-content: space-between; margin: 4px 0; font-size: 14px;">
              <span>Sous-total HT:</span>
              <span><strong>${invoice.subtotal.toFixed(2)} MAD</strong></span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 4px 0; font-size: 14px;">
              <span>TVA:</span>
              <span><strong>${invoice.totalVat.toFixed(2)} MAD</strong></span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 16px; color: #059669; border-top: 1px solid #d1d5db; padding-top: 8px; margin-top: 8px;">
              <span>Total TTC:</span>
              <span>${invoice.totalTTC.toFixed(2)} MAD</span>
            </div>
          </div>
        </div>
        
        <!-- Signature -->
        <div style="margin: 20px 0;">
          <div style="width: 300px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; text-align: center;">
            <div style="font-weight: bold; margin-bottom: 15px;">Signature</div>
            <div style="border: 2px solid #d1d5db; border-radius: 8px; height: 100px;"></div>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #f3f4f6; border-top: 2px solid #9ca3af; padding: 20px; text-align: center; font-size: 12px; color: #374151;">
          <p style="margin: 0;">
            <strong>${invoice.client.name || ''}</strong> | ${invoice.client.address || ''} |
            <strong>Tél :</strong> ${invoice.client.phone || ''} |
            <strong>Email :</strong> ${invoice.client.email || ''} |
            <strong>Site :</strong> ${invoice.client.website || ''} |
            <strong>ICE :</strong> ${invoice.client.ice || ''} |
            <strong>Patente :</strong> ${invoice.client.patente || ''}
          </p>
        </div>
      </div>
    `;
  };

  // Ajouter les autres fonctions de génération de templates (template2, 3, 4, 5)
  const generateTemplate2HTML = (invoice: any) => {
    return generateTemplate1HTML(invoice);
  };

  const generateTemplate3HTML = (invoice: any) => {
    return generateTemplate1HTML(invoice);
  };

  const generateTemplate4HTML = (invoice: any) => {
    return generateTemplate1HTML(invoice);
  };

  const generateTemplate5HTML = (invoice: any) => {
    return generateTemplate1HTML(invoice);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('invoices')}</h1>
        <Link
          to="/invoices/create"
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-4 h-4" />
          <span>{t('createInvoice')}</span>
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
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Rechercher par client ou numéro..."
              />
            </div>
          </div>
          
          <div className="flex space-x-4">
          
            
  
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Facture
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date émission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant TTC
                </th>
               
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{invoice.number}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{invoice.client.name}</div>
                      <div className="text-xs text-gray-500">ICE: {invoice.client.ice}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(invoice.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {invoice.totalTTC.toLocaleString()} MAD
                  </td>
                 
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => handleViewInvoice(invoice.id)}
                        className="text-blue-600 hover:text-blue-700 transition-colors" 
                        title="Voir"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      <button 
                        onClick={() => handleEditInvoice(invoice.id)}
                        className="text-amber-600 hover:text-amber-700 transition-colors" 
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteInvoice(invoice.id)}
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

        {filteredInvoices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucune facture trouvée</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {viewingInvoice && (
        <InvoiceViewer
          invoice={invoices.find(inv => inv.id === viewingInvoice)!}
          onClose={() => setViewingInvoice(null)}
          onEdit={() => {
            setViewingInvoice(null);
            setEditingInvoice(viewingInvoice);
          }}
          onDownload={() => handleDownloadInvoice(viewingInvoice)}
          onUpgrade={() => setShowUpgradePage(true)}
        />
      )}

      {editingInvoice && (
        <EditInvoice
          invoice={invoices.find(inv => inv.id === editingInvoice)!}
          onSave={(updatedData) => handleSaveEdit(editingInvoice, updatedData)}
          onCancel={() => setEditingInvoice(null)}
        />
      )}

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