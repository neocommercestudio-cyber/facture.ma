import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLicense } from '../../contexts/LicenseContext';
import { Invoice } from '../../contexts/DataContext';
import TemplateRenderer from '../templates/TemplateRenderer';
import ProTemplateModal from '../license/ProTemplateModal';
import { X, Download, Edit, Printer } from 'lucide-react';
import html2pdf from 'html2pdf.js';

interface InvoiceViewerProps {
  invoice: Invoice;
  onClose: () => void;
  onEdit: () => void;
  onDownload: () => void;
  onUpgrade?: () => void;
}

export default function InvoiceViewer({ invoice, onClose, onEdit, onDownload, onUpgrade }: InvoiceViewerProps) {
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
    // Vérifier si le template est Pro et l'utilisateur est Free
    if (isTemplateProOnly(selectedTemplate) && licenseType !== 'pro') {
      setShowProModal(true);
      return;
    }
    generatePDFWithTemplate();
  };

  const handleDownloadPDF = () => {
    // Vérifier si le template est Pro et l'utilisateur est Free
    if (isTemplateProOnly(selectedTemplate) && licenseType !== 'pro') {
      setShowProModal(true);
      return;
    }
    generatePDFWithTemplate();
  };

  const generatePDFWithTemplate = () => {
    // Obtenir le contenu directement depuis l'élément affiché
    const invoiceContent = document.getElementById('invoice-content');
    if (!invoiceContent) {
      alert('Erreur: Contenu de la facture non trouvé');
      return;
    }

    // Options pour html2pdf
    const options = {
      margin: [5, 5, 5, 5],
      filename: `Facture_${invoice.number}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        allowTaint: false,
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
      .from(invoiceContent)
      .save()
      .catch((error) => {
        console.error('Erreur lors de la génération du PDF:', error);
        alert('Erreur lors de la génération du PDF');
      });
  };

  const generateTemplateHTMLWithSelectedTemplate = () => {
    // Générer le HTML selon le template sélectionné
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
        <title>Facture ${invoice.number}</title>
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
          <h1 style="font-size: 28px; font-weight: bold; color: #111827; margin: 0;">Facture</h1>
        </div>
      </div>
    </div>

    <!-- CLIENT + DATES -->
    <div style="padding: 30px; border-bottom: 1px solid #d1d5db;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
        
        <!-- Client -->
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
          <h3 style="font-weight: bold; font-size: 18px; text-align: center; margin: 0 0 15px 0; padding-bottom: 8px; border-bottom: 1px solid #d1d5db; color: #111827;">
            CLIENT : ${invoice.client.name} ${invoice.client.address || ''}
          </h3>
          <p style="font-size: 14px; color: #374151; text-align: center; margin: 4px 0;"><strong>ICE:</strong> ${invoice.client.ice || ''}</p>
        </div>

        <!-- Dates -->
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
          <h3 style="font-weight: bold; font-size: 18px; text-align: center; margin: 0 0 15px 0; padding-bottom: 8px; border-bottom: 1px solid #d1d5db; color: #111827;">
            DATES : ${new Date(invoice.date).toLocaleDateString('fr-FR')}
          </h3>
          <p style="font-size: 14px; color: #374151; text-align: center; margin: 4px 0;">
            <strong>Facture N° :</strong> ${invoice.number}
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
          ${invoice.items.map((item: any) => `
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
          <p style="font-size: 18px; font-weight: bold;text-align:center; margin-bottom: 18px;">Arrêtée la présente facture à la somme de :</p>
          <p style="font-size: 18px; margin: 0;">• ${invoice.totalInWords}</p>
        </div>

        <!-- Bloc droit -->
        <div style="width: 45%; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 18px;">
            <span>Total HT :</span>
            <span><strong>${invoice.subtotal.toFixed(2)} MAD</strong></span>
          </div>
         <div style="margin-bottom:10px; font-size:18px;">
  ${(() => {
    // Grouper les TVA
    const vatGroups = invoice.items.reduce((acc, item) => {
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
            <span>${invoice.totalTTC.toFixed(2)} MAD</span>
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
        <strong>Email :</strong> ${user?.company?.email || ''} - 
        <strong>Site:</strong> ${user?.company?.website || ''} - 
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
            <h1 style="font-size:25px; font-weight:bold; margin-top:8px;">Facture</h1>
          </div>
          <div style="width:115px;"></div>
        </div>
      </div>

      <!-- CLIENT + DATES -->
      <div style="padding:30px; border-bottom:1px solid black;">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
          
          <div style="background:#f8f9fa; padding:20px; border-radius:8px; border:1px solid black; text-align:center;">
            <h3 style="font-weight:bold; font-size:18px; color:black; margin-bottom:15px; border-bottom:1px solid black; padding-bottom:8px;">
              CLIENT : ${invoice.client.name} ${invoice.client.address}
            </h3>
            <p style="font-size:14px; color:black; margin:4px 0;"><strong>ICE:</strong> ${invoice.client.ice}</p>
          </div>

          <div style="background:#f8f9fa; padding:20px; border-radius:8px; border:1px solid black; text-align:center;">
            <h3 style="font-weight:bold; font-size:18px; color:black; margin-bottom:15px; border-bottom:1px solid black; padding-bottom:8px;">
              DATE : ${new Date(invoice.date).toLocaleDateString('fr-FR')}
            </h3>
            <p style="font-size:14px; color:black; margin:4px 0;"><strong>Facture N° :</strong> ${invoice.number}</p>
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
           ${invoice.items.map((item, index) => `
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
      <div style="padding:10px;">
        <div style="display:flex; justify-content:space-between;">
          
          <!-- Bloc gauche -->
          <div style="width:300px; background:#f8f9fa; border:1px solid black; border-radius:8px; padding:10px; text-align:center;">
            <p style="font-size:12px; font-weight:bold; margin-bottom:15px;">Arrêtée la présente facture à la somme de :</p>
            <p style="font-size:12px; border-top:1px solid black; padding-top:8px; margin:0;">• ${invoice.totalInWords}</p>
          </div>

          <!-- Bloc droit -->
          <div style="width:300px; background:#f8f9fa; border:1px solid black; border-radius:8px; padding:10px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:12px;">
              <span>Total HT :</span><span style="font-weight:500;">${invoice.subtotal.toFixed(2)} MAD</span>
            </div>
           <div style="margin-bottom:8px; font-size:12px;">
  ${(() => {
    // Grouper les TVA
    const vatGroups = invoice.items.reduce((acc, item) => {
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
            ? `<span style="font-size:8px; color:#555;">(${vatGroups[rate].products.join(", ")})</span>` 
            : ""}
        </span>
        <span><strong>${vatGroups[rate].amount.toFixed(2)} MAD</strong></span>
      </div>
    `).join("");
  })()}
</div>

            <div style="display:flex; justify-content:space-between; font-size:18px; font-weight:bold; border-top:1px solid black; padding-top:10px;">
              <span>TOTAL TTC :</span><span>${invoice.totalTTC.toFixed(2)} MAD</span>
            </div>
          </div>

        </div>
      </div>

    

      <!-- FOOTER -->
      <div style="padding:32px 20px 20px;position:relative;z-index:10;">
        <p>
          <strong>${user?.company.name}</strong> | ${user?.company.address} | 
          <strong>Tél :</strong> ${user?.company.phone} | <strong>ICE :</strong> ${user?.company.ice} |
          <strong>IF :</strong> ${user?.company.if} | <strong>RC :</strong> ${user?.company.rc} |
          <strong>CNSS :</strong> ${user?.company.cnss} | <strong>Patente :</strong> ${user?.company.rc} |
          <strong>EMAIL :</strong> ${user?.company.email} | <strong>SITE WEB :</strong> ${user?.company.website}
        </p>
      </div>

    </div>
  `;
};

const generateTemplate3HTML = () => {
  return `
  <div style="background: #fff; max-width: 1000px; margin: auto; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-radius: 8px; position: relative; overflow: hidden; font-family: Arial, sans-serif;">
    
    <!-- Motif haut -->
    <img src="https://i.ibb.co/svbQM5zT/p.png" alt="motif haut" style="position: absolute; top: 0; right: 0; width: 160px; height: 160px; object-fit: contain;" />
    <!-- Motif bas -->
    <img src="https://i.ibb.co/d0JqGQsK/pp.png" alt="motif bas" style="position: absolute; bottom: 0; left: 0; width: 160px; height: 160px; object-fit: contain;" />

    <!-- HEADER -->
    <div style="padding: 5px; text-align: center; position: relative; z-index: 5;">
      ${user?.company?.logo ? `<img src="${user.company.logo}" alt="Logo" style="height: 105px; margin: auto; margin-bottom: 18px;" />` : ''}
      <h1 style="font-size: 36px; font-weight: 600; color: #0a1f44; margin: 0;">${user?.company?.name || ''}</h1>
      <h2 style="font-size: 22px; font-weight: 400; margin-top: 15px; text-transform: uppercase; letter-spacing: 1px; color: #0a1f44;">
        FACTURE
      </h2>
    </div>

    <!-- CLIENT + DATES -->
    <div style="padding: 12px; border-bottom: 2px solid #0a1f44; position: relative; z-index: 10;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
        
        <!-- Client -->
        <div style="background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #0a1f44; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <h3 style="font-weight: bold; font-size: 18px; color: #0a1f44; margin: 0 0 15px 0; border-bottom: 1px solid #0a1f44; padding-bottom: 8px; text-align: center;">
            CLIENT : ${invoice.client.name} ${invoice.client.address || ''}
          </h3>
          <p style="font-size: 14px; text-align: center; color: #374151; margin: 4px 0;"><strong>ICE:</strong> ${invoice.client.ice || ''}</p>
        </div>

        <!-- Dates -->
        <div style="background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #0a1f44; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <h3 style="font-weight: bold; font-size: 18px; color: #0a1f44; margin: 0 0 15px 0; border-bottom: 1px solid #0a1f44; padding-bottom: 8px; text-align: center;">
            DATE : ${new Date(invoice.date).toLocaleDateString('fr-FR')}
          </h3>
          <p style="font-size: 14px; text-align: center; color: #374151; margin: 4px 0;">
            <strong>Facture N° :</strong> ${invoice.number}
          </p>
        </div>
      </div>
    </div>

    <!-- TABLE PRODUITS -->
    <div style="padding: 30px; border-bottom: 2px solid #0a1f44; position: relative; z-index: 10;">
      <table style="width: 100%; border: 1px solid #0a1f44; border-radius: 8px; border-collapse: collapse; overflow: hidden;">
        <thead style="background: #0a1f44; color: white;">
          <tr>
            <th style="padding: 15px; text-align: center;">Description</th>
            <th style="padding: 15px; text-align: center;">Quantité</th>
            <th style="padding: 15px; text-align: center;">Prix Unitaire</th>
            <th style="padding: 15px; text-align: center;">Total HT</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items.map((item: any) => `
            <tr style="border-top: 1px solid #0a1f44;">
              <td style="padding: 15px; text-align: center;">${item.description}</td>
              <td style="padding: 15px; text-align: center;">${item.quantity.toFixed(3)}</td>
              <td style="padding: 15px; text-align: center;">${item.unitPrice.toFixed(2)} MAD</td>
              <td style="padding: 15px; text-align: center; font-weight: 600;">${item.total.toFixed(2)} MAD</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- BLOCS TOTAUX -->
    <div style="padding: 30px; position: relative; z-index: 10;">
      <div style="display: flex; justify-content: space-between;">
        
        <!-- Bloc gauche -->
        <div style="width: 320px; background: #fff; border-radius: 8px; border: 1px solid #0a1f44; box-shadow: 0 2px 8px rgba(0,0,0,0.05); padding: 18px;">
          <p style="font-size: 15px; font-weight: bold; text-align: center; color: #0a1f44; margin-bottom: 15px;">
            Arrêtée la présente facture à la somme de :
          </p>
          <p style="font-size: 15px; font-weight: bold; color: #0a1f44; margin: 0; border-top: 1px solid #0a1f44; padding-top: 8px;">
            • ${invoice.totalInWords}
          </p>
        </div>

        <!-- Bloc droit -->
        <div style="width: 320px; background: #fff; border-radius: 8px; border: 1px solid #0a1f44; box-shadow: 0 2px 8px rgba(0,0,0,0.05); padding: 18px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
            <span>Total HT :</span>
            <span><strong>${invoice.subtotal.toFixed(2)} MAD</strong></span>
          </div>
          <div style="margin-bottom:10px; font-size:18px;">
  ${(() => {
    // Grouper les TVA
    const vatGroups = invoice.items.reduce((acc, item) => {
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



          
          <div style="display: flex; justify-content: space-between; border-top: 1px solid #0a1f44; padding-top: 15px; font-weight: bold; font-size: 18px; color: #0a1f44;">
            <span>TOTAL TTC :</span>
            <span>${invoice.totalTTC.toFixed(2)} MAD</span>
          </div>
        </div>
      </div>
    </div>

    <!-- SIGNATURE -->
    <div style="padding: 24px 30px; position: relative; z-index: 10;">
      <div style="width: 250px; border: 2px dashed #0a1f44; border-radius: 8px; height: 115px; display: flex; align-items: center; justify-content: center;">
        <span style="color: #9ca3af;">Signature</span>
      </div>
    </div>

    <!-- FOOTER -->
    <div style="background: #0a1f44; color: white; padding: 20px; text-align: center; font-size: 15px; position: relative; z-index: 10;">
      <p style="margin: 0;">
        <strong>${user?.company?.name || ''}</strong> | ${user?.company?.address || ''} |
        <strong>Tél :</strong> ${user?.company?.phone || ''} |
        <strong>ICE :</strong> ${user?.company?.ice || ''} |
        <strong>IF :</strong> ${user?.company?.if || ''} |
        <strong>RC :</strong> ${user?.company?.rc || ''} |
        <strong>CNSS :</strong> ${user?.company?.cnss || ''} |
        <strong>Patente :</strong> ${user?.company?.patente || ''} |
        <strong>Email :</strong> ${user?.company?.email || ''} |
        <strong>Site Web :</strong> ${user?.company?.website || ''}
      </p>
    </div>
  </div>
  `;
};
  
const generateTemplate4HTML = () => {
  return `
   <div style="background:#fff;max-width:900px;margin:0 auto;box-shadow:0 4px 15px rgba(0,0,0,0.1);border-radius:8px;font-family:Arial,sans-serif;">
    
    <!-- HEADER -->
<div style="position:relative;background:#24445C;color:#fff;padding:30px 40px;display:flex;align-items:center;justify-content:space-between;">
  <!-- Logo à gauche -->
  <div style="flex-shrink:0;">
    ${user?.company.logo ? `<img src="${user.company.logo}" alt="Logo" style="max-height:100px;" />` : ""}
  </div>

<div style="flex:1;text-align:center;">
    <h1 style="font-size:40px;font-weight:800;margin:0;">${user?.company.name}</h1>
    <h2 style="font-size:28px;font-weight:600;margin-top:20px;letter-spacing:3px;">
      FACTURE
    </h2>
  </div>

      
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style="position:absolute;bottom:0;left:0;width:100%;height:50px;">
        <path d="M0,48 C180,96 360,12 540,60 C720,108 900,36 1080,84 C1260,120 1440,72 1440,72 L1440,120 L0,120 Z" fill="#fff"/>
      </svg>
    </div>
    
<!-- CLIENT + DATES -->
<div style="padding:10px;border-bottom:2px solid #24445C;">
  <div style="display:flex;gap:20px;justify-content:space-between;">
    <div style="flex:1;background:#f9f9f9;padding:20px;border:1px solid #24445C;border-radius:8px;min-height:50px;display:flex;flex-direction:column;justify-content:center;">
      <h3 style="font-weight:bold;font-size:18px;color:#24445C;border-bottom:1px solid #24445C;padding-bottom:8px;margin-bottom:15px;text-align:center;">
        CLIENT : ${invoice.client.name} ${invoice.client.address}
      </h3>
      <p style="font-size:18px;text-align:center;"><strong>ICE:</strong> ${invoice.client.ice}</p>
    </div>

    <div style="flex:1;background:#f9f9f9;padding:20px;border:1px solid #24445C;border-radius:8px;min-height:50px;display:flex;flex-direction:column;justify-content:center;">
      <h3 style="font-weight:bold;font-size:18px;color:#24445C;border-bottom:1px solid #24445C;padding-bottom:8px;margin-bottom:15px;text-align:center;">
        DATE : ${new Date(invoice.date).toLocaleDateString("fr-FR")}
      </h3>
      <p style="font-size:18px;text-align:center;"><strong>Facture N° :</strong> ${invoice.number}</p>
    </div>
  </div>
</div>


    <!-- TABLE PRODUITS -->
    <div style="padding:30px;border-bottom:2px solid #24445C;">
      <table style="width:100%;border-collapse:collapse;border:1px solid #24445C;">
        <thead style="background:#24445C;color:#fff;">
          <tr>
            <th style="padding:15px;text-align:center;">Description</th>
            <th style="padding:15px;text-align:center;">Quantité</th>
            <th style="padding:15px;text-align:center;">Prix Unitaire</th>
            <th style="padding:15px;text-align:center;">Total HT</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items
            .map(
              (item) => `
            <tr style="border-top:1px solid #24445C;">
              <td style="padding:15px;text-align:center;">${item.description}</td>
              <td style="padding:15px;text-align:center;">${item.quantity.toFixed(3)}</td>
              <td style="padding:15px;text-align:center;">${item.unitPrice.toFixed(2)} MAD</td>
              <td style="padding:15px;text-align:center;font-weight:600;">${item.total.toFixed(2)} MAD</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>

   <!-- TOTALS -->
<div style="padding:15px;display:flex;justify-content:space-between;gap:15px;">
  <!-- Bloc montant en lettres -->
  <div style="flex:1;background:#f9f9f9;padding:10px;border:1px solid #24445C;border-radius:8px;min-height:90px;display:flex;flex-direction:column;justify-content:center;">
    <p style="font-size:16px;font-weight:bold;color:#24445C;text-align:center;margin:0;">
      Arrêtée la présente facture à la somme de :
    </p>
    <p style="margin-top:6px;font-size:16px;font-weight:bold;color:#000;text-align:center;">
      • ${invoice.totalInWords}
    </p>
  </div>

  <!-- Bloc calculs -->
  <div style="flex:1;background:#f9f9f9;padding:10px;border:1px solid #24445C;border-radius:8px;min-height:90px;display:flex;flex-direction:column;justify-content:center;">
    <p style="display:flex;justify-content:space-between;margin:2px 0;font-size:16px;">
      <span>Total HT :</span> <span style="font-weight:600;">${invoice.subtotal.toFixed(2)} MAD</span>
    </p>

    <div style="margin:4px 0;font-size:16px;">
      ${(() => {
        const vatGroups = invoice.items.reduce((acc, item) => {
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
          <p style="display:flex;justify-content:space-between;margin:2px 0;">
            <span>
              TVA : ${rate}% 
              ${vatRates.length > 1 
                ? `<span style="font-size:8px;color:#555;">(${vatGroups[rate].products.join(", ")})</span>` 
                : ""}
            </span>
            <span style="font-weight:600;">${vatGroups[rate].amount.toFixed(2)} MAD</span>
          </p>
        `).join("");
      })()}
    </div>

    <p style="display:flex;justify-content:space-between;font-size:18px;font-weight:bold;border-top:1px solid #24445C;padding-top:6px;margin-top:6px;">
      <span>TOTAL TTC :</span> <span>${invoice.totalTTC.toFixed(2)} MAD</span>
    </p>
  </div>
</div>

    <!-- SIGNATURE -->
    <div style="padding:30px;">
      <div style="width:250px;height:100px;border:2px dashed #24445C;border-radius:8px;display:flex;align-items:center;justify-content:center;">
        <span style="color:#999;">Signature</span>
      </div>
    </div>


    <!-- FOOTER -->
    <div style="position:relative;background:#24445C;color:#fff;text-align:center;font-size:15px;">
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style="position:absolute;top:0;left:0;width:100%;height:50px;">
        <path d="M0,0 L0,48 C180,72 360,12 540,48 C720,84 900,24 1080,60 C1260,96 1440,36 1440,36 L1440,0 Z" fill="#fff"/>
      </svg>
      <div style="padding:32px 20px 20px;position:relative;z-index:10;">
        <p>
          <strong>${user?.company.name}</strong> | ${user?.company.address} | 
          <strong>Tél :</strong> ${user?.company.phone} | <strong>ICE :</strong> ${user?.company.ice} |
          <strong>IF :</strong> ${user?.company.if} | <strong>RC :</strong> ${user?.company.rc} |
          <strong>CNSS :</strong> ${user?.company.cnss} | <strong>Patente :</strong> ${user?.company.rc} |
          <strong>EMAIL :</strong> ${user?.company.email} | <strong>SITE WEB :</strong> ${user?.company.website}
        </p>
      </div>
    </div>
  </div>
  `;
};

  const generateTemplate5HTML = () => {
     return `
  <div style="background:white; max-width:900px; margin:auto; font-family:Arial, sans-serif; border-radius:8px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.1)">
    
    <!-- HEADER avec wave -->
    <div style="position:relative;">
      <div style="background:#0a1f44; height:220px; color:white; display:flex; align-items:center; justify-content:space-between; padding:0 32px;">
        
        ${user?.company.logo ? `<img src="${user.company.logo}" alt="Logo" style="height:120px; width:auto;" />` : ""}
        
        <div style="flex:1; text-align:center;">
          <h1 style="font-size:40px; font-weight:800; margin:0;">${user?.company.name || ""}</h1>
          <h2 style="font-size:28px; font-weight:700; margin-top:20px; text-transform:uppercase; letter-spacing:2px;">Facture</h2>
        </div>

        <div style="width:50px;"></div>
      </div>

      <!-- vague rouge -->
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 80" style="position:absolute; bottom:0; left:0; width:100%;">
        <path fill="#c1121f" d="M0,64L60,58.7C120,53,240,43,360,37.3C480,32,600,32,720,42.7C840,53,960,75,1080,74.7C1200,75,1320,53,1380,42.7L1440,32V80H0Z"></path>
      </svg>
    </div>

    <!-- CLIENT + DATES -->
    <div style="padding:32px; border-bottom:1px solid black;">
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:32px;">
        
        <div style="background:#f9f9f9; padding:24px; border:1px solid black; border-radius:6px;">
          <h3 style="font-weight:bold; font-size:18px; color:black; margin:0 0 12px 0; padding-bottom:8px; border-bottom:1px solid black; text-align:center;">
            CLIENT : ${invoice.client.name} ${invoice.client.address}
          </h3>
          <div style="font-size:16px; color:black; text-align:center;">
            <p><strong>ICE:</strong> ${invoice.client.ice}</p>
          </div>
        </div>

        <div style="background:#f9f9f9; padding:24px; border:1px solid black; border-radius:6px;">
          <h3 style="font-weight:bold; font-size:18px; color:black; margin:0 0 12px 0; padding-bottom:8px; border-bottom:1px solid black; text-align:center;">
            DATE : ${new Date(invoice.date).toLocaleDateString("fr-FR")}
          </h3>
          <div style="font-size:16px; color:black; text-align:center;">
            <p><strong>Facture N° :</strong> ${invoice.number}</p>
          </div>
        </div>

      </div>
    </div>

    <!-- TABLE PRODUITS -->
    <div style="padding:32px; border-bottom:1px solid black;">
      <table style="width:100%; border:1px solid #0a1f44; border-radius:6px; border-collapse:collapse; overflow:hidden;">
        <thead style="background:#0a1f44; color:white;">
          <tr>
            <th style="padding:8px; text-align:center;">Description</th>
            <th style="padding:8px; text-align:center;">Quantité</th>
            <th style="padding:8px; text-align:center;">Prix Unitaire</th>
            <th style="padding:8px; text-align:center;">Total HT</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items.map(
            (item) => `
            <tr style="border-top:1px solid #0a1f44;">
              <td style="padding:8px; text-align:center;">${item.description}</td>
              <td style="padding:8px; text-align:center;">${item.quantity.toFixed(3)}</td>
              <td style="padding:8px; text-align:center;">${item.unitPrice.toFixed(2)} MAD</td>
              <td style="padding:8px; text-align:center; font-weight:bold;">${item.total.toFixed(2)} MAD</td>
            </tr>
          `
          ).join("")}
        </tbody>
      </table>
    </div>

    <!-- BLOCS TOTAUX -->
    <div style="padding:32px;">
      <div style="display:flex; justify-content:space-between;">
        
        <div style="width:300px; background:#f9f9f9; padding:16px; border:1px solid #0a1f44; border-radius:6px;">
          <div style="font-size:14px; font-weight:bold; text-align:center; padding-top:12px;">
            <p>Arrêtée la présente facture à la somme de :</p>
          </div>
          <div style="font-size:14px; font-weight:bold; border-top:1px solid #03224C; padding-top:8px; color:#03224C;">
            • ${invoice.totalInWords}
          </div>
        </div>

        <div style="width:300px; background:#f9f9f9; padding:16px; border:1px solid #0a1f44; border-radius:6px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:14px;">
            <span>Total HT :</span>
            <span style="font-weight:500;">${invoice.subtotal.toFixed(2)} MAD</span>
          </div>

<div style="margin-bottom:15px; font-size:16px;">
  ${(() => {
    // Grouper les TVA
    const vatGroups = invoice.items.reduce((acc, item) => {
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
      <p style="display:flex;justify-content:space-between;margin:2px 0;">
        <span>
          TVA : ${rate}% 
          ${vatRates.length > 1 
            ? `<span style="font-size:10px;color:#555;">(${vatGroups[rate].products.join(", ")})</span>` 
            : ""}
        </span>
        <span style="font-weight:600;">
          ${vatGroups[rate].amount.toFixed(2)} MAD
        </span>
      </p>
    `).join("");
  })()}
</div>



         
          <div style="display:flex; justify-content:space-between; font-size:14px; font-weight:bold; border-top:1px solid #03224C; padding-top:8px; color:#03224C;">
            <span>TOTAL TTC :</span>
            <span>${invoice.totalTTC.toFixed(2)} MAD</span>
          </div>
        </div>
      </div>
    </div>

    <!-- SIGNATURE -->
    <div style="padding:24px 32px;">
      <div style="width:250px; border:2px dashed #0a1f44; border-radius:8px; height:110px; display:flex; align-items:center; justify-content:center; color:gray;">
        Signature
      </div>
    </div>

    <!-- FOOTER -->
    <div style="background:#0a1f44; color:white; padding:24px; text-align:center; font-size:14px;">
      <p>
        <strong>${user?.company.name || ""}</strong> | ${user?.company.address || ""} |
        <strong>Tél :</strong> ${user?.company.phone || ""} |
        <strong>ICE :</strong> ${user?.company.ice || ""} |
        <strong>IF :</strong> ${user?.company.if || ""} |
        <strong>RC :</strong> ${user?.company.rc || ""} |
        <strong>CNSS :</strong> ${user?.company.cnss || ""} |
        <strong>Patente :</strong> ${user?.company.rc || ""} |
        <strong>EMAIL :</strong> ${user?.company.email || ""} |
        <strong>SITE WEB :</strong> ${user?.company.website || ""}
      </p>
    </div>
  </div>
  `;
};

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Facture {invoice.number}
            </h3>
            <div className="flex items-center space-x-3">
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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

          {/* Invoice Content */}
          <div id="invoice-content" style={{ backgroundColor: 'white', padding: '20px' }}>
            <TemplateRenderer 
              templateId={selectedTemplate}
              data={invoice}
              type="invoice"
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