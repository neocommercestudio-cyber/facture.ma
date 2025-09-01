import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLicense } from '../../contexts/LicenseContext';
import { Quote } from '../../contexts/DataContext';
import TemplateRenderer from '../templates/TemplateRenderer';
import ProTemplateModal from '../license/ProTemplateModal';
import { X, Download, Edit, Printer } from 'lucide-react';
import html2pdf from 'html2pdf.js';

interface QuoteViewerProps {
  quote: Quote;
  onClose: () => void;
  onEdit: () => void;
  onDownload: () => void;
  onUpgrade?: () => void;
}

export default function QuoteViewer({ quote, onClose, onEdit, onDownload, onUpgrade }: QuoteViewerProps) {
  const { user } = useAuth();
  const { licenseType } = useLicense();
  const [selectedTemplate, setSelectedTemplate] = React.useState(user?.company?.defaultTemplate || 'template1');
  const [showProModal, setShowProModal] = React.useState(false);

  const templates = [
    { id: 'template1', name: 'Classique', isPro: false },
    { id: 'template2', name: 'Moderne Coloré', isPro: true },
    { id: 'template3', name: 'Minimaliste', isPro: true },
    { id: 'template4', name: 'Corporate', isPro: true },
    { id: 'template5', name: 'Premium Élégant', isPro: true }
  ];

  const getTemplateName = (templateId: string) => {
    return templates.find(t => t.id === templateId)?.name || 'Template';
  };

  const isTemplateProOnly = (templateId: string) => {
    return templates.find(t => t.id === templateId)?.isPro || false;
  };

  const handlePrint = () => {
    if (isTemplateProOnly(selectedTemplate) && licenseType !== 'pro') {
      setShowProModal(true);
      return;
    }
    generatePDFWithTemplate();
  };

  const handleDownloadPDF = () => {
    if (isTemplateProOnly(selectedTemplate) && licenseType !== 'pro') {
      setShowProModal(true);
      return;
    }
    generatePDFWithTemplate();
  };

  const generatePDFWithTemplate = () => {
    // Obtenir le contenu directement depuis l'élément affiché
    const quoteContent = document.getElementById('quote-content');
    if (!quoteContent) {
      alert('Erreur: Contenu du devis non trouvé');
      return;
    }

    // Options pour html2pdf
    const options = {
      margin: [5, 5, 5, 5],
      filename: `Devis_${quote.number}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: false,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 800,
        height: 1200
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
      .from(quoteContent)
      .save()
      .catch((error) => {
        console.error('Erreur lors de la génération du PDF:', error);
        alert('Erreur lors de la génération du PDF');
      });
  };

  const generateTemplateHTMLWithSelectedTemplate = () => {
    let templateContent = '';
    
    switch (selectedTemplate) {
      case 'template1':
        templateContent = generateTemplate1HTML();
        break;
      case 'template2':
        templateContent = generateTemplate2HTML();
        break;
      case 'template3':
        templateContent = generateTemplate3HTML();
        break;
      case 'template4':
        templateContent = generateTemplate4HTML();
        break;
      case 'template5':
        templateContent = generateTemplate5HTML();
        break;
      default:
        templateContent = generateTemplate1HTML();
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
        <title>Devis ${quote.number}</title>
        ${baseStyles}
      </head>
      <body>
        ${templateContent}
      </body>
      </html>
    `;
  };











  const generateTemplate2HTML = () => {
    return generateTemplate1HTML();
  };

  const generateTemplate3HTML = () => {
    return generateTemplate1HTML();
  };

  const generateTemplate4HTML = () => {
    return generateTemplate1HTML();
  };

  const generateTemplate5HTML = () => {
    return generateTemplate1HTML();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Devis {quote.number}
            </h3>
            <div className="flex items-center space-x-3">
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="template1">Classique</option>
                <option value="template2">Moderne</option>
                <option value="template3">Minimaliste</option>
                <option value="template4">Corporate</option>
                <option value="template5">Premium</option>
              </select>
              <button
                onClick={handleDownloadPDF}
                className="inline-flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>PDF</span>
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer</span>
              </button>
              <button
                onClick={onEdit}
                className="inline-flex items-center space-x-2 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Modifier</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quote Content */}
          <div id="quote-content" style={{ backgroundColor: 'white', padding: '20px' }}>
            <TemplateRenderer 
              templateId={selectedTemplate}
              data={quote}
              type="quote"
            />
          </div>

          {/* Modal Pro Template */}
          {showProModal && (
            <ProTemplateModal
              isOpen={showProModal}
              onClose={() => setShowProModal(false)}
              templateName={getTemplateName(selectedTemplate)}
            />
          )}
        </div>
      </div>
    </div>
  );
}