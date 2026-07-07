import { Review } from '../types';

// ==========================================================================
// Real customer reviews. LEAVE EMPTY until you have genuine reviews — the
// Reviews section and its AggregateRating structured data only render when
// this array is non-empty, so no fake ratings are ever shown to Google.
//
// To add a review, copy a real Google review here, e.g.:
//   { author: 'שם הלקוח', rating: 5, text: 'ביקורת אמיתית...', location: 'עכו' },
//
// Tip: collect reviews on your Google Business Profile first, then mirror the
// real ones here so the homepage shows social proof + star-rating rich results.
// ==========================================================================
export const REVIEWS: Review[] = [];

export const averageRating = (reviews: Review[]): number =>
  reviews.length === 0
    ? 0
    : Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10;
