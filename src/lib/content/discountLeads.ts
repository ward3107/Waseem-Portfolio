import { db } from '@/lib/content/db';
import { isSupabaseConfigured } from '@/lib/supabaseConfig';

export interface DiscountLeadInput {
  name: string;
  contact: string; // WhatsApp number or email — stored as-is, admin normalizes.
  percent: number;
  code: string;
  language: string;
}

// Send a discount lead to Supabase. Returns `true` on success, `false` on
// any failure (missing config, network error, RLS denial, missing table).
// The reward flow uses the boolean to decide whether to show an inline
// warning — it always reveals the code either way, so a database hiccup
// never blocks the reward the visitor is claiming.
export async function submitDiscountLead(input: DiscountLeadInput): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const supabase = await db();
    const { error } = await supabase.from('discount_leads').insert({
      name: input.name,
      contact: input.contact,
      percent: input.percent,
      code: input.code,
      language: input.language,
    });
    if (error) {
      console.warn('[discountLeads] insert failed:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.warn('[discountLeads] insert threw:', e);
    return false;
  }
}
