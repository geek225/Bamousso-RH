import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, CheckCircle, Users, Clock, Calendar, ArrowRight, Loader2 } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  const handleSelectPlan = (planId: string) => {
    navigate('/register', { state: { selectedPlanId: planId } });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 selection:bg-orange-500 selection:text-white">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          <Building2 className="w-8 h-8 text-orange-500" />
          <span className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">NexTeam</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/register" className="hidden md:inline-block font-semibold text-gray-600 dark:text-gray-300 hover:text-orange-500 transition-colors">
            S'inscrire
          </Link>
          <Link to="/login" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-orange-500/30 transition-all hover:-translate-y-0.5">
            Espace Client
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-20 pb-32 overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-orange-400/20 dark:bg-orange-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.15 }
              }
            }}
          >
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
              <span className="inline-block py-1 px-4 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-bold text-sm mb-8 border border-orange-200 dark:border-orange-800 shadow-sm">
                ⭐ Le Logiciel RH #1 en Côte d'Ivoire
              </span>
            </motion.div>
            
            <motion.h1 
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight leading-tight drop-shadow-sm"
            >
              Gérez vos équipes avec <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">simplicité</span> et <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-green-600">efficacité</span>.
            </motion.h1>
            
            <motion.p 
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              NexTeam centralise le pointage, les congés, l'annuaire et la messagerie de votre entreprise sur une plateforme unique et ultra-sécurisée.
            </motion.p>
            
            <motion.div 
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="flex flex-col sm:flex-row justify-center items-center gap-4"
            >
              <a href="#pricing" className="w-full sm:w-auto bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-xl shadow-gray-900/20 dark:shadow-white/10">
                Voir les tarifs <ArrowRight className="w-5 h-5" />
              </a>
              <Link to="/login" className="w-full sm:w-auto bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 px-8 py-4 rounded-full font-bold text-lg hover:border-orange-500 hover:text-orange-500 transition-colors flex items-center justify-center gap-2 shadow-sm">
                Tester la démo
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white dark:bg-gray-800 py-24 border-y border-gray-100 dark:border-gray-700">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Tout ce dont votre RH a besoin</h2>
            <p className="text-gray-500">Une suite complète d'outils pensés pour les PME et grandes entreprises.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Clock className="w-6 h-6 text-orange-500" />}
              title="Pointage Intelligent"
              description="Suivi précis des heures d'arrivée et de départ, calcul automatique du temps de travail."
              delay={0.1}
            />
            <FeatureCard 
              icon={<Calendar className="w-6 h-6 text-green-500" />}
              title="Gestion des Congés"
              description="Circuit de validation automatisé. Fini les formulaires papier, tout est tracé."
              delay={0.3}
            />
            <FeatureCard 
              icon={<Users className="w-6 h-6 text-blue-500" />}
              title="Annuaire & Départements"
              description="Organisez vos équipes hiérarchiquement avec un accès rapide aux coordonnées."
              delay={0.5}
            />
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-24 bg-gray-50 dark:bg-gray-900 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4">Nos Offres (FCFA)</h2>
            <p className="text-gray-500 text-lg">Des forfaits adaptés à la taille de votre entreprise.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter */}
            <PricingCard 
              title="Starter"
              price="200"
              period="/mois"
              description="Pour les petites équipes qui veulent se structurer."
              features={['Jusqu\'à 20 employés', 'Pointage basique', 'Gestion des congés', 'Support par email']}
              delay={0.2}
              isLoading={false}
              onSelect={() => handleSelectPlan('STARTER')}
            />
            
            {/* Business (Popular) */}
            <PricingCard 
              title="Business"
              price="300"
              period="/mois"
              description="L'offre idéale pour la majorité des PME."
              features={['Jusqu\'à 100 employés', 'Pointage avec géolocalisation', 'Messagerie interne', 'Support prioritaire 7j/7', 'Rapports RH avancés']}
              isPopular={true}
              delay={0.4}
              isLoading={false}
              onSelect={() => handleSelectPlan('BUSINESS')}
            />
            
            {/* Enterprise */}
            <PricingCard 
              title="Enterprise"
              price="400"
              period="/mois"
              description="Une solution sur-mesure pour les grandes structures."
              features={['Employés illimités', 'Intégration API', 'Hébergement dédié', 'Manager de compte dédié']}
              delay={0.6}
              isLoading={false}
              onSelect={() => handleSelectPlan('ENTERPRISE')}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="flex justify-center items-center gap-2 mb-6">
            <Building2 className="w-6 h-6 text-orange-500" />
            <span className="text-xl font-bold">NexTeam SaaS</span>
          </div>
          <p className="text-gray-500 text-sm mb-6">
            La solution de gestion RH de référence conçue pour l'Afrique.
          </p>
          <div className="flex justify-center gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-orange-500">Mentions légales</a>
            <a href="#" className="hover:text-orange-500">Confidentialité</a>
            <a href="#" className="hover:text-orange-500">Contact</a>
          </div>
          <div className="mt-8 text-xs text-gray-400">
            &copy; {new Date().getFullYear()} NexTeam Inc. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, delay = 0 }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.5, delay }}
    className="bg-gray-50 dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-shadow"
  >
    <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-md mb-6 transition-transform hover:scale-110">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-gray-500 leading-relaxed">{description}</p>
  </motion.div>
);

const PricingCard = ({ title, price, period, description, features, isPopular, delay = 0, onSelect, isLoading }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay }}
    className={`relative bg-white dark:bg-gray-800 rounded-3xl p-8 flex flex-col transition-transform hover:-translate-y-2 ${isPopular ? 'border-2 border-orange-500 shadow-2xl shadow-orange-500/20 scale-105 z-10' : 'border border-gray-200 dark:border-gray-700 shadow-lg'}`}
  >
    {isPopular && (
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-1.5 rounded-full text-xs font-black tracking-widest shadow-lg uppercase">
        Le plus populaire
      </div>
    )}
    <h3 className="text-2xl font-bold mb-2">{title}</h3>
    <p className="text-gray-500 text-sm mb-6 h-10">{description}</p>
    <div className="mb-8 flex items-end">
      <span className="text-5xl font-extrabold tracking-tighter">{price}</span>
      {price !== 'Sur devis' && <span className="text-xl font-bold text-gray-400 ml-2 mb-1 border-b-2 border-orange-500">FCFA</span>}
      {period && <span className="text-gray-500 font-medium ml-1 mb-1">{period}</span>}
    </div>
    <ul className="space-y-4 mb-8 flex-1">
      {features.map((feature: string, idx: number) => (
        <li key={idx} className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5 drop-shadow-sm" />
          <span className="text-gray-700 dark:text-gray-300 font-medium">{feature}</span>
        </li>
      ))}
    </ul>
    <button 
      onClick={onSelect}
      disabled={isLoading}
      className={`w-full py-4 rounded-xl font-bold text-center transition-all flex items-center justify-center gap-2 ${isPopular ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-lg hover:shadow-orange-500/40 hover:scale-[1.02]' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'}`}
    >
      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "S'abonner"}
    </button>
  </motion.div>
);

export default Landing;
