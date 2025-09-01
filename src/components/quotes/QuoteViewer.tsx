import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLicense } from '../../contexts/LicenseContext';
import { Quote } from '../../contexts/DataContext';
import TemplateRenderer from '../templates/TemplateRenderer';
import ProTemplateModal from '../license/ProTemplateModal';
import { X, Download, Edit, Printer } from 'lucide-react';

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
  const [selectedTemplate, setSelectedTemplate] = React.useState('template1');
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
    const htmlContent = generateTemplateHTMLWithSelectedTemplate();
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `Devis_${quote.number}.html`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 500);
      };
    }
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
          font-size: 15px;
          background: white;
          width: 210mm;
          min-height: 297mm;
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

  const generateTemplate1HTML = () => {
    return `
      <div style="background: #fff; max-width: 900px; margin: auto; border: 1px solid #d1d5db; font-family: Arial, sans-serif;">
        
        <!-- HEADER -->
        <div style="padding: 30px; border-bottom: 1px solid #d1d5db;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 24px;">
              ${user?.company?.logo ? `<img src="${user.company.logo}" alt="Logo" style="height: 80px;" />` : ''}
              <div>
                <h2 style="font-size: 35px; font-weight: bold; color: #111827; margin: 0;">${user?.company?.name || ''}</h2>
                <p style="font-size: 15px; color: #4b5563; margin: 2px 0;">${user?.company?.activity || ''}</p>
                <p style="font-size: 15px; color: #4b5563; margin: 2px 0;">${user?.company?.address || ''}</p>
              </div>
            </div>
            <div style="text-align: right;">
              <h1 style="font-size: 28px; font-weight: bold; color: #111827; margin: 0;">Devis</h1>
            </div>
          </div>
        </div>

        <!-- CLIENT + DATES -->
        <div style="padding: 30px; border-bottom: 1px solid #d1d5db;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
            
            <!-- Client -->
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
              <h3 style="font-weight: bold; font-size: 18px; text-align: center; margin: 0 0 15px 0; padding-bottom: 8px; border-bottom: 1px solid #d1d5db; color: #111827;">
                CLIENT : ${quote.client.name} ${quote.client.address || ''}
              </h3>
              <p style="font-size: 14px; color: #374151; text-align: center; margin: 4px 0;"><strong>ICE:</strong> ${quote.client.ice || ''}</p>
            </div>

            <!-- Dates -->
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
              <h3 style="font-weight: bold; font-size: 18px; text-align: center; margin: 0 0 15px 0; padding-bottom: 8px; border-bottom: 1px solid #d1d5db; color: #111827;">
                DATE : ${new Date(quote.date).toLocaleDateString('fr-FR')}
              </h3>
              <p style="font-size: 14px; color: #374151; text-align: center; margin: 4px 0;">
                <strong>Devis N° :</strong> ${quote.number}
              </p>
              <p style="font-size: 14px; color: #374151; text-align: center; margin: 4px 0;">
                <strong>Valide jusqu'au :</strong> ${new Date(quote.validUntil).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        </div>

        <!-- TABLE PRODUITS -->
        <div style="padding: 30px; border-bottom: 1px solid #d1d5db;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead style="background: #f3f4f6;">
              <tr>
                <th style="border: 1px solid #d1d5db; padding: 15px; text-align: center; font-weight: bold;">DÉSIGNATION</th>
                <th style="border: 1px solid #d1d5db; padding: 15px; text-align: center; font-weight: bold;">QUANTITÉ</th>
                <th style="border: 1px solid #d1d5db; padding: 15px; text-align: center; font-weight: bold;">P.U. HT</th>
                <th style="border: 1px solid #d1d5db; padding: 15px; text-align: center; font-weight: bold;">TOTAL HT</th>
              </tr>
            </thead>
            <tbody>
              ${quote.items.map((item: any) => `
                <tr>
                  <td style="border: 1px solid #e5e7eb; padding: 15px; text-align: center;">${item.description}</td>
                  <td style="border: 1px solid #e5e7eb; padding: 15px; text-align: center;">${item.quantity.toFixed(3)}</td>
                  <td style="border: 1px solid #e5e7eb; padding: 15px; text-align: center;">${item.unitPrice.toFixed(2)} MAD</td>
                  <td style="border: 1px solid #e5e7eb; padding: 15px; text-align: center;">${item.total.toFixed(2)} MAD</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- TOTALS -->
        <div style="padding: 30px;">
          <div style="display: flex; justify-content: space-between; gap: 30px;">
            
            <!-- Bloc gauche -->
            <div style="width: 45%; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 15px;">
              <p style="font-size: 18px; font-weight: bold;text-align:center; margin-bottom: 18px;">Arrêtée le présent devis à la somme de :</p>
              <p style="font-size: 18px; margin: 0;">• ${quote.totalInWords}</p>
            </div>

            <!-- Bloc droit -->
            <div style="width: 45%; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 18px;">
                <span>Total HT :</span>
                <span><strong>${quote.subtotal.toFixed(2)} MAD</strong></span>
              </div>
              <div style="margin-bottom:10px; font-size:18px;">
                ${(() => {
                  const vatGroups = quote.items.reduce((acc, item) => {
                    const vatAmount = (item.unitPrice * item.quantity * item.vatRate) / 100;
                    if (!acc[item.vatRate]) {
                      acc[item.vatRate] = { amount: 0, products: [] };
                    }
                    acc[item.vatRate].amount += vatAmount;
                    acc[item.vatRate].products.push(item.description);
                    return acc;
                  }, {});

                  const vatRates = Object.keys(vatGroups);

                  return vatRates.map(rate => `
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                      <span>
                        TVA : ${rate}% 
                        ${vatRates.length > 1 
                          ? `<span style="font-size:10px; color:#555;">(${vatGroups[rate].products.join(", ")})</span>` 
                          : ""}
                      </span>
                      <span><strong>${vatGroups[rate].amount.toFixed(2)} MAD</strong></span>
                    </div>
                  `).join("");
                })()}
              </div>
              
              <div style="display: flex; justify-content: space-between; border-top: 1px solid #d1d5db; padding-top: 15px; font-weight: bold; font-size: 18px;">
                <span>TOTAL TTC :</span>
                <span>${quote.totalTTC.toFixed(2)} MAD</span>
              </div>
            </div>
          </div>
        </div>

        <!-- SIGNATURE -->
        <div style="padding: 10px;">
          <div style="width: 300px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; text-align: center;">
            <div style="font-weight: bold; margin-bottom: 18px;">Signature</div>
            <div style="border: 2px solid #d1d5db; border-radius: 8px; height: 120px;"></div>
          </div>
        </div>

        <!-- FOOTER -->
        <div style="background: #f3f4f6; border-top: 2px solid #9ca3af; padding: 20px;text-align:center; font-size: 18px; color: #374151; ">
          <p style="margin:0;">
            <strong>${user?.company?.name || ''}</strong> ${user?.company?.address || ''} 
            <strong>Tél :</strong> ${user?.company?.phone || ''} - 
            <strong>Email :</strong> ${user?.company?.email || ''}- 
            Site: ${user?.company?.website || ''} - 
            <strong>ICE:</strong> ${user?.company?.ice || ''} - 
            <strong>IF:</strong> ${user?.company?.if || ''} - 
            <strong>RC:</strong> ${user?.company?.rc || ''} - 
            <strong>CNSS:</strong> ${user?.company?.cnss || ''} - 
            <strong>Patente:</strong> ${user?.company?.patente || ''}
          </p>
        </div>
      </div>
    `;
  };

  const generateTemplate2HTML = () => {
    return `
      <div style="background:white; max-width:800px; margin:0 auto; border:1px solid black; font-family: Arial, sans-serif;">
        
        <!-- HEADER -->
        <div style="padding:10px; border-bottom:1px solid black; background:black; color:white; text-align:center;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            
            <!-- Logo -->
            ${user?.company?.logo ? `<img src="${user.company.logo}" alt="Logo" style="height:115px; width:auto;" />` : ''}

            <!-- Nom de l'entreprise centré -->
            <div style="flex:1; text-align:center;">
              <h2 style="font-size:38px; font-weight:800; margin:0;">${user?.company?.name || ''}</h2>
              <h1 style="font-size:25px; font-weight:bold; margin-top:8px;">Devis</h1>
            </div>
            <div style="width:115px;"></div>
          </div>
        </div>

        <!-- CLIENT + DATES -->
        <div style="padding:30px; border-bottom:1px solid black;">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
            
            <div style="background:#f8f9fa; padding:20px; border-radius:8px; border:1px solid black; text-align:center;">
              <h3 style="font-weight:bold; font-size:18px; color:black; margin-bottom:15px; border-bottom:1px solid black; padding-bottom:8px;">
                CLIENT : ${quote.client.name} ${quote.client.address}
              </h3>
              <p style="font-size:14px; color:black; margin:4px 0;"><strong>ICE:</strong> ${quote.client.ice}</p>
            </div>

            <div style="background:#f8f9fa; padding:20px; border-radius:8px; border:1px solid black; text-align:center;">
              <h3 style="font-weight:bold; font-size:18px; color:black; margin-bottom:15px; border-bottom:1px solid black; padding-bottom:8px;">
                DATE : ${new Date(quote.date).toLocaleDateString('fr-FR')}
              </h3>
              <p style="font-size:14px; color:black; margin:4px 0;"><strong>Devis N° :</strong> ${quote.number}</p>
              <p style="font-size:14px; color:black; margin:4px 0;"><strong>Valide jusqu'au :</strong> ${new Date(quote.validUntil).toLocaleDateString('fr-FR')}</p>
            </div>

          </div>
        </div>

        <!-- TABLE PRODUITS -->
        <div style="padding:30px; border-bottom:1px solid black;">
          <div style="border:1px solid black; border-radius:8px; overflow:hidden;">
            <table style="width:100%; border-collapse:collapse;">
              <thead style="background:black; color:white;">
                <tr>
                  <th style="border-right:1px solid white; padding:15px; text-align:center; font-weight:bold;">DÉSIGNATION</th>
                  <th style="border-right:1px solid white; padding:15px; text-align:center; font-weight:bold;">QUANTITÉ</th>
                  <th style="border-right:1px solid white; padding:15px; text-align:center; font-weight:bold;">P.U. HT</th>
                  <th style="padding:15px; text-align:center; font-weight:bold;">TOTAL HT</th>
                </tr>
              </thead>
              <tbody>
                ${quote.items.map((item, index) => `
                  <tr style="border-top:1px solid black; background:${index % 2 === 0 ? 'white' : '#f8f9fa'};">
                    <td style="border-right:1px solid black; padding:15px; text-align:center;">${item.description}</td>
                    <td style="border-right:1px solid black; padding:15px; text-align:center;">${item.quantity.toFixed(3)}</td>
                    <td style="border-right:1px solid black; padding:15px; text-align:center;">${item.unitPrice.toFixed(2)} MAD</td>
                    <td style="padding:15px; text-align:center; font-weight:500;">${item.total.toFixed(2)} MAD</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- TOTALS -->
        <div style="padding:30px;">
          <div style="display:flex; justify-content:space-between;">
            
            <!-- Bloc gauche -->
            <div style="width:300px; background:#f8f9fa; border:1px solid black; border-radius:8px; padding:18px; text-align:center;">
              <p style="font-size:14px; font-weight:bold; margin-bottom:15px;">Arrêtée le présent devis à la somme de :</p>
              <p style="font-size:14px; border-top:1px solid black; padding-top:8px; margin:0;">• ${quote.totalInWords}</p>
            </div>

            <!-- Bloc droit -->
            <div style="width:300px; background:#f8f9fa; border:1px solid black; border-radius:8px; padding:20px;">
              <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:14px;">
                <span>Total HT :</span><span style="font-weight:500;">${quote.subtotal.toFixed(2)} MAD</span>
              </div>
              <div style="margin-bottom:10px; font-size:14px;">
                ${(() => {
                  const vatGroups = quote.items.reduce((acc, item) => {
                    const vatAmount = (item.unitPrice * item.quantity * item.vatRate) / 100;
                    if (!acc[item.vatRate]) {
                      acc[item.vatRate] = { amount: 0, products: [] };
                    }
                    acc[item.vatRate].amount += vatAmount;
                    acc[item.vatRate].products.push(item.description);
                    return acc;
                  }, {});

                  const vatRates = Object.keys(vatGroups);

                  return vatRates.map(rate => `
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                      <span>
                        TVA : ${rate}% 
                        ${vatRates.length > 1 
                          ? `<span style="font-size:10px; color:#555;">(${vatGroups[rate].products.join(", ")})</span>` 
                          : ""}
                      </span>
                      <span><strong>${vatGroups[rate].amount.toFixed(2)} MAD</strong></span>
                    </div>
                  `).join("");
                })()}
              </div>
              <div style="display:flex; justify-content:space-between; font-size:18px; font-weight:bold; border-top:1px solid black; padding-top:10px;">
                <span>TOTAL TTC :</span><span>${quote.totalTTC.toFixed(2)} MAD</span>
              </div>
            </div>

          </div>
        </div>

        <!-- SIGNATURE -->
        <div style="padding:15px;">
          <div style="width:300px; background:#f8f9fa; border:1px solid black; border-radius:8px; padding:20px; text-align:center;">
            <p style="font-size:18px; font-weight:bold; margin-bottom:15px;">Signature</p>
            <div style="border:2px solid black; border-radius:8px; height:100px;"></div>
          </div>
        </div>

        <!-- FOOTER -->
        <div style="background:black; color:white; border-top:2px solid white; padding:20px; text-align:center; font-size:14px;">
          <p style="margin:0;">
            <strong>${user?.company?.name || ''}</strong> ${user?.company?.address || ''} —
            <strong>Tél :</strong> ${user?.company?.phone || ''} —
            <strong>Email :</strong> ${user?.company?.email || ''} —
            <strong>Site :</strong> ${user?.company?.website || ''} —
            <strong>ICE :</strong> ${user?.company?.ice || ''} —
            <strong>IF :</strong> ${user?.company?.if || ''} —
            <strong>RC :</strong> ${user?.company?.rc || ''} —
            <strong>CNSS :</strong> ${user?.company?.cnss || ''} —
            <strong>Patente :</strong> ${user?.company?.patente || ''}
          </p>
        </div>

      </div>
    `;
  };

  const generateTemplate3HTML = () => {
    return generateTemplate1HTML(); // Simplifié pour l'exemple
  };

  const generateTemplate4HTML = () => {
    return generateTemplate1HTML(); // Simplifié pour l'exemple
  };

  const generateTemplate5HTML = () => {
    return generateTemplate1HTML(); // Simplifié pour l'exemple
  };

  // Fonction pour convertir les nombres en mots (simplifiée)
  const convertNumberToWords = (num: number): string => {
    // Utiliser la fonction existante ou une version simplifiée
    return `${num.toFixed(2)} dirhams`;
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
          <div id="quote-content">
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