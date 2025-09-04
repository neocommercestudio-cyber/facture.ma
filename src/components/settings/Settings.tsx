import React from 'react';
import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Building2, User, Bell, Shield, FileText, Palette, X } from 'lucide-react';
import TemplateSelector from '../templates/TemplateSelector';

export default function Settings() {
  const { user, updateCompanySettings } = useAuth();
  const { t } = useLanguage();
  const [companyData, setCompanyData] = useState({
    name: '',
    ice: '',
    if: '',
    rc: '',
    cnss: '',
    phone: '',
    address: '',
    logo: '',
    email: '',
    patente: '',
    website: ''
  });
  const [invoiceSettings, setInvoiceSettings] = useState({
    format: 'format2',
    prefix: 'FAC'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const [defaultTemplate, setDefaultTemplate] = useState('template1');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  const [signatureUrl, setSignatureUrl] = useState('');
  const [isSavingSignature, setIsSavingSignature] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);

  // Initialiser les paramètres avec les données utilisateur
  React.useEffect(() => {
    if (user?.company) {
      setCompanyData({
        name: user.company.name || '',
        ice: user.company.ice || '',
        if: user.company.if || '',
        rc: user.company.rc || '',
        cnss: user.company.cnss || '',
        phone: user.company.phone || '',
        address: user.company.address || '',
        logo: user.company.logo || '',
        email: user.company.email || '',
        patente: user.company.patente || '',
        website: user.company.website || ''
      });
      setInvoiceSettings({
        format: user.company.invoiceNumberingFormat || 'format2',
        prefix: user.company.invoicePrefix || 'FAC'
      });
      setDefaultTemplate(user.company.defaultTemplate || 'template1');
      setSignatureUrl(user.company.signature || '');
    }
  }, [user]);

  const formatOptions = [
    { value: 'format1', label: '2025-001', example: '2025-001' },
    { value: 'format2', label: 'FAC-2025-001', example: 'FAC-2025-001' },
    { value: 'format3', label: '001/2025', example: '001/2025' },
    { value: 'format4', label: '2025/001-FAC', example: '2025/001-FAC' },
    { value: 'format5', label: 'FAC001-2025', example: 'FAC001-2025' }
  ];

  const getFormatExample = (format: string, prefix: string) => {
    const year = new Date().getFullYear();
    const counter = '001';
    
    switch (format) {
      case 'format1':
        return `${year}-${counter}`;
      case 'format2':
        return `${prefix}-${year}-${counter}`;
      case 'format3':
        return `${counter}/${year}`;
      case 'format4':
        return `${year}/${counter}-${prefix}`;
      case 'format5':
        return `${prefix}${counter}-${year}`;
      default:
        return `${prefix}-${year}-${counter}`;
    }
  };

  const handleSaveInvoiceSettings = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      await updateCompanySettings({
        invoiceNumberingFormat: invoiceSettings.format,
        invoicePrefix: invoiceSettings.prefix
      });

      alert('Paramètres de numérotation sauvegardés avec succès !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde des paramètres');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTemplateSettings = async () => {
    if (!user) return;
    
    setIsSavingTemplate(true);
    try {
      await updateCompanySettings({
        defaultTemplate: defaultTemplate
      });

      alert('Modèle par défaut sauvegardé avec succès !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du modèle');
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const handleSaveSignature = async () => {
    if (!user) return;
    
    setIsSavingSignature(true);
    try {
      await updateCompanySettings({
        signature: signatureUrl
      });
      
      alert('Signature électronique sauvegardée avec succès !');
      setShowSignatureModal(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de la signature');
    } finally {
      setIsSavingSignature(false);
    }
  };

  const handleSaveCompanyInfo = async () => {
    if (!user) return;
    
    setIsSavingCompany(true);
    try {
      await updateCompanySettings({
        name: companyData.name,
        ice: companyData.ice,
        if: companyData.if,
        rc: companyData.rc,
        cnss: companyData.cnss,
        phone: companyData.phone,
        address: companyData.address,
        logo: companyData.logo,
        email: companyData.email,
        patente: companyData.patente,
        website: companyData.website
      });
      
      alert('Informations entreprise sauvegardées avec succès !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde des informations');
    } finally {
      setIsSavingCompany(false);
    }
  };

  const handleCompanyDataChange = (field: string, value: string) => {
    setCompanyData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('settings')}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Informations Entreprise</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raison sociale
                </label>
                <input
                  type="text"
                  value={companyData.name}
                  onChange={(e) => handleCompanyDataChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ICE
                </label>
                <input
                  type="text"
                  value={companyData.ice}
                  onChange={(e) => handleCompanyDataChange('ice', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Identifiant Fiscal (IF)
                </label>
                <input
                  type="text"
                  value={companyData.if}
                  onChange={(e) => handleCompanyDataChange('if', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registre de Commerce (RC)
                </label>
                <input
                  type="text"
                  value={companyData.rc}
                  onChange={(e) => handleCompanyDataChange('rc', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CNSS
                </label>
                <input
                  type="text"
                  value={companyData.cnss}
                  onChange={(e) => handleCompanyDataChange('cnss', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="text"
                  value={companyData.phone}
                  onChange={(e) => handleCompanyDataChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse
                </label>
                <textarea
                  rows={3}
                  value={companyData.address}
                  onChange={(e) => handleCompanyDataChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo (URL)
                </label>
                <input
                  type="url"
                  value={companyData.logo}
                  onChange={(e) => handleCompanyDataChange('logo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="https://exemple.com/logo.png"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email de l'entreprise *
                </label>
                <input
                  type="email"
                  value={companyData.email}
                  onChange={(e) => handleCompanyDataChange('email', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="contact@entreprise.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patente *
                </label>
                <input
                  type="text"
                  value={companyData.patente}
                  onChange={(e) => handleCompanyDataChange('patente', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="12345678"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site web *
                </label>
                <input
                  type="url"
                  value={companyData.website}
                  onChange={(e) => handleCompanyDataChange('website', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="https://www.entreprise.com"
                />
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <button 
                onClick={handleSaveCompanyInfo}
                disabled={isSavingCompany}
                className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
              >
                {isSavingCompany ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
              </button>
            </div>
          </div>

          {/* Invoice Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Paramètres de Facturation</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Format de numérotation (Factures & Devis)
                </label>
                <select
                  value={invoiceSettings.format}
                  onChange={(e) => setInvoiceSettings({...invoiceSettings, format: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  {formatOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="text-xs text-gray-500 mt-1 space-y-1">
                  <p>Aperçu facture: {getFormatExample(invoiceSettings.format, invoiceSettings.prefix)}</p>
                  <p>Aperçu devis: {getFormatExample(invoiceSettings.format, 'DEV')}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Préfixe personnalisé (Factures uniquement)
                </label>
                <input
                  type="text"
                  value={invoiceSettings.prefix}
                  onChange={(e) => setInvoiceSettings({...invoiceSettings, prefix: e.target.value.toUpperCase()})}
                  maxLength={5}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="FAC"
                />
                <div className="text-xs text-gray-500 mt-1 space-y-1">
                  <p>Utilisé dans les formats avec préfixe (max 5 caractères)</p>
                  <p>Les devis utilisent automatiquement le préfixe "DEV"</p>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">ℹ️ Information importante</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Le compteur se remet automatiquement à 001 chaque nouvelle année</li>
                  <li>• Ce format s'applique aux <strong>factures</strong> ET aux <strong>devis</strong></li>
                  <li>• Exemple facture: FAC-2025-256 → FAC-2026-001</li>
                  <li>• Exemple devis: DEV-2025-045 → DEV-2026-001</li>
                  <li>• Les devis utilisent automatiquement le préfixe "DEV"</li>
                </ul>
              </div>
              
              <button
                onClick={handleSaveInvoiceSettings}
                disabled={isSaving}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
              >
                {isSaving ? 'Sauvegarde...' : 'Sauvegarder (Factures & Devis)'}
              </button>
            </div>
          </div>

          {/* Template Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Modèles de Documents</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modèle par défaut pour les factures et devis
                </label>
                <TemplateSelector 
                  selectedTemplate={defaultTemplate}
                  onTemplateSelect={setDefaultTemplate}
                />
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">ℹ️ À propos des modèles</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Le modèle sélectionné sera appliqué par défaut à tous vos nouveaux documents</li>
                  <li>• Vous pourrez toujours changer de modèle lors de la création ou visualisation</li>
                  <li>• Les modèles Pro nécessitent un abonnement actif</li>
                </ul>
              </div>
              
              <button
                onClick={handleSaveTemplateSettings}
                disabled={isSavingTemplate}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
              >
                {isSavingTemplate ? 'Sauvegarde...' : 'Sauvegarder le modèle par défaut'}
              </button>
            </div>
          </div>

          {/* Electronic Signature Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Signature Électronique (Cachet)</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL de votre signature/cachet
                </label>
                <input
                  type="url"
                  value={signatureUrl}
                  onChange={(e) => setSignatureUrl(e.target.value)}

                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="https://i.ibb.co/votre-signature.png"
                />
                {signatureUrl && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Aperçu de votre signature :</p>
                    <img 
                      src={signatureUrl} 
                      alt="Signature" 
                      className="max-h-20 mx-30 border border-gray-200 rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">📝 Étapes pour ajouter votre cachet :</h4>
                <ol className="text-sm text-blue-800 space-y-2">
                  <li>1. Écrivez votre cachet sur une feuille blanche et prenez une photo</li>
                  <li>2. Rendez-vous sur <a href="https://remove.bg" target="_blank" rel="noopener noreferrer" className="underline font-medium">remove.bg</a> pour supprimer l'arrière-plan</li>
                  <li>3. Importez votre image sur <a href="https://imgbb.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">imgbb.com</a> pour l'héberger</li>
                  <li>4. Copiez le lien direct de votre image et collez-le dans le champ ci-dessus</li>
                </ol>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleSaveSignature}
                  disabled={isSavingSignature || !signatureUrl}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
                >
                  {isSavingSignature ? 'Sauvegarde...' : 'Sauvegarder la signature'}
                </button>
                <button
                  onClick={() => setShowSignatureModal(true)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Aide détaillée
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conditions de paiement par défaut
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                  <option>Paiement à 30 jours</option>
                  <option>Paiement à 15 jours</option>
                  <option>Paiement à 60 jours</option>
                  <option>Paiement comptant</option>
                </select>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                  <span className="text-sm text-gray-700">Envoyer automatiquement les factures par email</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Profil Utilisateur</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet
                </label>
                <input
                  type="text"
                  defaultValue={user?.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  defaultValue={user?.email}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rôle
                </label>
                <input
                  type="text"
                  value={user?.role}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 capitalize"
                />
              </div>
            </div>
          </div>

          {/* Subscription Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Abonnement</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">
                    Version actuelle: {user?.company.subscription === 'pro' ? '👑 Pro' : '🆓 Gratuite'}
                  </p>
                  {user?.company.subscription === 'pro' && user?.company.expiryDate && (
                    <p className="text-sm text-gray-600">
                      Expire le: {new Date(user.company.expiryDate).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                  {user?.company.subscription === 'pro' && user?.company.subscriptionDate && (
                    <p className="text-sm text-gray-600">
                      Souscrit le: {new Date(user.company.subscriptionDate).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
                {user?.company.subscriptionDate && (
                  <button className="px-4 py-2 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white rounded-lg transition-all duration-200">
                    {user?.company.subscription === 'pro' ? 'Souscrit le' : 'Inscrit le'}: {new Date(user.company.subscriptionDate).toLocaleDateString('fr-FR')}
                  </button>
                )}
              </div>
              
              {user?.company.subscription === 'pro' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 text-sm">
                    ✅ Vous bénéficiez de tous les avantages Pro : factures illimitées, clients illimités, produits illimités, support prioritaire.
                  </p>
                </div>
              )}
              
              {user?.company.subscription === 'free' && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-amber-800 text-sm">
                    ⚠️ Version gratuite : 10 factures, 10 clients, 20 produits, 10 devis maximum.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Sécurité</h3>
            </div>

            <div className="space-y-3">
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                Changer le mot de passe
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                Authentification à deux facteurs
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                Sessions actives
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl border border-teal-200 p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Design Marocain</h3>
              <p className="text-sm text-gray-600 mb-4">Interface adaptée aux standards locaux avec support complet de l'arabe</p>
              <div className="text-2xl">🇲🇦</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'aide pour la signature */}
      {showSignatureModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
            <div className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Guide : Ajouter votre signature électronique</h3>
                  <button
                    onClick={() => setShowSignatureModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-3">🎯 Objectif</h4>
                    <p className="text-blue-800">
                      Ajouter votre cachet/signature personnalisé sur vos factures et devis pour un rendu professionnel.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">📋 Étapes détaillées :</h4>
                    
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                        <div>
                          <h5 className="font-medium text-gray-900">Créer votre cachet</h5>
                          <p className="text-sm text-gray-600">Écrivez votre cachet sur une feuille blanche et prenez une photo claire</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                        <div>
                          <h5 className="font-medium text-gray-900">Supprimer l'arrière-plan</h5>
                          <p className="text-sm text-gray-600 mb-2">Allez sur <a href="https://remove.bg" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">remove.bg</a> et uploadez votre photo</p>
                          <p className="text-xs text-gray-500">Cela rendra votre signature transparente</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                        <div>
                          <h5 className="font-medium text-gray-900">Héberger votre image</h5>
                          <p className="text-sm text-gray-600 mb-2">Allez sur <a href="https://imgbb.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">imgbb.com</a> et uploadez votre signature sans fond</p>
                          <p className="text-xs text-gray-500">Choisissez "Don't auto delete" pour garder l'image en permanence</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                        <div>
                          <h5 className="font-medium text-gray-900">Copier le lien</h5>
                          <p className="text-sm text-gray-600">Copiez le lien direct de votre image et collez-le dans le champ "URL de votre signature"</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">✅ Résultat</h4>
                    <p className="text-sm text-green-800">
                      Votre signature apparaîtra automatiquement sur vos factures et devis quand vous cochez l'option "Ajouter ma signature électronique".
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setShowSignatureModal(false)}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Compris !
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