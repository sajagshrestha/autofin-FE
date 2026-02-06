const NPR_LOCALE = "en";
const DEFAULT_CURRENCY = "NPR";

const nprFormatter = new Intl.NumberFormat(NPR_LOCALE, {
	style: "currency",
	currency: DEFAULT_CURRENCY,
});

/**
 * Format a number as NPR currency (e.g. "रु. 1,234.56" or "Rs. 1,234.56" depending on locale).
 * Use for transaction amounts, summary cards, and tooltips.
 */
export function formatCurrency(
	value: number,
	currency: string = DEFAULT_CURRENCY,
): string {
	if (currency !== DEFAULT_CURRENCY) {
		return new Intl.NumberFormat(NPR_LOCALE, {
			style: "currency",
			currency,
		}).format(value);
	}
	return nprFormatter.format(value);
}

/**
 * Format a number as short NPR for chart axis ticks (e.g. "Rs. 10k", "Rs. 1.5k").
 * Value is in actual units; display shows value/1000 + "k".
 */
export function formatCurrencyShort(value: number): string {
	const k = value / 1000;
	const label = k >= 1 ? `${k}k` : value.toString();
	return `${label}`;
}
