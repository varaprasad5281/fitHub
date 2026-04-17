import { useState, useEffect } from 'react';
import { getUserCurrency, convertPrice, formatPrice } from '@/components/utils/currencyUtils';

export function useCurrency() {
  const [currency, setCurrency] = useState('GBP');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const detectCurrency = async () => {
      try {
        const detected = await getUserCurrency();
        setCurrency(detected);
      } catch (error) {
        console.error('Failed to detect currency:', error);
        // Default to GBP on error - don't let currency failure block app
      } finally {
        setLoading(false);
      }
    };

    detectCurrency();
  }, []);

  return {
    currency,
    loading,
    convertPrice: (priceGBP) => convertPrice(priceGBP, currency),
    formatPrice: (priceGBP) => formatPrice(priceGBP, currency),
  };
}