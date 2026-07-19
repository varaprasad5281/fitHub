// Currency conversion rates (GBP as base)
const EXCHANGE_RATES = {
  GBP: 1,
  USD: 1.27,
  EUR: 0.92,
  CAD: 1.76,
  AUD: 2.0,
  JPY: 190.5,
  INR: 105.0,
  SGD: 1.71,
  HKD: 9.88,
  NZD: 2.13,
  ZAR: 23.5,
  BRL: 6.5,
  MXN: 21.5,
};

const COUNTRY_CURRENCY_MAP = {
  // North America
  US: "USD",
  CA: "CAD",
  MX: "MXN",
  // Europe
  GB: "GBP",
  DE: "EUR",
  FR: "EUR",
  IT: "EUR",
  ES: "EUR",
  NL: "EUR",
  BE: "EUR",
  AT: "EUR",
  IE: "EUR",
  PT: "EUR",
  GR: "EUR",
  SE: "EUR",
  NO: "EUR",
  DK: "EUR",
  PL: "EUR",
  CZ: "EUR",
  HU: "EUR",
  RO: "EUR",
  // Asia Pacific
  AU: "AUD",
  NZ: "NZD",
  JP: "JPY",
  IN: "INR",
  SG: "SGD",
  HK: "HKD",
  // Africa
  ZA: "ZAR",
  // South America
  BR: "BRL",
};

const CURRENCY_SYMBOLS = {
  GBP: "$",
  USD: "$",
  EUR: "€",
  CAD: "$",
  AUD: "$",
  JPY: "¥",
  INR: "₹",
  SGD: "$",
  HKD: "$",
  NZD: "$",
  ZAR: "R",
  BRL: "R$",
  MXN: "$",
};

export async function getUserCurrency() {
  try {
    // Map timezones to countries for currency detection
    const timezone = new Intl.DateTimeFormat().resolvedOptions().timeZone;
    const timezoneToCountry = {
      "America/New_York": "US",
      "America/Los_Angeles": "US",
      "America/Chicago": "US",
      "America/Denver": "US",
      "Europe/London": "GB",
      "Europe/Paris": "FR",
      "Europe/Berlin": "DE",
      "Asia/Tokyo": "JP",
      "Asia/Singapore": "SG",
      "Australia/Sydney": "AU",
      "Asia/Hong_Kong": "HK",
      "Asia/Kolkata": "IN",
      "America/Toronto": "CA",
    };

    const country = timezoneToCountry[timezone] || "GB";
    return COUNTRY_CURRENCY_MAP[country] || "GBP";
  } catch (error) {
    console.error("Failed to detect currency:", error);
    return "GBP";
  }
}

export function convertPrice(priceGBP, targetCurrency) {
  if (!EXCHANGE_RATES[targetCurrency]) {
    return { price: priceGBP, currency: "GBP", symbol: "$" };
  }

  const rate = EXCHANGE_RATES[targetCurrency];
  const convertedPrice = parseFloat((priceGBP * rate).toFixed(2));

  return {
    price: convertedPrice,
    currency: targetCurrency,
    symbol: CURRENCY_SYMBOLS[targetCurrency] || targetCurrency,
  };
}

export function formatPrice(priceGBP, currency) {
  const converted = convertPrice(priceGBP, currency);
  return `${converted.symbol}${converted.price}`;
}
