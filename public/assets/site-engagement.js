/* One consent-aware analytics integration for the SPA and static pages.
 * Contact intent != lead received. No names, phone numbers, message text,
 * query strings, free-form search terms, or form values are sent. */
(() => {
  if (window.vasiaTrack) return;
  const allowed = () => {
    try { return JSON.parse(localStorage.getItem('cookie-consent') || '{}').analytics === true; }
    catch { return false; }
  };
  let started = false;
  const start = () => {
    if (!allowed() || started) return;
    started = true;
    window.va = window.va || function (...args) { (window.vaq = window.vaq || []).push(args); };
    window.va('beforeSend', event => {
      if (!allowed()) return null;
      try { const clean = new URL(event.url); clean.search = ''; clean.hash = ''; return {...event, url:clean.href}; }
      catch { return null; }
    });
    const script = document.createElement('script');
    script.src = '/_vercel/insights/script.js'; script.defer = true;
    script.dataset.sdkn = 'vasia-consent';
    document.head.append(script);
  };
  const eventNames = new Set(['contact_intent','lead_submitted','testimonial_submitted','gallery_open','project_story_open']);
  const sources = new Set(['page','header','footer','article','project_story','whatsapp_dock','exit_intent','discount_game','project_wizard']);
  window.vasiaTrack = (name, data = {}) => {
    if (!allowed() || !eventNames.has(name)) return;
    start();
    const lang = ['he','ar','en'].includes(document.documentElement.lang) ? document.documentElement.lang : 'en';
    const clean = {language:lang,page:location.pathname};
    if (['whatsapp','email','phone','form'].includes(data.channel)) clean.channel = data.channel;
    if (sources.has(data.source)) clean.source = data.source;
    window.va?.('event', {name, data:clean});
  };
  document.addEventListener('click', e => {
    const el = e.target instanceof Element ? e.target : null;
    if (!el) return;
    if (el.closest('[data-gallery-open]')) window.vasiaTrack('gallery_open');
    const anchor = el.closest('a[href]');
    if (!anchor) return;
    let url; try { url = new URL(anchor.href, location.href); } catch { return; }
    const channel = url.hostname === 'wa.me' || url.hostname === 'api.whatsapp.com' ? 'whatsapp' : url.protocol === 'mailto:' ? 'email' : url.protocol === 'tel:' ? 'phone' : null;
    if (!channel) return;
    const source = anchor.dataset.contactLocation || (anchor.closest('header') ? 'header' : anchor.closest('footer') ? 'footer' : 'page');
    window.vasiaTrack('contact_intent', {channel,source});
  }, {capture:true});
  addEventListener('vasia:consent', start);
  addEventListener('storage', e => { if (e.key === 'cookie-consent') start(); });
  start();
  // Static pages share the site's existing consent key. No page is blocked.
  if (!document.querySelector('#root')) {
    let hasChoice = false;
    try { hasChoice = !!localStorage.getItem('cookie-consent'); } catch {}
    const l = document.documentElement.lang;
    const labels = ({he:['לאפשר מדידת שימוש כדי לשפר את האתר?','אישור מדידה','ללא מדידה','העדפות מדידה'],en:['Allow usage measurement to improve the site?','Allow analytics','No analytics','Analytics preferences'],ar:['بتسمح بقياس الاستخدام لتحسين الموقع؟','السماح بالقياس','بدون قياس','تفضيلات القياس']})[l] || ['Allow usage measurement?','Allow','Decline','Analytics preferences'];
    const box = document.createElement('div'); box.className = 'analytics-choice'; box.hidden = hasChoice;
    const text = document.createElement('span'); text.textContent = labels[0]; box.append(text);
    [true,false].forEach((value,i) => {
      const button = document.createElement('button'); button.textContent = labels[i+1];
      button.addEventListener('click', () => {
        try { localStorage.setItem('cookie-consent', JSON.stringify({necessary:true,analytics:value,marketing:false})); } catch {}
        box.hidden = true; dispatchEvent(new Event('vasia:consent'));
      }); box.append(button);
    });
    const preferences = document.createElement('button'); preferences.textContent = labels[3]; preferences.className = 'analytics-settings'; preferences.addEventListener('click',()=>{box.hidden=false;box.querySelector('button').focus();});
    document.querySelector('footer')?.append(preferences); document.body.append(box);
  }
})();
