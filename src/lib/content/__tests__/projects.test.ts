import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => {
  const order = vi.fn();
  const select = vi.fn(() => ({ order }));
  const insert = vi.fn(async () => ({ error: null }));
  const from = vi.fn(() => ({ select, insert }));
  return { order, select, insert, from };
});

vi.mock('../../supabaseClient', () => ({
  supabase: { from: mocks.from },
}));

import { listProjectRows, createProject } from '@/lib/content/projects';

describe('projects data access', () => {
  beforeEach(() => {
    mocks.order.mockReset();
    mocks.insert.mockClear();
    mocks.from.mockClear();
  });

  it('lists rows ordered by sort_order', async () => {
    mocks.order.mockResolvedValueOnce({ data: [{ slug: 'a' }], error: null });
    const rows = await listProjectRows();
    expect(mocks.from).toHaveBeenCalledWith('projects');
    expect(mocks.order).toHaveBeenCalledWith('sort_order', { ascending: true });
    expect(rows).toEqual([{ slug: 'a' }]);
  });

  it('throws when supabase returns an error', async () => {
    mocks.order.mockResolvedValueOnce({ data: null, error: new Error('boom') });
    await expect(listProjectRows()).rejects.toThrow('boom');
  });

  it('inserts on create', async () => {
    await createProject({
      slug: 'x',
      title: 'X',
      category: 'Web',
      description: { en: 'x' },
      image_url: null,
      tech: [],
      link: null,
      github: null,
      screenshots: [],
      sort_order: 0,
    });
    expect(mocks.insert).toHaveBeenCalled();
  });
});
