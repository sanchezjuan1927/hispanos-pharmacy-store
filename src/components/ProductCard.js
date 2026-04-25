'use client';

import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import styles from './ProductCard.module.css';

const CATEGORY_BG = {
  farmacia: '#f0f8f4',
  comida: '#fdf8f0',
  limpieza: '#f4f0fa',
  utilidades: '#f0f4fa',
};

export default function ProductCard({ product }) {
  const { t, lang, addToCart } = useStore();
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const name = lang === 'es' ? product.name_es : product.name_en;
  const bg = CATEGORY_BG[product.category] || '#f8f4f0';

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className={styles.card}>
      <div className={styles.imageWrap} style={{ background: bg }}>
        {!imgError ? (
          <img
            src={product.image}
            alt={name}
            className={styles.productImg}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={styles.imgFallback} style={{ background: bg }}>
            <span className={styles.fallbackInitial}>{name[0]}</span>
          </div>
        )}
      </div>
      <div className={styles.info}>
        <h3 className={styles.name}>{name}</h3>
        <p className={styles.price}>${product.price.toFixed(2)}</p>
      </div>
      <button
        className={`${styles.addBtn} ${added ? styles.addedBtn : ''}`}
        onClick={handleAdd}
        disabled={added}
      >
        {added ? `✓ ${t.added}` : `+ ${t.addToCart}`}
      </button>
    </div>
  );
}
