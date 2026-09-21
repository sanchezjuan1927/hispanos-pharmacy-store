'use client';

import { useState, useMemo, useCallback } from 'react';
import Header from '../components/Header';
import DeliveryBanner from '../components/DeliveryBanner';
import ProductGrid from '../components/ProductGrid';
import ProductDetail from '../components/ProductDetail';
import Cart from '../components/Cart';
import CartBar from '../components/CartBar';
import Checkout from '../components/Checkout';
import StoreFooter from '../components/StoreFooter';
import { useStore } from '../context/StoreContext';
import { placeholderProducts } from '../lib/products';
import styles from './page.module.css';

/**
 * Strip accents so "cafe" finds "Café Bustelo". Customers type on phone
 * keyboards without accents far more often than with them.
 */
const normalize = (value) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

// Built once for the static catalog, not per keystroke.
const searchIndex = new Map(
  placeholderProducts.map((p) => [p.id, `${normalize(p.name_es)} ${normalize(p.name_en)}`])
);

export default function Home() {
  const { t } = useStore();
  const [category, setCategory] = useState('todos');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const filteredProducts = useMemo(() => {
    let products = placeholderProducts;

    if (category !== 'todos') {
      products = products.filter((p) => p.category === category);
    }

    if (search.trim()) {
      // Match either language so a search works whichever toggle is on
      const query = normalize(search.trim());
      products = products.filter((p) => searchIndex.get(p.id).includes(query));
    }

    return products;
  }, [category, search]);

  const closeDetail = useCallback(() => setSelected(null), []);

  const heading = search.trim()
    ? `${t.resultsFor} “${search.trim()}”`
    : t[category];

  return (
    <>
      <Header
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategorySelect={setCategory}
      />

      <DeliveryBanner />

      <main className={styles.main}>
        <div className={styles.sectionHead}>
          <h1 className={styles.heading}>{heading}</h1>
          <span className={styles.count}>
            {filteredProducts.length}{' '}
            {filteredProducts.length === 1 ? t.productCountOne : t.productCount}
          </span>
        </div>

        <ProductGrid products={filteredProducts} onOpenProduct={setSelected} />
      </main>

      <StoreFooter />

      <ProductDetail product={selected} onClose={closeDetail} />
      <Cart />
      <CartBar />
      <Checkout />
    </>
  );
}
