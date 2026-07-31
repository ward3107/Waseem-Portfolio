import { Language } from '@/types';
import { en } from './en';
import { he } from './he';
import { ar } from './ar';

export const translations: Record<Language, Record<string, string>> = {
  en,
  he,
  ar
};
