import type { Language } from '@/types';
import { scopeCopy, type ScopeFeature, type ScopeProfile, type ScopeQuantity, type ScopeValues } from './scope';

const quantityOrder: ScopeQuantity[] = ['pages', 'languages', 'products', 'reels'];
const copy = {
  he: { heading: 'התאימו את ההיקף', included: 'הכמות הראשונית לבחירה', featureHeading: 'אפשרויות נוספות' },
  en: { heading: 'Configure the scope', included: 'Starting selection', featureHeading: 'Additional features' },
  ar: { heading: 'خصّص نطاق العمل', included: 'الكمية الأولية للاختيار', featureHeading: 'ميزات إضافية' },
} as const;

type Props = {
  language: Language;
  profile: ScopeProfile;
  value: ScopeValues;
  onChange: (value: ScopeValues) => void;
};

export default function ScopeEditor({ language, profile, value, onChange }: Props) {
  const t = copy[language];
  const changeQuantity = (kind: ScopeQuantity, next: number) => {
    if (!Number.isSafeInteger(next)) return;
    onChange({ ...value, quantities: { ...value.quantities, [kind]: next } });
  };
  const changeFeature = (feature: ScopeFeature, checked: boolean) => {
    const previous = value.features ?? [];
    onChange({ ...value, features: checked ? [...new Set([...previous, feature])] : previous.filter((item) => item !== feature) });
  };

  return (
    <fieldset className="mb-3 rounded-2xl border border-[#dfe4ef] bg-[#f6f7fc] p-4 sm:p-5">
      <legend className="px-2 text-sm font-bold text-[#342880]">{t.heading}</legend>
      <div className="grid gap-4 sm:grid-cols-2">
        {quantityOrder.map((kind) => {
          const rule = profile.quantities[kind];
          if (!rule) return null;
          const chosen = value.quantities?.[kind] ?? rule.included;
          return <label key={kind} className="block text-sm font-semibold">
            {scopeCopy.quantities[kind][language]}
            <input type="number" inputMode="numeric" min={rule.included} max={rule.max} step="1"
              value={chosen} onChange={(event) => changeQuantity(kind, event.currentTarget.valueAsNumber)}
              className="mt-2 min-h-12 w-full rounded-xl border border-[#cfd6e5] bg-white px-4 text-base text-[#18203a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5448a9]" />
            <span className="mt-1 block text-xs font-normal text-[#59647c]">{t.included}: {rule.included}</span>
          </label>;
        })}
      </div>
      {profile.design && <fieldset className="mt-5">
        <legend className="text-sm font-semibold">{scopeCopy.design.heading[language]}</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {(['standard', 'enhanced', 'custom'] as const).map((design) => <label key={design} className="flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border border-[#dfe4ef] bg-white px-3 text-sm">
            <input type="radio" name="design-level" checked={(value.design ?? 'standard') === design}
              onChange={() => onChange({ ...value, design })} className="h-4 w-4 accent-[#5448a9]" />
            {scopeCopy.design[design][language]}
          </label>)}
        </div>
      </fieldset>}
      {!!profile.features?.length && <fieldset className="mt-5">
        <legend className="text-sm font-semibold">{t.featureHeading}</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {profile.features.map((feature) => <label key={feature} className="flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border border-[#dfe4ef] bg-white px-3 text-sm">
            <input type="checkbox" checked={value.features?.includes(feature) ?? false}
              onChange={(event) => changeFeature(feature, event.currentTarget.checked)} className="h-4 w-4 accent-[#5448a9]" />
            {scopeCopy.features[feature][language]}
          </label>)}
        </div>
      </fieldset>}
    </fieldset>
  );
}
