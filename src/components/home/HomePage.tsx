import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  FileText, 
  Package, 
  BarChart3, 
  CreditCard, 
  Download,
  Check,
  Star,
  ArrowRight,
  Shield,
  Globe,
  Users,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: FileText,
      title: 'Facturation conforme à la loi marocaine',
      description: 'TVA, ICE, IF, RC - Toutes les mentions légales obligatoires incluses automatiquement'
    },
    {
      icon: Package,
      title: 'Gestion du stock et alertes automatiques',
      description: 'Suivi en temps réel de vos stocks avec alertes de rupture et réapprovisionnement'
    },
    {
      icon: BarChart3,
      title: 'Suivi des ventes et statistiques',
      description: 'Tableaux de bord détaillés pour analyser vos performances commerciales'
    },
    {
      icon: CreditCard,
      title: 'Paiement en ligne intégré',
      description: 'Acceptez les paiements via Stripe, PayPal et CMI directement sur vos factures'
    },
    {
      icon: Download,
      title: 'Export comptable et PDF bilingue',
      description: 'Documents professionnels en français et arabe, exports comptables automatisés'
    },
    {
      icon: Shield,
      title: 'Sécurité et conformité',
      description: 'Données hébergées au Maroc, conformité RGPD et sécurité bancaire'
    }
  ];

  const testimonials = [
    {
      name: 'Ahmed Bennani',
      company: 'Électronique Casa',
      text: 'Facture.ma a révolutionné ma gestion. Plus de 2h économisées par jour sur la facturation !',
      rating: 5
    },
    {
      name: 'Fatima El Alami',
      company: 'Boutique Mode Rabat',
      text: 'Interface simple, conforme à la loi marocaine. Parfait pour les petites entreprises.',
      rating: 5
    },
    {
      name: 'Omar Tazi',
      company: 'Restaurant Le Jardin',
      text: 'Le suivi des stocks m\'évite les ruptures. Mes clients sont toujours satisfaits !',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-blue-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Facture.ma</h1>
                <p className="text-xs text-gray-500">ERP Morocco</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <a href="#accueil" className="text-gray-700 hover:text-teal-600 font-medium">Accueil</a>
              <a href="#fonctionnalites" className="text-gray-700 hover:text-teal-600 font-medium">Fonctionnalités</a>
              <a href="#tarifs" className="text-gray-700 hover:text-teal-600 font-medium">Tarifs</a>
              <a href="#contact" className="text-gray-700 hover:text-teal-600 font-medium">Contact</a>
              <Link to="/login" className="text-gray-700 hover:text-teal-600 font-medium">Connexion</Link>
              <Link to="/admin/login" className="text-red-600 hover:text-red-700 font-medium text-sm">Admin</Link>
            </nav>

            <Link
              to="/login"
              className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Essai gratuit
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="accueil" className="bg-gradient-to-br from-teal-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <span className="bg-gradient-to-r from-teal-600 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  🇲🇦 Made in Morocco
                </span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Simplifiez votre facturation et gestion d'entreprise
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Facture.ma est une solution ERP marocaine pour PME et commerçants : 
                facturation, gestion de stock et suivi des ventes en toute simplicité.
              </p>
              
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <span>Essai gratuit</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="#tarifs"
                  className="inline-flex items-center justify-center space-x-2 border-2 border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200"
                >
                  <span>Voir les tarifs</span>
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between text-white mb-2">
                    <span className="font-semibold">Tableau de Bord</span>
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-white">
                    <div>
                      <p className="text-2xl font-bold">45,280</p>
                      <p className="text-sm opacity-90">MAD ce mois</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">127</p>
                      <p className="text-sm opacity-90">Factures</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">FAC-2024-001</span>
                    <span className="text-green-600 font-semibold">2,450 MAD</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">FAC-2024-002</span>
                    <span className="text-green-600 font-semibold">1,890 MAD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fonctionnalites" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Tout ce dont votre entreprise a besoin
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une solution complète adaptée aux spécificités du marché marocain
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="tarifs" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Tarifs transparents et abordables
            </h2>
            <p className="text-xl text-gray-600">
              Commencez gratuitement, évoluez selon vos besoins
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Plan Gratuit */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Gratuit</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">0 MAD</div>
                <p className="text-gray-600">Pour commencer</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>10 factures par mois</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>20 produits maximum</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>1 utilisateur</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Support par email</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Export PDF</span>
                </li>
              </ul>
              
              <Link
                to="/login"
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 px-6 rounded-lg font-semibold text-center block transition-colors duration-200"
              >
                Commencer gratuitement
              </Link>
            </div>

            {/* Plan Pro */}
            <div className="bg-gradient-to-br from-teal-600 to-blue-600 rounded-2xl shadow-xl p-8 text-white relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-semibold">
                  Populaire
                </span>
              </div>
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Pro</h3>
                <div className="text-4xl font-bold mb-2">299 MAD</div>
                <p className="opacity-90">par mois</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-yellow-300" />
                  <span>Factures illimitées</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-yellow-300" />
                  <span>Produits illimités</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-yellow-300" />
                  <span>5 utilisateurs</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-yellow-300" />
                  <span>Support prioritaire</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-yellow-300" />
                  <span>Paiement en ligne</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-yellow-300" />
                  <span>Export comptable</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-yellow-300" />
                  <span>Statistiques avancées</span>
                </li>
              </ul>
              
              <Link
                to="/login"
                className="w-full bg-white text-teal-600 hover:bg-gray-100 py-3 px-6 rounded-lg font-semibold text-center block transition-colors duration-200"
              >
                Commencer l'essai Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Ils nous font confiance
            </h2>
            <p className="text-xl text-gray-600">
              Plus de 1000 entreprises marocaines utilisent Facture.ma
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <div className="flex items-center justify-center space-x-8 opacity-60">
              <div className="text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm font-medium">PME</p>
              </div>
              <div className="text-center">
                <Building2 className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm font-medium">Commerces</p>
              </div>
              <div className="text-center">
                <Package className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm font-medium">Distributeurs</p>
              </div>
              <div className="text-center">
                <Globe className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm font-medium">Services</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-blue-600 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Facture.ma</h3>
                  <p className="text-sm text-gray-400">ERP Morocco</p>
                </div>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                La solution ERP marocaine qui simplifie la gestion de votre entreprise. 
                Facturation, stock, ventes - tout en un seul endroit.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-gray-400">
                  <Phone className="w-4 h-4" />
                  <span>+212 522 123 456</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <Mail className="w-4 h-4" />
                  <span>contact@facture.ma</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Liens rapides</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">CGU</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Politique de confidentialité</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-3 text-gray-400">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                  <span>Avenue Mohammed V<br />Casablanca, Maroc</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>support@facture.ma</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>+212 522 123 456</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Facture.ma. Tous droits réservés. Made with ❤️ in Morocco 🇲🇦</p>
          </div>
        </div>
      </footer>
    </div>
  );
}