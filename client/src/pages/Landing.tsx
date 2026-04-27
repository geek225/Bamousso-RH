import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, CheckCircle, Users, Clock, Calendar, ArrowRight, Loader2 } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  const handleSelectPlan = (planId: string) => {
    navigate('/register', { state: { selectedPlanId: planId } });
  };

  return (
    <div className="min-h-screen bg-senufo bg-surface-base font-sans text-text-primary selection:bg-brand-primary selection:text-white">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          <Building2 className="w-8 h-8 text-brand-primary" />
          <span className="text-2xl font-black tracking-tight text-text-primary">BAMOUSSO</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/register" className="hidden md:inline-block font-semibold text-text-secondary hover:text-brand-primary transition-colors">
            S'inscrire
          </Link>
          <Link to="/login" className="bg-brand-primary hover:bg-brand-800 text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-brand-primary/30 transition-all hover:-translate-y-0.5">
            Espace Client
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-20 pb-32 lg:pb-40 overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-10 right-0 w-[600px] h-[600px] bg-brand-accent/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-primary/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-8">
            <motion.div 
              className="lg:w-1/2 text-center lg:text-left"
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
                <span className="inline-flex py-1.5 px-5 rounded-full bg-surface-panel text-brand-primary font-bold text-sm mb-8 border border-brand-accent/30 shadow-sm items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse"></span>
                  Le Logiciel RH Inspiré par l'Afrique
                </span>
              </motion.div>
              
              <motion.h1 
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-8 tracking-tight leading-[1.1] drop-shadow-sm"
              >
                BAMOUSSO : La <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-accent">Mère</span> de votre Gestion RH.
              </motion.h1>
              
              <motion.p 
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="text-xl text-text-secondary mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
              >
                Comme une mère qui veille sur son foyer avec sagesse et autorité, Bamousso centralise et protège le capital humain de votre entreprise. 
              </motion.p>
              
              <motion.div 
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
              >
                <a href="#pricing" className="w-full sm:w-auto bg-brand-900 text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-xl shadow-brand-900/20">
                  Découvrir nos offres <ArrowRight className="w-5 h-5" />
                </a>
                <Link to="/login" className="w-full sm:w-auto bg-surface-panel text-text-primary border-2 border-surface-border px-8 py-4 rounded-full font-bold text-lg hover:border-brand-primary hover:text-brand-primary transition-colors flex items-center justify-center gap-2 shadow-sm">
                  Essai Gratuit
                </Link>
              </motion.div>
            </motion.div>

            <motion.div 
              className="lg:w-1/2 w-full max-w-lg mx-auto lg:max-w-none relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-brand-900/20 border-8 border-surface-panel transform lg:rotate-2 hover:rotate-0 transition-transform duration-500">
                <img src="/hero-masks.jpg" alt="Masques Africains Bamousso" className="w-full h-auto object-cover object-center aspect-[4/3] lg:aspect-square" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-900/40 to-transparent mix-blend-multiply"></div>
              </div>
              
              {/* Floating element */}
              <div className="absolute -bottom-6 -left-6 bg-surface-panel p-6 rounded-2xl shadow-xl border border-surface-border flex items-center gap-4 animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="w-12 h-12 rounded-full bg-brand-accent/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-brand-primary" />
                </div>
                <div>
                  <div className="text-sm text-text-secondary font-medium">Gestion Humaine</div>
                  <div className="font-bold text-brand-900">100% Centralisée</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features with Collage */}
      <div className="bg-surface-panel py-24 border-y border-surface-border relative overflow-hidden">
        {/* Abstract decorative elements inspired by collage */}
        <div className="absolute -right-20 top-20 opacity-5 pointer-events-none">
          <img src="/africa-collage.jpg" alt="" className="w-96 rounded-full mix-blend-luminosity grayscale" />
        </div>
        <div className="absolute -left-20 bottom-20 opacity-5 pointer-events-none">
          <img src="/africa-collage.jpg" alt="" className="w-96 rounded-full mix-blend-luminosity grayscale" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16 mb-16">
            <div className="lg:w-1/3">
              <h2 className="text-4xl font-extrabold mb-6 leading-tight">La Force d'une Gestion <span className="text-brand-primary">Centralisée</span></h2>
              <p className="text-text-secondary text-lg mb-8">Une suite complète d'outils pensés pour l'excellence opérationnelle en Afrique. Libérez-vous de la paperasse et concentrez-vous sur l'essentiel : l'humain.</p>
              <div className="rounded-2xl overflow-hidden shadow-lg border border-surface-border shadow-brand-primary/10">
                <img src="/africa-collage.jpg" alt="Art Africain" className="w-full h-48 object-cover" />
              </div>
            </div>
            
            <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
              <FeatureCard 
                icon={<Clock className="w-6 h-6 text-brand-primary" />}
                title="Pointage & Présence"
                description="Suivi rigoureux du temps de travail, adapté aux réalités du terrain ivoirien."
                delay={0.1}
              />
              <FeatureCard 
                icon={<Calendar className="w-6 h-6 text-brand-accent" />}
                title="Sagesse Administrative"
                description="Gestion fluide des congés et des absences. Transparence totale pour vos équipes."
                delay={0.3}
              />
              <FeatureCard 
                icon={<Users className="w-6 h-6 text-brand-700" />}
                title="Cœur de l'Entreprise"
                description="Un annuaire dynamique pour renforcer les liens entre vos collaborateurs."
                delay={0.5}
              />
              <FeatureCard 
                icon={<CheckCircle className="w-6 h-6 text-brand-900" />}
                title="Validation Rapide"
                description="Approuvez les demandes en un clic depuis n'importe où, même sur mobile."
                delay={0.7}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-24 bg-surface-base relative bg-senufo">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4 text-brand-900">Nos Formules</h2>
            <p className="text-text-secondary text-lg">Choisissez le pilier qui soutiendra votre croissance.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter */}
            <PricingCard 
              title="Pikin (Débutant)"
              price="200"
              period="/mois"
              description="L'essentiel pour démarrer sereinement."
              features={['Jusqu\'à 20 employés', 'Pointage standard', 'Gestion des congés', 'Support par ticket']}
              delay={0.2}
              isLoading={false}
              onSelect={() => handleSelectPlan('STARTER')}
            />
            
            {/* Business (Popular) */}
            <PricingCard 
              title="Bamousso (Maman)"
              price="300"
              period="/mois"
              description="La puissance de gestion pour vos équipes."
              features={['Jusqu\'à 100 employés', 'Pointage géolocalisé', 'Messagerie interne', 'Support prioritaire', 'Analytique RH']}
              isPopular={true}
              delay={0.4}
              isLoading={false}
              onSelect={() => handleSelectPlan('BUSINESS')}
            />
            
            {/* Enterprise */}
            <PricingCard 
              title="Koro (Ancien)"
              price="400"
              period="/mois"
              description="L'excellence pour les grandes institutions."
              features={['Employés illimités', 'Intégration API', 'Hébergement VIP', 'Accompagnement dédié']}
              delay={0.6}
              isLoading={false}
              onSelect={() => handleSelectPlan('ENTERPRISE')}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-surface-panel border-t border-surface-border py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="flex justify-center items-center gap-2 mb-6">
            <Building2 className="w-6 h-6 text-brand-primary" />
            <span className="text-xl font-bold tracking-widest">BAMOUSSO</span>
          </div>
          <p className="text-text-secondary text-sm mb-6">
            La solution RH qui incarne la sagesse et la force de l'Afrique.
          </p>
          <div className="flex justify-center gap-6 text-sm text-text-tertiary">
            <a href="#" className="hover:text-brand-primary">Mentions légales</a>
            <a href="#" className="hover:text-brand-primary">Confidentialité</a>
            <a href="#" className="hover:text-brand-primary">Contact</a>
          </div>
          <div className="mt-8 text-xs text-text-tertiary">
            &copy; {new Date().getFullYear()} Bamousso SaaS. Fait avec fierté en Côte d'Ivoire.
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
