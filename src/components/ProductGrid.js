'use client';

import { useStore } from '../context/StoreContext';
import ProductCard from './ProductCard';
import styles from './ProductGrid.module.css';

export default function ProductGrid({ products, onOpenProduct }) {
  const { t } = useStore();

  if (products.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon} aria-hidden="true">🔍</span>
        <p className={styles.emptyText}>{t.noProducts}</p>
        <p className={styles.emptyHint}>{t.noProductsHint}</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {products.map((product, i) => (
        <ProductCard
          key={product.id}
          product={product}
          onOpen={onOpenProduct}
          priority={i < 4}
        />
      ))}
    </div>
  );
}
