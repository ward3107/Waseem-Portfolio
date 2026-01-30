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
import Blog from './components/Blog';
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
import { ThemeProvider } from './contexts/ThemeContext';

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <ThemeProvider>
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
              <Blog />
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
      </ThemeProvider>
    </LanguageProvider>
  );
};

export default App;