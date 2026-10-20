// Static builds bake this public ID into the HTML. Development never loads GA.
const measurementId = import.meta.env.PUBLIC_GOOGLE_ANALYTICS_ID?.trim();

if (import.meta.env.PROD && measurementId && !/^G-[A-Z0-9]+$/.test(measurementId)) {
  throw new Error('PUBLIC_GOOGLE_ANALYTICS_ID must be a GA4 measurement ID (G-...).');
}

export const googleAnalyticsId = import.meta.env.PROD ? measurementId : undefined;
