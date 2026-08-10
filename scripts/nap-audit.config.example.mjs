// NAP audit config — copy this file to scripts/nap-audit.config.mjs and fill
// in real values. The real file is gitignored so contact details never leak.
//
// Usage:
//   cp scripts/nap-audit.config.example.mjs scripts/nap-audit.config.mjs
//   $EDITOR scripts/nap-audit.config.mjs
//   node scripts/nap-audit.mjs

export default {
  // The canonical NAP — the single source of truth every citation across the
  // web should match. Google's local ranking rewards consistency; a stray
  // "Nazareth" or "Technion" address on an old LinkedIn profile is the exact
  // kind of noise that hurts you.
  canonical: {
    // Business/personal name variants Google's entity graph should link to
    // each other. Add every form that appears on your citations.
    names: [
      'Waseem Abu Aql',
      'Vasia',
      'Vasia by Waseem',
      'וסים אבו עקל',
      'وسيم أبو عقل',
    ],
    // Address — city + country level is what Google matches. Street granularity
    // matters if you're storefront; less if service-area business.
    address: {
      locality: 'Kfar Yasif',
      localityAliases: ['כפר יאסיף', 'كفر ياسيف'],
      region: 'Northern District',
      country: 'IL',
    },
    // Phone: E.164 form + local form. The script normalizes before comparing,
    // so "+972-53-426-0632" and "0534260632" both match.
    phone: '+972534260632',
  },

  // Every public profile page that carries your NAP. The script fetches each,
  // extracts what it can, diffs against `canonical`, and reports.
  // Social sites (LinkedIn, Facebook, Instagram) often serve a login wall to
  // unauthenticated bots — the script flags those clearly instead of
  // pretending they're consistent.
  profiles: [
    { label: 'Portfolio (canonical site)', url: 'https://waseemp.vercel.app' },
    { label: 'GitHub', url: 'https://github.com/ward3107' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/waseem-abu-akel-334486374/' },
    // { label: 'Google Business Profile', url: 'https://g.page/YOUR_PLACE_ID' },
    // { label: 'freelancer.com', url: 'https://www.freelancer.com/u/YOUR_USER' },
    // { label: 'xplace', url: 'https://www.xplace.com/u/YOUR_USER' },
    // { label: 'Facebook', url: 'https://www.facebook.com/YOUR_PAGE' },
    // { label: 'Instagram', url: 'https://www.instagram.com/YOUR_HANDLE/' },
  ],
};
