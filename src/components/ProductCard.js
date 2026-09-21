'use client';

import Image from 'next/image';
import { useStore } from '../context/StoreContext';
import styles from './ProductCard.module.css';

export default function ProductCard({ product, onOpen, priority = false }) {
  const { t, lang, cart, addToCart, updateQty } = useStore();

  const name = lang === 'es' ? product.name_es : product.name_en;
  const qty = cart.find((item) => item.id === product.id)?.qty ?? 0;

  const [dollars, cents] = product.price.toFixed(2).split('.');

  return (
    <article className={styles.card}>
      <button
        className={styles.preview}
        onClick={() => onOpen(product)}
        aria-label={name}
      >
        <span className={styles.imageWrap}>
          <Image
            src={product.image}
            alt=""
            fill
            sizes="(min-width: 900px) 220px, (min-width: 600px) 30vw, 45vw"
            className={styles.image}
            priority={priority}
          />
        </span>
        <span className={styles.name}>{name}</span>
      </button>

      <p className={styles.price}>
        <span className={styles.currency}>$</span>
        <span className={styles.dollars}>{dollars}</span>
        <span className={styles.cents}>{cents}</span>
      </p>

      {qty === 0 ? (
        <button className={styles.addBtn} onClick={() => addToCart(product)}>
          {t.addToCart}
        </button>
      ) : (
        <div className={styles.stepper}>
          <button
            className={styles.stepBtn}
            onClick={() => updateQty(product.id, qty - 1)}
            aria-label={t.decrease}
          >
            {qty === 1 ? (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
              </svg>
            ) : (
              '−'
            )}
          </button>
          <span className={styles.qty} aria-live="polite">{qty}</span>
          <button
            className={styles.stepBtn}
            onClick={() => updateQty(product.id, qty + 1)}
            aria-label={t.increase}
          >
            +
          </button>
        </div>
      )}
    </article>
  );
}
