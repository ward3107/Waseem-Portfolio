import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Accessibility, X, RotateCcw, Sun, Type,
  MousePointer, Image as ImageIcon, Zap, Link as LinkIcon,
  AlignLeft, Check, EyeOff
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

type ContrastMode = 'normal' | 'high' | 'inverted';

interface A11yState {
  fontSize: number;
  contrastMode: ContrastMode;
  isDark: boolean;
  highlightLinks: boolean;
  readableFont: boolean;
  textSpacing: boolean;
  largeCursor: boolean;
  hideImages: boolean;
  disableAnimations: boolean;
}

const DEFAULT_STATE: A11yState = {
  fontSize: 100,
  contrastMode: 'normal',
  isDark: false,
  highlightLinks: false,
  readableFont: false,
  textSpacing: false,
  largeCursor: false,
  hideImages: false,
  disableAnimations: false,
};

const AccessibilityToolbar: React.FC = () => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [state, setState] = useState<A11yState>(DEFAULT_STATE);
  const panelRef = useRef<HTMLDivElement>(null);

  // Get accessibility label based on language
  const getAccessibilityLabel = () => {
    switch (language) {
      case 'he': return 'נגישות';
      case 'ar': return 'إمكانية الوصول';
      default: return 'Accessibility';
    }
  };

  // Load from session storage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('a11y-settings');
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch (e) {
        // Failed to parse saved settings - keep default state if data is corrupted
        // This gracefully handles corrupted sessionStorage without disrupting UX
      }
    } else {
      // Check system preference for dark mode
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setState(prev => ({ ...prev, isDark: true }));
      }
    }
  }, []);

  // Save to session storage and apply styles
  useEffect(() => {
    sessionStorage.setItem('a11y-settings', JSON.stringify(state));
    applyStyles(state);
  }, [state]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const applyStyles = (s: A11yState) => {
    const doc = document.documentElement;

    // Theme
    if (s.isDark) {
      doc.classList.add('dark');
    } else {
      doc.classList.remove('dark');
    }

    // Generate dynamic CSS
    let css = '';

    // Font Size
    if (s.fontSize !== 100) {
      css += `html { font-size: ${s.fontSize}% !important; }`;
    }

    // Highlight Links
    if (s.highlightLinks) {
      css += `a { text-decoration: underline !important; font-weight: bold !important; color: #d4af37 !important; background-color: rgba(0,0,0,0.8) !important; padding: 0 4px !important; }`;
    }

    // Readable Font
    if (s.readableFont) {
      css += `* { font-family: Arial, Helvetica, sans-serif !important; }`;
    }

    // Text Spacing
    if (s.textSpacing) {
      css += `* { line-height: 1.8 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 1.5em !important; }`;
    }

    // Hide Images
    if (s.hideImages) {
      css += `img, video, [role="img"] { opacity: 0 !important; pointer-events: none !important; }`;
    }

    // Disable Animations
    if (s.disableAnimations) {
      css += `*, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }`;
    }

    // Large Cursor
    if (s.largeCursor) {
      // Using a data URI for a larger cursor SVG
      const cursorSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="black" stroke="white" stroke-width="2"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg>`;
      const cursorUrl = `data:image/svg+xml;utf8,${encodeURIComponent(cursorSvg)}`;
      css += `* { cursor: url('${cursorUrl}') 0 0, auto !important; }`;
    }

    // Contrast Modes
    if (s.contrastMode === 'high') {
      css += `
        body, main, section, header, footer, div { background-color: #ffffff !important; background-image: none !important; color: #000000 !important; border-color: #000000 !important; }
        h1, h2, h3, h4, h5, h6, p, span, li { color: #000000 !important; }
        a { color: #0000EE !important; text-decoration: underline !important; }
        button { background-color: #eeeeee !important; color: #000000 !important; border: 2px solid #000000 !important; }
        .bg-brand-purple, .bg-slate-900 { background-color: #000000 !important; color: #ffffff !important; }
      `;
    } else if (s.contrastMode === 'inverted') {
      css += `html { filter: invert(1) hue-rotate(180deg); } img, video, picture { filter: invert(1) hue-rotate(180deg); }`;
    }

    // Inject CSS
    let styleTag = document.getElementById('a11y-styles');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'a11y-styles';
      document.head.appendChild(styleTag);
    }
    styleTag.innerHTML = css;
  };

  const updateState = <K extends keyof A11yState>(key: K, value: A11yState[K]) => {
    setState(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setState({
      ...DEFAULT_STATE,
      // Preserve dark mode preference if system matches, otherwise default
      isDark: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    });
  };

  if (!isVisible) return null;

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-br from-brand-purple to-brand-purpleLight text-white p-4 rounded-full shadow-2xl hover:shadow-brand-purple/50 transition-all focus:outline-none focus:ring-4 focus:ring-brand-purple/50 group border-2 border-white/20"
        aria-label={getAccessibilityLabel() + ' Options'}
      >
        <Accessibility size={28} className="group-hover:rotate-12 transition-transform duration-500 drop-shadow-lg" />
      </motion.button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:pr-6 sm:pb-6 pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto" onClick={() => setIsOpen(false)}></div>

      <div
        ref={panelRef}
        className="w-full sm:w-[400px] bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] pointer-events-auto overflow-hidden animate-float"
        role="dialog"
        aria-label="Accessibility Settings"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-brand-purple/10 to-brand-cyan/10">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 drop-shadow-sm">
            <Accessibility className="text-brand-purple drop-shadow-md" size={24} />
            <span className="bg-gradient-to-r from-brand-purple to-brand-cyan bg-clip-text text-transparent font-extrabold">
              {getAccessibilityLabel()}
            </span>
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500 dark:text-slate-400 hover:text-red-500"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-8">

          {/* 1. Font Size */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Type size={18} /> Font Size
              </label>
              <span className="text-sm font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-400">{state.fontSize}%</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs">A</span>
              <input
                type="range"
                min="100"
                max="200"
                step="25"
                value={state.fontSize}
                onChange={(e) => updateState('fontSize', parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-purple"
              />
              <span className="text-lg font-bold">A</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400 px-1">
              <span>100%</span>
              <span>125%</span>
              <span>150%</span>
              <span>175%</span>
              <span>200%</span>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* 2. Contrast Mode */}
          <div className="space-y-3">
            <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Sun size={18} /> Contrast Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { id: 'normal', label: 'Normal', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-900 dark:text-slate-300' },
                { id: 'high', label: 'High', bg: 'bg-white border-2 border-black', text: 'text-black' },
                { id: 'inverted', label: 'Inverted', bg: 'bg-black', text: 'text-white' }
              ] as const).map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => updateState('contrastMode', mode.id)}
                  className={`py-2 px-1 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1 ${state.contrastMode === mode.id ? 'ring-2 ring-brand-purple ring-offset-1' : ''} ${mode.bg} ${mode.text}`}
                >
                  {state.contrastMode === mode.id && <Check size={12} />}
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Grid Features */}
          <div className="grid grid-cols-1 gap-4">
            {[
              { key: 'highlightLinks', label: 'Highlight Links', icon: LinkIcon },
              { key: 'readableFont', label: 'Readable Font', icon: Type },
              { key: 'textSpacing', label: 'Text Spacing', icon: AlignLeft },
              { key: 'largeCursor', label: 'Large Cursor', icon: MousePointer },
              { key: 'hideImages', label: 'Hide Images', icon: ImageIcon },
              { key: 'disableAnimations', label: 'Disable Animations', icon: Zap },
            ].map((feature) => (
              <label key={feature.key} className="flex items-center justify-between cursor-pointer group p-2 hover:bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3 text-slate-700">
                  <feature.icon size={18} className="text-slate-400 group-hover:text-brand-purple transition-colors" />
                  <span className="font-medium text-sm">{feature.label}</span>
                </div>
                <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${state[feature.key as keyof A11yState] ? 'bg-brand-purple border-brand-purple' : 'border-slate-300'}`}>
                  {state[feature.key as keyof A11yState] && <Check size={14} className="text-white" />}
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={state[feature.key as keyof A11yState] as boolean}
                  onChange={(e) => updateState(feature.key as keyof A11yState, e.target.checked)}
                />
              </label>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={resetSettings}
              className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-brand-purple dark:hover:text-brand-purple transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} /> Reset
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="flex-1 py-3 rounded-xl border border-red-100 dark:border-red-900/30 text-red-500 font-bold text-sm hover:bg-red-50 dark:hover:bg-red-900/10 hover:border-red-200 dark:hover:border-red-800 transition-colors flex items-center justify-center gap-2"
            >
              <EyeOff size={16} /> Hide
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 text-center">
          <p className="text-[10px] text-slate-500 font-medium">Settings persist across sessions</p>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityToolbar;