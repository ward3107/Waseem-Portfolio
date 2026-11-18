import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { CARD_URL } from '@/features/onetap/cardData';
import OneTapCardPage from '@/pages/OneTapCardPage';

vi.mock('@/shared/hooks/useSiteSettings', () => ({ useSiteSettings: () => ({ settings: null }) }));
vi.mock('@/features/onetap/PromotionShareButtons', () => ({ PromotionShareButtons: () => null }));

const writeText = vi.fn<(text: string) => Promise<void>>();
const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');

function openCard(lang: string) {
  window.history.replaceState({}, '', '/card?lang=' + lang);
  render(<LanguageProvider><OneTapCardPage /></LanguageProvider>);
}

beforeEach(() => {
  writeText.mockReset().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
});

afterEach(() => {
  cleanup();
  if (originalClipboard) Object.defineProperty(navigator, 'clipboard', originalClipboard);
  else Reflect.deleteProperty(navigator, 'clipboard');
});

describe('Facebook message on the OneTap card', () => {
  it.each([
    ['he', 'העתק הודעה לפייסבוק', 'ההודעה הועתקה', 'ואסים אבו עקל'],
    ['ar', 'نسخ رسالة لفيسبوك', 'تم نسخ الرسالة', 'وسيم أبو عقل'],
    ['en', 'Copy message for Facebook', 'Message copied', 'Waseem Abu Akel'],
  ])('copies one introduction and the permanent card URL in %s', async (lang, label, copied, name) => {
    openCard(lang);
    fireEvent.click(screen.getByRole('button', { name: label }));
    expect(await screen.findByRole('button', { name: copied })).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledTimes(1);
    const [message] = writeText.mock.calls[0];
    expect(message).toContain(name);
    expect(message.match(/https?:\/\/\S+/g)).toEqual([CARD_URL]);
    expect(message.split('\n').pop()).toBe(CARD_URL);
  });

  it('offers the same selected text when clipboard access is denied and keeps full details available', async () => {
    writeText.mockRejectedValueOnce(new Error('Clipboard denied'));
    openCard('he');
    const button = screen.getByRole('button', { name: 'העתק הודעה לפייסבוק' });
    fireEvent.click(button);
    const field = await screen.findByRole('textbox', { name: 'העתק הודעה לפייסבוק' }) as HTMLTextAreaElement;
    expect(field).toHaveValue(writeText.mock.calls[0][0]);
    expect(field).toHaveFocus();
    expect([field.selectionStart, field.selectionEnd]).toEqual([0, field.value.length]);
    expect(field).toHaveAttribute('dir', 'rtl');
    fireEvent.keyDown(field, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(button).toHaveFocus();

    fireEvent.click(screen.getByRole('button', { name: 'העתקת כל הפרטים' }));
    expect(await screen.findByRole('button', { name: 'הפרטים הועתקו' })).toBeInTheDocument();
    expect(writeText.mock.calls[1][0]).toContain('https://wa.me/');
  });
});
