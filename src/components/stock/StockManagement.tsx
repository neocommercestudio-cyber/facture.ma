import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useLicense } from '../../contexts/LicenseContext';
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  AlertTriangle,
  Download,
  Search,
  Crown,
  BarChart3,
  TrendingDown,
  CheckCircle,
  XCircle,
  Filter
} from 'lucide-react';
import html2pdf from 'html2pdf.js';

export default function StockManagement() {
  const { user } = useAuth();
  const { products, invoices } = useData();
  const { licenseType } = useLicense();
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Vérifier l'accès PRO
  const isProActive = user?.company.subscription === 'pro' && user?.company.expiryDate && 
    new Date(user.company.expiryDate) > new Date();

  if (!isProActive) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🔒 Fonctionnalité PRO
          </h2>
          <p className="text-gray-600 mb-6">
            La Gestion de Stock est réservée aux abonnés PRO. 
            Passez à la version PRO pour accéder à cette fonctionnalité avancée.
          </p>
          <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200">
            <span className="flex items-center justify-center space-x-2">
              <Crown className="w-5 h-5" />
              <span>Passer à PRO - 299 MAD/mois</span>
            </span>
          </button>
        </div>
      </div>
    );
  }

  // Calculer les statistiques pour un produit spécifique ou global
  const calculateStats = (productFilter: string = 'all') => {
    let filteredProducts = products;
    
    if (productFilter !== 'all') {
      filteredProducts = products.filter(p => p.id === productFilter);
    }

    let totalStockInitial = 0;
    let totalPurchaseValue = 0;
    let totalSalesValue = 0;
    let totalQuantitySold = 0;
    let totalRemainingStock = 0;
    let dormantProducts = 0;

    filteredProducts.forEach(product => {
      // Stock initial
      totalStockInitial += product.stock;
      
      // Valeur d'achat totale
      totalPurchaseValue += product.stock * product.purchasePrice;
      
      // Calculer les ventes pour ce produit
      let productQuantitySold = 0;
      let productSalesValue = 0;
      
      invoices.forEach(invoice => {
        invoice.items.forEach(item => {
          if (item.description === product.name) {
            productQuantitySold += item.quantity;
            productSalesValue += item.total;
          }
        });
      });
      
      totalQuantitySold += productQuantitySold;
      totalSalesValue += productSalesValue;
      
      // Stock restant
      const remainingStock = product.stock - productQuantitySold;
      totalRemainingStock += remainingStock;
      
      // Produits dormants (pas de vente)
      if (productQuantitySold === 0) {
        dormantProducts++;
      }
    });

    const grossMargin = totalSalesValue - totalPurchaseValue;
    
    return {
      totalStockInitial,
      totalPurchaseValue,
      totalSalesValue,
      totalQuantitySold,
      totalRemainingStock,
      dormantProducts,
      grossMargin
    };
  };

  const stats = calculateStats(selectedProduct);

  // Données détaillées par produit
  const getDetailedProductData = () => {
    return products.map(product => {
      let quantitySold = 0;
      let salesValue = 0;
      let ordersCount = 0;
      const ordersSet = new Set();

      invoices.forEach(invoice => {
        let hasProduct = false;
        invoice.items.forEach(item => {
          if (item.description === product.name) {
            quantitySold += item.quantity;
            salesValue += item.total;
            hasProduct = true;
          }
        });
        if (hasProduct) {
          ordersSet.add(invoice.id);
        }
      });

      ordersCount = ordersSet.size;
      const remainingStock = product.stock - quantitySold;
      const purchaseValue = product.stock * product.purchasePrice;
      const margin = salesValue - (quantitySold * product.purchasePrice);

      return {
        ...product,
        quantitySold,
        salesValue,
        ordersCount,
        remainingStock,
        purchaseValue,
        margin
      };
    }).filter(product => {
      if (selectedProduct === 'all') return true;
      return product.id === selectedProduct;
    });
  };

  const detailedData = getDetailedProductData();

  const handleExportPDF = () => {
    const reportContent = generateReportHTML();
    
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'fixed';
    tempDiv.style.top = '0';
    tempDiv.style.left = '0';
    tempDiv.style.width = '210mm';
    tempDiv.style.backgroundColor = 'white';
    tempDiv.style.zIndex = '-1';
    tempDiv.style.opacity = '0';
    tempDiv.innerHTML = reportContent;
    document.body.appendChild(tempDiv);

    const options = {
      margin: [10, 10, 10, 10],
      filename: `Rapport_Stock_${selectedProduct === 'all' ? 'Global' : 'Produit'}_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: false,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff'
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' 
      }
    };

    html2pdf()
      .set(options)
      .from(tempDiv)
      .save()
      .then(() => {
        document.body.removeChild(tempDiv);
      })
      .catch((error) => {
        console.error('Erreur lors de la génération du PDF:', error);
        if (document.body.contains(tempDiv)) {
          document.body.removeChild(tempDiv);
        }
        alert('Erreur lors de la génération du PDF');
      });
  };

  const generateReportHTML = () => {
    const selectedProductName = selectedProduct === 'all' ? 'Tous les produits' : 
      products.find(p => p.id === selectedProduct)?.name || 'Produit';

    return `
      <div style="padding: 20px; font-family: Arial, sans-serif; background: white;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #059669; padding-bottom: 20px;">
          <h1 style="font-size: 28px; color: #059669; margin: 0; font-weight: bold;">RAPPORT DE GESTION DE STOCK</h1>
          <h2 style="font-size: 20px; color: #1f2937; margin: 10px 0; font-weight: bold;">${user?.company?.name || ''}</h2>
          <p style="font-size: 14px; color: #6b7280; margin: 5px 0;">Généré le ${new Date().toLocaleDateString('fr-FR')}</p>
          <p style="font-size: 16px; color: #1f2937; margin: 10px 0; font-weight: bold;">Analyse: ${selectedProductName}</p>
        </div>
        
        <!-- Statistiques globales -->
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 15px;">📊 Statistiques Globales</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; border: 1px solid #0ea5e9;">
              <p style="font-size: 14px; color: #0c4a6e; margin: 0;"><strong>Stock Initial Total:</strong> ${stats.totalStockInitial.toFixed(3)}</p>
            </div>
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border: 1px solid #f59e0b;">
              <p style="font-size: 14px; color: #92400e; margin: 0;"><strong>Valeur d'Achat:</strong> ${stats.totalPurchaseValue.toLocaleString()} MAD</p>
            </div>
            <div style="background: #dcfce7; padding: 15px; border-radius: 8px; border: 1px solid #16a34a;">
              <p style="font-size: 14px; color: #166534; margin: 0;"><strong>Valeur de Vente:</strong> ${stats.totalSalesValue.toLocaleString()} MAD</p>
            </div>
            <div style="background: ${stats.grossMargin >= 0 ? '#dcfce7' : '#fee2e2'}; padding: 15px; border-radius: 8px; border: 1px solid ${stats.grossMargin >= 0 ? '#16a34a' : '#dc2626'};">
              <p style="font-size: 14px; color: ${stats.grossMargin >= 0 ? '#166534' : '#991b1b'}; margin: 0;"><strong>Marge Brute:</strong> ${stats.grossMargin.toLocaleString()} MAD</p>
            </div>
          </div>
        </div>
        
        <!-- Tableau détaillé -->
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 15px;">📋 Détail par Produit</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb; font-weight: bold;">Produit</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #e5e7eb; font-weight: bold;">Stock Initial</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #e5e7eb; font-weight: bold;">Qté Vendue</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #e5e7eb; font-weight: bold;">Stock Restant</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #e5e7eb; font-weight: bold;">Val. Achat</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #e5e7eb; font-weight: bold;">Val. Vente</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #e5e7eb; font-weight: bold;">Marge</th>
              </tr>
            </thead>
            <tbody>
              ${detailedData.map(product => `
                <tr>
                  <td style="padding: 8px; border: 1px solid #e5e7eb;">${product.name}</td>
                  <td style="padding: 8px; text-align: center; border: 1px solid #e5e7eb;">${product.stock.toFixed(3)} ${product.unit}</td>
                  <td style="padding: 8px; text-align: center; border: 1px solid #e5e7eb;">${product.quantitySold.toFixed(3)} ${product.unit}</td>
                  <td style="padding: 8px; text-align: center; border: 1px solid #e5e7eb;">${product.remainingStock.toFixed(3)} ${product.unit}</td>
                  <td style="padding: 8px; text-align: center; border: 1px solid #e5e7eb;">${product.purchaseValue.toLocaleString()} MAD</td>
                  <td style="padding: 8px; text-align: center; border: 1px solid #e5e7eb;">${product.salesValue.toLocaleString()} MAD</td>
                  <td style="padding: 8px; text-align: center; border: 1px solid #e5e7eb; color: ${product.margin >= 0 ? '#16a34a' : '#dc2626'}; font-weight: bold;">${product.margin.toLocaleString()} MAD</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <!-- Footer -->
        <div style="margin-top: 30px; text-align: center; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 15px; font-size: 10px;">
          <p><strong>${user?.company?.name || ''}</strong> | ${user?.company?.address || ''} | 
          Tél: ${user?.company?.phone || ''} | Email: ${user?.company?.email || ''} | 
          ICE: ${user?.company?.ice || ''}</p>
        </div>
      </div>
    `;
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <span>Gestion de Stock</span>
            <Crown className="w-6 h-6 text-yellow-500" />
          </h1>
          <p className="text-gray-600 mt-2">
            Analysez vos achats, ventes et marges. Disponible uniquement avec l'abonnement PRO. 
            Filtrez par produit ou consultez une analyse globale, et exportez vos rapports en PDF.
          </p>
        </div>
        <button
          onClick={handleExportPDF}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
        >
          <Download className="w-4 h-4" />
          <span>Export PDF</span>
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrer par produit
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">Tous les produits</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.category})
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rechercher
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Rechercher un produit..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard - Blocs d'indicateurs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stock Initial */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStockInitial.toFixed(0)}</p>
              <p className="text-sm text-gray-600">Stock Initial</p>
            </div>
          </div>
        </div>

        {/* Valeur d'Achat */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPurchaseValue.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Valeur d'Achat (MAD)</p>
            </div>
          </div>
        </div>

        {/* Valeur de Vente */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSalesValue.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Valeur de Vente (MAD)</p>
            </div>
          </div>
        </div>

        {/* Marge Brute */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              stats.grossMargin >= 0 
                ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                : 'bg-gradient-to-br from-red-500 to-red-600'
            }`}>
              {stats.grossMargin >= 0 ? (
                <TrendingUp className="w-6 h-6 text-white" />
              ) : (
                <TrendingDown className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <p className={`text-2xl font-bold ${
                stats.grossMargin >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {stats.grossMargin >= 0 ? '+' : ''}{stats.grossMargin.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Marge Brute (MAD)</p>
            </div>
          </div>
        </div>

        {/* Stock Restant */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRemainingStock.toFixed(0)}</p>
              <p className="text-sm text-gray-600">Stock Restant</p>
            </div>
          </div>
        </div>

        {/* Quantité Vendue */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalQuantitySold.toFixed(0)}</p>
              <p className="text-sm text-gray-600">Quantité Vendue</p>
            </div>
          </div>
        </div>

        {/* Produits Dormants */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.dormantProducts}</p>
              <p className="text-sm text-gray-600">Produits Non Vendus</p>
            </div>
          </div>
        </div>

        {/* Indicateur de Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              stats.grossMargin >= 0 
                ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                : 'bg-gradient-to-br from-red-500 to-red-600'
            }`}>
              {stats.grossMargin >= 0 ? (
                <CheckCircle className="w-6 h-6 text-white" />
              ) : (
                <XCircle className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <p className={`text-lg font-bold ${
                stats.grossMargin >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {stats.grossMargin >= 0 ? '✅ Rentable' : '❌ Déficitaire'}
              </p>
              <p className="text-sm text-gray-600">Performance Globale</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau détaillé */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Analyse Détaillée par Produit</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Initial
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qté Vendue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Restant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valeur d'Achat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valeur de Vente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marge Brute
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {detailedData.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-xs text-gray-500">{product.category}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {product.stock.toFixed(3)} {product.unit}
                    </div>
                    <div className="text-xs text-gray-500">
                      Min: {product.minStock.toFixed(3)} {product.unit}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {product.quantitySold.toFixed(3)} {product.unit}
                    </div>
                    <div className="text-xs text-gray-500">
                      {product.ordersCount} commande{product.ordersCount > 1 ? 's' : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${
                        product.remainingStock <= product.minStock ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {product.remainingStock.toFixed(3)} {product.unit}
                      </span>
                      {product.remainingStock <= product.minStock && (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.purchaseValue.toLocaleString()} MAD
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.salesValue.toLocaleString()} MAD
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-bold ${
                        product.margin >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {product.margin >= 0 ? '+' : ''}{product.margin.toLocaleString()} MAD
                      </span>
                      {product.margin >= 0 ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    {product.margin < 0 && (
                      <div className="text-xs text-red-600 mt-1">
                        Besoin: +{Math.abs(product.margin).toLocaleString()} MAD
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {detailedData.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun produit trouvé</p>
          </div>
        )}
      </div>

      {/* Résumé de performance */}
      {stats.grossMargin < 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
            <h3 className="text-lg font-semibold text-red-900">⚠️ Performance Déficitaire</h3>
          </div>
          <p className="text-red-800">
            Votre marge brute est négative de <strong>{Math.abs(stats.grossMargin).toLocaleString()} MAD</strong>. 
            Vous devez générer <strong>{Math.abs(stats.grossMargin).toLocaleString()} MAD</strong> de ventes supplémentaires 
            pour atteindre l'équilibre.
          </p>
        </div>
      )}

      {stats.grossMargin > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <h3 className="text-lg font-semibold text-green-900">✅ Performance Positive</h3>
          </div>
          <p className="text-green-800">
            Excellente performance ! Votre marge brute est de <strong>+{stats.grossMargin.toLocaleString()} MAD</strong>. 
            Continuez sur cette lancée !
          </p>
        </div>
      )}
    </div>
  );
}