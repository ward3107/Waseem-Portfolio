import { describe, expect, it } from 'vitest';
import type { ContactInfo } from '@/features/contact/useContact';
import { buildVCard, CARD_URL, digitsOnly, escapeVCard, safeExternalUrl } from './cardData';

const contact: ContactInfo = {
  email: 'hello@vasia.dev',
  whatsappNumber: '972534260632',
  whatsappUrl: 'https://wa.me/972534260632',
  whatsappDisplay: '+972 53 426 0632',
  github: 'https://github.com/ward3107',
  linkedin: 'https://www.linkedin.com/in/waseem-abu-akel-334486374/',
  instagram: 'https://www.instagram.com/vasia.dev/',
  facebook: 'https://www.facebook.com/profile.php?id=61594997720112',
  twitter: 'https://twitter.com/ward3107',
};

describe('VASIA OneTap contact card', () => {
  it('keeps the printed QR destination permanent and HTTPS', () => {
    expect(CARD_URL).toBe('https://www.vasia.dev/card');
  });

  it('generates a vCard 3.0 with CRLF and actionable contact fields', () => {
    const file = buildVCard(contact);
    expect(file.startsWith('BEGIN:VCARD\r\nVERSION:3.0\r\n')).toBe(true);
    expect(file).toContain('FN:Waseem Abu Akel\r\n');
    expect(file).toContain('TEL;TYPE=CELL:+972534260632\r\n');
    expect(file).toContain('EMAIL;TYPE=INTERNET:hello@vasia.dev\r\n');
    expect(file).toContain('URL:https://www.vasia.dev/card\r\n');
    expect(file.endsWith('END:VCARD\r\n')).toBe(true);
  });

  it('normalizes phone numbers, escapes text, and rejects unsafe schemes', () => {
    expect(digitsOnly('+972 (53) 426-0632')).toBe('972534260632');
    expect(escapeVCard('one,two;three\nfour')).toBe('one\\,two\\;three\\nfour');
    expect(safeExternalUrl('https://github.com/ward3107')).toBe('https://github.com/ward3107');
    expect(safeExternalUrl('http://example.org')).toBeNull();
    expect(safeExternalUrl('data:text/plain,abc')).toBeNull();
  });

  it('omits malformed contact email instead of corrupting the contact file', () => {
    const file = buildVCard({ ...contact, email: 'not-an-email' });
    expect(file).not.toContain('EMAIL;TYPE=INTERNET:');
  });

  it('omits unsafe social links', () => {
    const file = buildVCard({ ...contact, instagram: 'data:text/html,bad' });
    expect(file).not.toContain('data:text/html');
  });
});
