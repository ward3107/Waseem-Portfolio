import React from 'react';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 2.53H12v-4.54h10.56z" />
    <path fill="#34A853" d="M12 22c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 18.86 7.7 22 12 22z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 4.14 2.18 7.5l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path fill="#1877F2" d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.13 8.44 9.88v-6.99H7.9V12h2.54V9.79c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 2.89h-2.33v6.99C18.34 21.13 22 16.99 22 12z" />
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path fill="#000000" d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="#E4405F" strokeWidth="2">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="18" cy="6" r="1" fill="#E4405F" stroke="none" />
  </svg>
);

const PlatformIcons: React.FC = () => (
  <div className="flex items-center gap-2.5 flex-wrap mt-2">
    <span className="flex items-center gap-1.5 text-sm bg-red-500/10 text-red-600 px-3 py-1.5 rounded-full">
      <GoogleIcon />
      <span>Google</span>
    </span>
    <span className="flex items-center gap-1.5 text-sm bg-blue-600/10 text-blue-600 px-3 py-1.5 rounded-full">
      <FacebookIcon />
      <span>Meta</span>
    </span>
    <span className="flex items-center gap-1.5 text-sm bg-pink-500/10 text-pink-600 px-3 py-1.5 rounded-full">
      <TikTokIcon />
      <span>TikTok</span>
    </span>
    <span className="flex items-center gap-1.5 text-sm text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1.5 rounded-full">
      <InstagramIcon />
      <span>Instagram</span>
    </span>
  </div>
);

export default PlatformIcons;
