import { Check } from 'lucide-react';
import type { Language } from '@/types';
import { CARD_PALETTE, COLOR_UI, cardAccent, normalizeCardColor } from './cardColors';

interface CardColorPickerProps {
  language: Language;
  value: string;
  onChange: (color: string) => void;
}

export function CardColorPicker({ language, value, onChange }: CardColorPickerProps) {
  return (
    <>
      <div className="onetap-swatches" role="group" aria-label={COLOR_UI[language].title}>
        {CARD_PALETTE.map(preset => (
          <button key={preset.id} type="button" aria-pressed={value === preset.id}
            onClick={() => onChange(preset.id)}>
            <span className="onetap-color-chip" style={{ backgroundColor: preset.hex }} aria-hidden="true">
              {value === preset.id && <Check size={16} />}
            </span>
            {preset.label[language]}
          </button>
        ))}
      </div>
      <label className="onetap-custom-color">
        <span>{COLOR_UI[language].custom}</span>
        <input type="color" value={cardAccent(value)} onChange={event => {
          const next = normalizeCardColor(event.currentTarget.value);
          if (next) onChange(next);
        }} />
      </label>
    </>
  );
}
