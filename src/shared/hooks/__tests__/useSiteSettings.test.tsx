import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

const mocks = vi.hoisted(() => ({
  getSettings: vi.fn(),
  isSupabaseConfigured: true,
}));

vi.mock('@/lib/supabaseConfig', () => ({
  get isSupabaseConfigured() {
    return mocks.isSupabaseConfigured;
  },
}));

vi.mock('@/lib/content/settings', () => ({
  getSettings: mocks.getSettings,
}));

import { useSiteSettings, __resetSiteSettingsCache } from '@/shared/hooks/useSiteSettings';

const Consumer: React.FC<{ id: string }> = ({ id }) => {
  const { settings } = useSiteSettings();
  return <span data-testid={id}>{settings?.contact_email ?? 'none'}</span>;
};

const textOf = (id: string) => screen.getByTestId(id).textContent;

describe('useSiteSettings', () => {
  beforeEach(() => {
    __resetSiteSettingsCache();
    mocks.getSettings.mockReset();
    mocks.isSupabaseConfigured = true;
  });

  // Regression: useContact() (this hook's only consumer) is called from ~10
  // components, six of which mount on the home page. Each used to run its own
  // request, so one page load fired six identical queries for the same
  // single-row table.
  it('fetches once no matter how many components consume it', async () => {
    mocks.getSettings.mockResolvedValue({ contact_email: 'a@b.com' });

    render(
      <>
        <Consumer id="one" />
        <Consumer id="two" />
        <Consumer id="three" />
        <Consumer id="four" />
        <Consumer id="five" />
        <Consumer id="six" />
      </>
    );

    await waitFor(() => expect(textOf('six')).toBe('a@b.com'));
    expect(textOf('one')).toBe('a@b.com');
    expect(mocks.getSettings).toHaveBeenCalledTimes(1);
  });

  it('serves later consumers from cache without refetching', async () => {
    mocks.getSettings.mockResolvedValue({ contact_email: 'a@b.com' });

    render(<Consumer id="first" />);
    await waitFor(() => expect(textOf('first')).toBe('a@b.com'));

    render(<Consumer id="late" />);
    // Resolved synchronously from the module cache — no loading flash.
    expect(textOf('late')).toBe('a@b.com');
    expect(mocks.getSettings).toHaveBeenCalledTimes(1);
  });

  it('falls back to null when the fetch rejects, without throwing', async () => {
    mocks.getSettings.mockRejectedValue(new Error('offline'));

    render(<Consumer id="err" />);
    await waitFor(() => expect(textOf('err')).toBe('none'));
    expect(mocks.getSettings).toHaveBeenCalledTimes(1);
  });

  it('never touches the network when Supabase is not configured', async () => {
    mocks.isSupabaseConfigured = false;

    render(<Consumer id="off" />);
    await waitFor(() => expect(textOf('off')).toBe('none'));
    expect(mocks.getSettings).not.toHaveBeenCalled();
  });
});
