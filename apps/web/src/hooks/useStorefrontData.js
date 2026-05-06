import { useEffect, useState } from 'react';
import { fallbackProducts } from '../data/catalog';
import { fetchStorefrontProducts, fetchDashboardSummary, formatCurrency } from '../lib/api';

export function useStorefrontData() {
  const [products, setProducts] = useState(
    fallbackProducts.map((product) => ({ ...product, priceLabel: formatCurrency(product.priceCents) }))
  );
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    let active = true;

    fetchStorefrontProducts().then((payload) => {
      if (active) {
        setProducts(payload);
      }
    });

    fetchDashboardSummary().then((payload) => {
      if (active) {
        setSummary(payload);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  return { products, summary };
}
