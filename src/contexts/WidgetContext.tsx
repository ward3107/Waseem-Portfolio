import React, { createContext, useContext, useState, ReactNode } from 'react';

interface WidgetContextType {
  widgets: {
    share: boolean;
    facebook: boolean;
    instagram: boolean;
    tiktok: boolean;
  };
  toggleWidget: (widget: 'share' | 'facebook' | 'instagram' | 'tiktok') => void;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

export const WidgetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [widgets, setWidgets] = useState({
    share: true,
    facebook: true,
    instagram: true,
    tiktok: true,
  });

  const toggleWidget = (widget: 'share' | 'facebook' | 'instagram' | 'tiktok') => {
    setWidgets(prev => ({
      ...prev,
      [widget]: !prev[widget]
    }));
  };

  return (
    <WidgetContext.Provider value={{ widgets, toggleWidget }}>
      {children}
    </WidgetContext.Provider>
  );
};

export const useWidgets = () => {
  const context = useContext(WidgetContext);
  if (!context) {
    throw new Error('useWidgets must be used within a WidgetProvider');
  }
  return context;
};