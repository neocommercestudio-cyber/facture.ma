import React from 'react';
import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Building2, User, Bell, Shield, FileText, Palette } from 'lucide-react';
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
    patente: '',
    email: '',
    website: '',
    phone: '',
    address: '',
    logo: ''
  });
  const [invoiceSettings, setInvoiceSettings] = useState({
    format: 'format2',
    prefix: 'FAC'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const [defaultTemplate, setDefaultTemplate] = useState('template1');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  // Initialiser les paramètres avec les données utilisateur
  React.useEffect(() => {
    if (user?.company) {
      setCompanyData({
        name: user.company.name || '',
        ice: user.company.ice || '',
        if: user.company.if || '',
        rc: user.company.rc || '',
        cnss: user.company.cnss || '',
        patente: user.company.patente || '',
        email: user.company.email || '',
        website: user.company.website || '',
        phone: user.company.phone || '',
        address: user.company.address || '',
        logo: user.company.logo || ''
      });
      setInvoiceSettings({
        format: user.company.invoiceNumberingFormat || 'format2',
        prefix: user.company.invoicePrefix || 'FAC'
      });
      setDefaultTemplate(user.company.defaultTemplate || 'template1');
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
        patente: companyData.patente,
        email: companyData.email,
        website: companyData.website,
        phone: companyData.phone,
        address: companyData.address,
        logo: companyData.logo
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CNSS
                </label>
                <input
                  type="text"
                  value={companyData.cnss}
                  onChange={(e) => handleCompanyDataChange('cnss', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="1234567"
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
    </div>
  );
}