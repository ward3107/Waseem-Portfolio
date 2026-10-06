import { Instagram } from 'lucide-react';
import { BRAND_PLATFORMS } from './brandPlatforms';
const note =
  'M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z';

export default function BrandPlatforms({ embedded }: { embedded: boolean }) {
  return (
    <ul dir="ltr" className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {BRAND_PLATFORMS.map(({ name, glow, border, enabled, href, ariaLabel }, index) => (
        <li
          key={name}
          className={`relative isolate flex flex-col items-center justify-center overflow-hidden rounded-3xl border px-3 py-7 sm:py-9 ${border} ${embedded ? 'bg-white/5' : 'bg-slate-50 dark:bg-white/5'} ${enabled && href ? 'transition-transform hover:-translate-y-1' : ''}`}
        >
          <span aria-hidden="true" className={`absolute inset-0 -z-10 ${glow}`} />
          <div
            aria-hidden="true"
            className="flex h-20 w-20 items-center justify-center sm:h-24 sm:w-24"
          >
            {index === 0 && (
              <span className="flex h-full w-full items-center justify-center rounded-[26%] bg-gradient-to-tr from-amber-400 via-pink-600 to-violet-600 shadow-lg shadow-fuchsia-500/20">
                <Instagram className="h-3/4 w-3/4 text-white" strokeWidth={1.7} />
              </span>
            )}
            {index === 1 && (
              <svg viewBox="0 0 24 24" className="h-full w-full">
                <circle cx="12" cy="12" r="12" fill="#1877F2" />
                <path
                  fill="white"
                  d="M13.8 24v-9.3h3.1l.47-3.63H13.8V8.75c0-1.05.3-1.77 1.8-1.77h1.9V3.73a25 25 0 0 0-2.77-.14c-2.74 0-4.62 1.68-4.62 4.77v2.71H7v3.63h3.11V24z"
                />
              </svg>
            )}
            {index === 2 && (
              <span className="flex h-full w-full items-center justify-center rounded-[26%] bg-black">
                <svg viewBox="0 0 26 26" className="h-3/4 w-3/4">
                  <path d={note} fill="#25F4EE" transform="translate(0 1)" />
                  <path d={note} fill="#FE2C55" transform="translate(2 2)" />
                  <path d={note} fill="white" transform="translate(1 1)" />
                </svg>
              </span>
            )}
            {index === 3 && (
              <svg viewBox="0 0 100 100" className="h-full w-full">
                <path d="M49 20 19 73" stroke="#FBBC04" strokeWidth="25" strokeLinecap="round" />
                <path d="m50 20 31 53" stroke="#4285F4" strokeWidth="25" strokeLinecap="round" />
                <circle cx="19" cy="73" r="12.5" fill="#34A853" />
              </svg>
            )}
          </div>
          <h3 className="mt-5 text-sm font-bold tracking-wide sm:text-base">{name}</h3>
          {enabled && href && (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={ariaLabel}
              className="pointer-events-auto absolute inset-0 z-10 rounded-3xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-cyan"
            />
          )}
        </li>
      ))}
    </ul>
  );
}
