import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import type { LocalizedText, ReviewRow } from '@/types';

const mocks = vi.hoisted(() => ({
  listReviewRows: vi.fn(),
  isSupabaseConfigured: true,
  generated: [] as ReviewRow[],
}));

vi.mock('@/lib/supabaseConfig', () => ({
  get isSupabaseConfigured() {
    return mocks.isSupabaseConfigured;
  },
}));

vi.mock('@/lib/content/reviews', () => ({
  listReviewRows: mocks.listReviewRows,
}));

vi.mock('@/features/reviews/generated', () => ({
  get GENERATED_REVIEW_ROWS() {
    return mocks.generated;
  },
}));

const language = { current: 'en' };
vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({ language: language.current }),
}));

import { useReviews } from '@/features/reviews/useReviews';

const row = (author: string, text: LocalizedText): ReviewRow =>
  ({
    id: author,
    author,
    rating: 5,
    text,
    location: null,
    date: null,
    status: 'approved',
    sort_order: 0,
    created_at: '',
    updated_at: '',
  }) as ReviewRow;

const Consumer: React.FC = () => {
  const { reviews } = useReviews();
  return (
    <span data-testid="out">
      {reviews.map((r) => `${r.author}:${r.text}`).join('|') || 'empty'}
    </span>
  );
};

const out = () => screen.getByTestId('out').textContent;

describe('useReviews', () => {
  beforeEach(() => {
    mocks.listReviewRows.mockReset();
    mocks.isSupabaseConfigured = true;
    mocks.generated = [];
    language.current = 'en';
  });

  // Regression: the testimonials section used to render nothing until the
  // Supabase query resolved, then appear at full height (~1070px) and push
  // everything below it down. The build-time snapshot makes it render in the
  // first paint instead.
  it('renders the baked snapshot synchronously, before any fetch resolves', () => {
    mocks.generated = [row('Baked', { en: 'from the build' })];
    mocks.listReviewRows.mockReturnValue(new Promise(() => {})); // never settles

    render(<Consumer />);
    expect(out()).toBe('Baked:from the build');
  });

  it('replaces the snapshot once live rows arrive', async () => {
    mocks.generated = [row('Baked', { en: 'from the build' })];
    mocks.listReviewRows.mockResolvedValue([row('Live', { en: 'from the database' })]);

    render(<Consumer />);
    expect(out()).toBe('Baked:from the build');
    await waitFor(() => expect(out()).toBe('Live:from the database'));
  });

  it('keeps the snapshot when the live query fails', async () => {
    mocks.generated = [row('Baked', { en: 'from the build' })];
    mocks.listReviewRows.mockRejectedValue(new Error('offline'));

    render(<Consumer />);
    await waitFor(() => expect(mocks.listReviewRows).toHaveBeenCalled());
    expect(out()).toBe('Baked:from the build');
  });

  it('localizes the snapshot without re-querying when language changes', async () => {
    mocks.generated = [row('Baked', { en: 'english', he: 'hebrew', ar: 'arabic' })];
    mocks.listReviewRows.mockResolvedValue([
      row('Live', { en: 'english', he: 'hebrew', ar: 'arabic' }),
    ]);

    const { rerender } = render(<Consumer />);
    await waitFor(() => expect(out()).toBe('Live:english'));

    language.current = 'he';
    rerender(<Consumer />);
    expect(out()).toBe('Live:hebrew');
    // The rows already carry every translation — switching language must not
    // hit the network again.
    expect(mocks.listReviewRows).toHaveBeenCalledTimes(1);
  });

  it('does not query at all when Supabase is not configured', async () => {
    mocks.isSupabaseConfigured = false;
    mocks.generated = [row('Baked', { en: 'from the build' })];

    render(<Consumer />);
    expect(out()).toBe('Baked:from the build');
    expect(mocks.listReviewRows).not.toHaveBeenCalled();
  });
});
