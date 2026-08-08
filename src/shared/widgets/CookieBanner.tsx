import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ChevronDown, ChevronUp, Cookie } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { safeGetItem, safeSetItem } from '@/lib/safeStorage';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

// Google Consent Mode v2 signal mapping. The DEFAULT state (denied) is set
// synchronously in index.html <head> before any script loads; this only
// UPDATES the signals to reflect the visitor's choice.
//
// analytics_storage        → GA4, GTM analytics tags
// ad_storage/ad_user_data/ad_personalization → Google Ads, remarketing
// functionality_storage / security_storage stay granted (essential).
const applyConsentMode = (prefs: CookiePreferences): void => {
  // dataLayer is created by the default-consent inline script in index.html.
  // If for any reason it isn't there (SSR, tests), silently no-op — nothing
  // downstream will fire without the queue anyway.
  const w = window as unknown as { dataLayer?: unknown[] };
  if (!w.dataLayer) return;
  w.dataLayer.push([
    'consent',
    'update',
    {
      analytics_storage: prefs.analytics ? 'granted' : 'denied',
      ad_storage: prefs.marketing ? 'granted' : 'denied',
      ad_user_data: prefs.marketing ? 'granted' : 'denied',
      ad_personalization: prefs.marketing ? 'granted' : 'denied',
    },
  ]);
};

const CookieBanner: React.FC = () => {
  const { t, dir } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false, // Default to false for opt-in (stricter compliance)
    marketing: false, // Default to false for opt-in
  });

  useEffect(() => {
    // Check if user has already consented
    const savedConsent = safeGetItem('cookie-consent');
    if (!savedConsent) {
      // Delay slightly for better UX on load
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
    // Returning visitor: re-apply their saved consent to the dataLayer so
    // consent-aware tags (GA4, etc.) get the correct signals on this page load
    // too — otherwise the default 'denied' from index.html would stick.
    try {
      const parsed = JSON.parse(savedConsent) as Partial<CookiePreferences>;
      applyConsentMode({
        necessary: true,
        analytics: parsed.analytics === true,
        marketing: parsed.marketing === true,
      });
    } catch {
      // Corrupt payload — treat as no-consent, show the banner again.
      setIsVisible(true);
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    // Persist is best-effort; the banner must dismiss even if storage is blocked
    // (Safari private mode), otherwise Accept/Decline throws and the banner
    // re-appears on every load and never records consent.
    safeSetItem('cookie-consent', JSON.stringify(prefs));
    applyConsentMode(prefs);
    setIsVisible(false);
  };

  const handleAcceptAll = () => {
    const allEnabled = { necessary: true, analytics: true, marketing: true };
    setPreferences(allEnabled);
    savePreferences(allEnabled);
  };

  const handleDeclineAll = () => {
    const allDisabled = { necessary: true, analytics: false, marketing: false };
    setPreferences(allDisabled);
    savePreferences(allDisabled);
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return; // Strictly necessary cannot be toggled
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-2 sm:p-4 md:p-6 flex justify-center pointer-events-none"
        >
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 pointer-events-auto overflow-hidden flex flex-col md:flex-row shadow-brand-purple/10 transition-colors duration-300">

            {/* Left Side: Content — trimmed on mobile so the banner doesn't
                cover half the viewport. Long body copy is hidden until the
                user opens "Details" (or automatically visible on md+). */}
            <div className="p-4 sm:p-6 md:p-8 flex-1">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-brand-purple/10 dark:bg-brand-purple/20 flex items-center justify-center text-brand-purple shrink-0">
                  <Cookie size={18} />
                </div>
                <h3 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white">
                  {t('cookie_title')}
                </h3>
              </div>

              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 hidden md:block">
                {t('cookie_desc')}
              </p>

              {/* Granular Settings (Collapsible) */}
              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-4 mb-6 border-t border-slate-100 dark:border-slate-800 pt-4">

                      {/* Necessary */}
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            {t('cookie_cat_necessary')}
                            <ShieldCheck size={14} className="text-brand-green" />
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('cookie_cat_necessary_desc')}</p>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked
                          aria-disabled
                          aria-label={t('cookie_cat_necessary')}
                          disabled
                          className="relative inline-flex h-6 w-11 items-center rounded-full bg-brand-purple/50 cursor-not-allowed"
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${dir === 'rtl' ? '-translate-x-6' : 'translate-x-6'}`} />
                        </button>
                      </div>

                      {/* Analytics */}
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-bold text-sm text-slate-900 dark:text-white">
                            {t('cookie_cat_analytics')}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('cookie_cat_analytics_desc')}</p>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={preferences.analytics}
                          aria-label={t('cookie_cat_analytics')}
                          onClick={() => togglePreference('analytics')}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2 ${preferences.analytics ? 'bg-brand-purple' : 'bg-slate-200 dark:bg-slate-700'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${preferences.analytics
                            ? (dir === 'rtl' ? '-translate-x-6' : 'translate-x-6')
                            : (dir === 'rtl' ? '-translate-x-1' : 'translate-x-1')
                            }`} />
                        </button>
                      </div>

                      {/* Marketing */}
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-bold text-sm text-slate-900 dark:text-white">
                            {t('cookie_cat_marketing')}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('cookie_cat_marketing_desc')}</p>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={preferences.marketing}
                          aria-label={t('cookie_cat_marketing')}
                          onClick={() => togglePreference('marketing')}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2 ${preferences.marketing ? 'bg-brand-purple' : 'bg-slate-200 dark:bg-slate-700'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${preferences.marketing
                            ? (dir === 'rtl' ? '-translate-x-6' : 'translate-x-6')
                            : (dir === 'rtl' ? '-translate-x-1' : 'translate-x-1')
                            }`} />
                        </button>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs font-bold text-slate-500 hover:text-brand-purple dark:text-slate-400 dark:hover:text-brand-purpleLight flex items-center gap-1 transition-colors"
              >
                {t('cookie_customize')}
                {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>

            {/* Right Side: Actions */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 sm:p-4 md:p-8 flex flex-col sm:flex-row md:flex-col justify-center gap-2 sm:gap-3 min-w-[200px] border-t md:border-t-0 md:border-s border-slate-100 dark:border-slate-800">
              {showDetails ? (
                <button
                  onClick={handleSavePreferences}
                  className="w-full py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-brand-purple text-white font-bold text-sm hover:bg-brand-purpleDark transition-all shadow-lg hover:shadow-brand-purple/20"
                >
                  {t('cookie_save')}
                </button>
              ) : (
                <>
                  <button
                    onClick={handleAcceptAll}
                    className="flex-1 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-brand-purple text-white font-bold text-sm hover:bg-brand-purpleDark transition-all shadow-lg hover:shadow-brand-purple/20"
                  >
                    {t('cookie_accept')}
                  </button>
                  <button
                    onClick={handleDeclineAll}
                    className="flex-1 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    {t('cookie_decline')}
                  </button>
                </>
              )}
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;