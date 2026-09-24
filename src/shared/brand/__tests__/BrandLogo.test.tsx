import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import BrandLogo from '@/shared/brand/BrandLogo';

describe('BrandLogo', () => {
  it('exposes the vasia.dev brand name to visitors and assistive technology', () => {
    render(<BrandLogo />);

    const logo = screen.getByLabelText('vasia.dev');
    expect(logo).not.toBeNull();
    expect(logo.textContent).toContain('vasia.dev');
  });
});
