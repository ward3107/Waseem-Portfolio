export const BUSINESS_PHONE_NUMBER = '972544513141';

/** Keep stale environment/admin values from restoring the retired personal number. */
export function resolveBusinessPhone(value?: string | null): string {
  let number = (value ?? '').replace(/\D/g, '');
  if (/^05\d{8}$/.test(number)) number = '972' + number.slice(1);
  if (number.startsWith('00')) number = number.slice(2);
  if (!number || number === '972534260632') return BUSINESS_PHONE_NUMBER;
  return number;
}
