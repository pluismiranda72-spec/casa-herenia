/**
 * Currency enforcement: all Stripe payments and UI display in EUR only.
 * The customer's bank handles conversion; we never pass USD or dynamic currency.
 *
 * If you later use Stripe Price IDs instead of price_data: verify in Stripe Dashboard
 * that each Price is set to EUR.
 */

/** Stripe API and any payment gateway: always use this. */
export const GLOBAL_CURRENCY = "eur" as const;

/** UI display symbol for prices (rooms, taxi, totals). */
export const CURRENCY_SYMBOL = "€" as const;

/** Optional: for explicit "EUR" label (e.g. "120 EUR"). */
export const CURRENCY_CODE = "EUR" as const;
