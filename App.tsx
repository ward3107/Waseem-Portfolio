import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import AISection from './components/AISection';
import VibeCoding from './components/VibeCoding';
import AboutTimeline from './components/AboutTimeline';
import Projects from './components/Projects';
import Process from './components/Process';
import TechStack from './components/TechStack';
import Contact from './components/Contact';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import AccessibilityToolbar from './components/AccessibilityToolbar';
import ShareWidget from './components/ShareWidget';
import SocialHub from './components/SocialHub';
import BackToTop from './components/BackToTop';
import CookieBanner from './components/CookieBanner';
import { LanguageProvider } from './contexts/LanguageContext';
import { WidgetProvider } from './contexts/WidgetContext';

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <WidgetProvider>
        <div className="relative">
          <Navbar />
          <main>
            <Hero />
            <Services />
            <AISection />
            <VibeCoding />
            <AboutTimeline />
            <Projects />
            <Process />
            <TechStack />
            <SocialHub />
            <FAQ />
            <Contact />
          </main>
          <Footer />
          <AccessibilityToolbar />
          <ShareWidget />
          <BackToTop />
          <CookieBanner />
        </div>
      </WidgetProvider>
    </LanguageProvider>
  );
};

export default App;