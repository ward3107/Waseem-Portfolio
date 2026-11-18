import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { CARD_URL } from '@/features/onetap/cardData';
import * as images from '@/features/onetap/cardArtwork';
import OneTapCardPage from '@/pages/OneTapCardPage';

vi.mock('@/shared/hooks/useSiteSettings', () => ({ useSiteSettings: () => ({ settings: null }) }));

const writeText = vi.fn<(text: string) => Promise<void>>();
const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');

function openCard(lang: string, extraQuery = '') {
  window.history.replaceState({}, '', '/card?lang=' + lang + extraQuery);
  return render(<LanguageProvider><OneTapCardPage /></LanguageProvider>);
}

beforeEach(() => {
  window.localStorage.removeItem('vasia.onetap.color');
  writeText.mockReset().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
});

describe('OneTap card colors', () => {
  it('saves a preset, shares it in the only Facebook link, and restores it on the plain card', async () => {
    const view = openCard('he');
    fireEvent.click(screen.getByRole('button', { name: 'צבע הכרטיס' }));
    fireEvent.click(screen.getByRole('button', { name: 'טורקיז' }));
    fireEvent.click(screen.getByRole('button', { name: 'שמירת הצבע' }));
    expect(screen.getByRole('main')).toHaveAttribute('data-card-color', 'teal');
    fireEvent.click(screen.getByRole('button', { name: 'העתק הודעה לפייסבוק' }));
    await screen.findByRole('button', { name: 'ההודעה הועתקה' });
    expect(writeText.mock.calls[0][0].match(/https?:\/\/\S+/g)).toEqual([CARD_URL + '?color=teal']);
    view.unmount();
    openCard('he');
    expect(screen.getByRole('main')).toHaveAttribute('data-card-color', 'teal');
  });

  it('previews and cancels edits, saves a custom color, and restores the original clean link', async () => {
    openCard('en', '&variant=classic&color=rose');
    expect(screen.getByRole('main')).toHaveAttribute('data-card-color', 'rose');
    fireEvent.click(screen.getByRole('button', { name: 'Card color' }));
    fireEvent.click(screen.getByRole('button', { name: 'Violet' }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByRole('main')).toHaveAttribute('data-card-color', 'rose');
    fireEvent.click(screen.getByRole('button', { name: 'Card color' }));
    fireEvent.change(screen.getByLabelText('Custom color'), { target: { value: '#beab77' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save color' }));
    expect(screen.getByRole('main')).toHaveAttribute('data-card-color', 'beab77');
    expect(new URLSearchParams(window.location.search).get('color')).toBe('beab77');
    fireEvent.click(screen.getByRole('button', { name: 'Card color' }));
    fireEvent.click(screen.getByRole('button', { name: 'Original' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save color' }));
    expect(screen.getByRole('main')).not.toHaveAttribute('data-card-color');
    expect(window.location.search).toBe('?lang=en&variant=classic');
    fireEvent.click(screen.getByRole('button', { name: 'Copy message for Facebook' }));
    await screen.findByRole('button', { name: 'Message copied' });
    expect(writeText.mock.calls[0][0].match(/https?:\/\/\S+/g)).toEqual([CARD_URL]);
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  if (originalClipboard) Object.defineProperty(navigator, 'clipboard', originalClipboard);
  else Reflect.deleteProperty(navigator, 'clipboard');
});

describe('Image download and secondary card actions', () => {
  it('uses the saved color, current phone and language for the downloadable image', async () => {
    const png = vi.spyOn(images, 'renderCardPng').mockResolvedValue(new Blob(['png'], { type: 'image/png' }));
    let sequence = 0;
    const release = vi.fn();
    vi.stubGlobal('URL', class extends URL {
      static createObjectURL = () => 'blob:card-' + ++sequence;
      static revokeObjectURL = release;
    });
    openCard('he');
    const original = await screen.findByRole('link', { name: 'שמירת הכרטיס כתמונה' });
    expect(original).toHaveAttribute('download', 'Vasia-Waseem-he.png');
    const firstUrl = original.getAttribute('href');
    fireEvent.click(screen.getByRole('button', { name: 'צבע הכרטיס' }));
    fireEvent.click(screen.getByRole('button', { name: 'טורקיז' }));
    const preview = screen.getByRole('img', { name: /ואסים.*054-4513141/ });
    const previewSrc = preview.getAttribute('src');
    expect(decodeURIComponent(previewSrc!)).toContain('#13a89d');
    expect(decodeURIComponent(previewSrc!)).not.toMatch(/אבו עקל|أبو عقل|Abu Akel/);
    fireEvent.click(screen.getByRole('button', { name: 'שמירת הצבע' }));
    expect(await screen.findByRole('link', { name: 'שמירת הכרטיס כתמונה' })).not.toHaveAttribute('href', firstUrl);
    expect(png).toHaveBeenLastCalledWith(previewSrc);
    expect(release).toHaveBeenCalledWith(firstUrl);
    fireEvent.click(screen.getByRole('button', { name: 'العربية' }));
    expect(await screen.findByRole('link', { name: 'حفظ البطاقة كصورة' })).toHaveAttribute('download', 'Vasia-Waseem-ar.png');
    expect(decodeURIComponent(png.mock.calls.at(-1)![0])).toContain('وسيم');
  });

  it('keeps payment and offers inside More and restores focus after either dialog', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() =>
      Promise.resolve(new Response('offer', { headers: { 'content-type': 'image/jpeg' } }))));
    openCard('he');
    const more = screen.getByRole('button', { name: 'עוד פעולות' });
    expect(screen.queryByRole('button', { name: 'תשלום ב־Bit' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'מבצע בעברית' })).not.toBeInTheDocument();
    fireEvent.click(more);
    expect(more).toHaveAttribute('aria-expanded', 'true');
    const bit = screen.getByRole('button', { name: 'תשלום ב־Bit' });
    fireEvent.click(bit);
    const bitDialog = screen.getByRole('dialog', { name: 'תשלום ב־Bit' });
    fireEvent.keyDown(bitDialog, { key: 'Escape' });
    expect(bit).toHaveFocus();
    const offer = screen.getByRole('button', { name: 'מבצע בעברית' });
    offer.focus();
    fireEvent.click(offer);
    const offerDialog = await screen.findByRole('dialog', { name: 'מבצע בעברית' });
    fireEvent.keyDown(offerDialog, { key: 'Escape' });
    expect(offer).toHaveFocus();
    fireEvent.keyDown(offer, { key: 'Escape' });
    expect(more).toHaveFocus();
    expect(more).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('Facebook message on the OneTap card', () => {
  it.each([
    ['he', 'העתק הודעה לפייסבוק', 'ההודעה הועתקה', 'ואסים'],
    ['ar', 'نسخ رسالة لفيسبوك', 'تم نسخ الرسالة', 'وسيم'],
    ['en', 'Copy message for Facebook', 'Message copied', 'Waseem'],
  ])('copies one introduction and the permanent card URL in %s', async (lang, label, copied, name) => {
    openCard(lang);
    fireEvent.click(screen.getByRole('button', { name: label }));
    expect(await screen.findByRole('button', { name: copied })).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledTimes(1);
    const [message] = writeText.mock.calls[0];
    expect(message).toContain(name);
    expect(message).not.toMatch(/אבו עקל|أبو عقل|Abu Akel/);
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
    await waitFor(() => expect(field).toHaveFocus());
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
