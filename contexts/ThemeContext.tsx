import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        // 1. Check local storage
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('vibe_theme') as Theme;
            if (saved === 'light' || saved === 'dark') {
                return saved;
            }
            // 2. Check system preference
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
        }
        return 'light'; // Default to light
    });

    useEffect(() => {
        const root = window.document.documentElement;
        // Remove both to prevent conflicts if we ever add more themes
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        localStorage.setItem('vibe_theme', theme);
    }, [theme]);

    // Listen for system changes if no manual override is set? 
    // For simplicity, once initialized, we stick to the state unless user changes it.
    // But strictly speaking, if user clears storage, it should re-sync.

    const toggleTheme = () => {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
