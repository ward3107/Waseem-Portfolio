import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PromotionShareButtons } from './PromotionShareButtons';

const share = vi.fn();
const clipboard = vi.fn();
const fetchImage = vi.fn();

beforeEach(() => {
  share.mockReset().mockResolvedValue(undefined);
  clipboard.mockReset().mockResolvedValue(undefined);
  fetchImage.mockReset().mockImplementation(async () => ({
    ok: true, headers: new Headers({ 'content-type': 'image/jpeg' }),
    blob: async () => new Blob(['image'], { type: 'image/jpeg' }),
  }));
  vi.stubGlobal('fetch', fetchImage);
  Object.defineProperty(navigator, 'share', { configurable: true, value: share });
  Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true });
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: clipboard } });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

async function ready() {
  // Flush the fetched blobs before the user taps, just as on a loaded card.
  await new Promise(resolve => setTimeout(resolve, 0));
}

describe('OneTap promotion sharing', () => {
  it('keeps the download fallback usable without native dialog APIs and restores focus on Escape', async () => {
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => false });
    render(<PromotionShareButtons language="he" />);
    const button = screen.getByRole('button', { name: 'מבצע בעברית' });
    button.focus();
    fireEvent.click(button);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'סגירה' })).toHaveFocus();
    expect(screen.getByRole('link', { name: 'שמירת התמונה' })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(button).toHaveFocus();
  });

  it('sends the selected image and caption independently of the card UI language', async () => {
    render(<PromotionShareButtons language="en" />);
    await ready();
    fireEvent.click(screen.getByRole('button', { name: 'العرض بالعربية' }));
    await waitFor(() => expect(share).toHaveBeenCalledTimes(1));
    expect(share.mock.calls[0][0].files[0].name).toBe('VASIA-OneTap-ar.jpg');
    expect(share.mock.calls[0][0].text).toContain('بطاقة أعمال رقمية');
    await waitFor(() => expect(screen.getByRole('button', { name: 'מבצע בעברית' })).not.toBeDisabled());
    fireEvent.click(screen.getByRole('button', { name: 'מבצע בעברית' }));
    await waitFor(() => expect(share).toHaveBeenCalledTimes(2));
    expect(share.mock.calls[1][0].files[0].name).toBe('VASIA-OneTap-he.jpg');
    expect(share.mock.calls[1][0].text).toContain('כרטיס ביקור דיגיטלי');
  });

  it('does nothing else when the user cancels native sharing', async () => {
    share.mockRejectedValue(new DOMException('Canceled', 'AbortError'));
    render(<PromotionShareButtons language="he" />);
    await ready();
    fireEvent.click(screen.getByRole('button', { name: 'מבצע בעברית' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'מבצע בעברית' })).not.toBeDisabled());
    expect(share).toHaveBeenCalledTimes(1);
    expect(clipboard).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('offers the correct image download and caption when file sharing is unsupported', async () => {
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => false });
    render(<PromotionShareButtons language="he" />);
    await ready();
    fireEvent.click(screen.getByRole('button', { name: 'العرض بالعربية' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'שמירת התמונה' }).getAttribute('href')).toContain('vasia-offer-ar-');
    fireEvent.click(screen.getByRole('button', { name: 'העתקת ההסבר' }));
    expect(clipboard).toHaveBeenCalledWith(expect.stringContaining('بطاقة أعمال رقمية'));
    expect(share).not.toHaveBeenCalled();
  });

  it('requires a fresh tap after a slow image loads instead of sharing without user activation', async () => {
    let finish!: (response: unknown) => void;
    fetchImage.mockReturnValue(new Promise(resolve => { finish = resolve; }));
    render(<PromotionShareButtons language="he" />);
    fireEvent.click(screen.getByRole('button', { name: 'מבצע בעברית' }));
    expect(share).not.toHaveBeenCalled();
    finish({ ok: true, headers: new Headers({ 'content-type': 'image/jpeg' }), blob: async () => new Blob(['image']) });
    const button = await screen.findByRole('button', { name: 'שיתוף התמונה וההסבר' });
    expect(share).not.toHaveBeenCalled();
    fireEvent.click(button);
    await waitFor(() => expect(share).toHaveBeenCalledTimes(1));
  });

  it('rejects a missing image served as HTML and lets the user retry', async () => {
    fetchImage.mockResolvedValue({ ok: true, headers: new Headers({ 'content-type': 'text/html' }) });
    render(<PromotionShareButtons language="he" />);
    await ready();
    fireEvent.click(screen.getByRole('button', { name: 'מבצע בעברית' }));
    expect(await screen.findByRole('button', { name: 'טעינה מחדש' })).toBeInTheDocument();
    expect(share).not.toHaveBeenCalled();
  });
});
