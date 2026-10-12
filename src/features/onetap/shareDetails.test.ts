import { describe, expect, it } from 'vitest';
import type { ContactInfo } from '@/features/contact/useContact';
import { buildOneTapSharePayload, displayPhone, getWhatsAppLink, normalizeWhatsAppNumber } from './shareDetails';

const contact: ContactInfo = {
  email: 'hello@vasia.dev',
  whatsappNumber: '054-4513141',
  whatsappUrl: 'https://wa.me/972544513141',
  whatsappDisplay: '054-4513141',
  github: 'https://github.com/ward3107',
  linkedin: 'https://www.linkedin.com/in/waseem-abu-akel-334486374/',
  instagram: 'https://www.instagram.com/vasia.dev/',
  facebook: 'https://www.facebook.com/profile.php?id=61594997720112',
  twitter: 'https://twitter.com/ward3107',
};

describe('OneTap share details', () => {
  it('converts Israeli local and international phone variants into a valid wa.me link', () => {
    expect(normalizeWhatsAppNumber('054-4513141')).toBe('972544513141');
    expect(normalizeWhatsAppNumber('+972 54 4513141')).toBe('972544513141');
    expect(normalizeWhatsAppNumber('00972 54 4513141')).toBe('972544513141');
    expect(getWhatsAppLink('054-4513141')).toBe('https://wa.me/972544513141');
    expect(displayPhone('972544513141')).toBe('054-4513141');
  });

  it.each(['he', 'ar', 'en'] as const)('copies the phone and an explicit tappable WhatsApp URL in %s', (language) => {
    const result = buildOneTapSharePayload(contact, language);
    expect(result.plainText).toContain('054-4513141 — https://wa.me/972544513141');
    expect(result.plainText).toContain('https://vasia.dev');
    expect(result.plainText).toContain('https://www.vasia.dev/card');
    expect(result.plainText).toContain('https://www.vasia.dev/qr');
    expect(result.html).toContain('<a href="https://wa.me/972544513141">054-4513141</a>');
  });
});
