'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useStore } from '../context/StoreContext';
import styles from './ProductDetail.module.css';

export default function ProductDetail({ product, onClose }) {
  const { t, lang, cart, addToCart, updateQty, setCartOpen } = useStore();

  // Close on Escape, and stop the page behind from scrolling
  useEffect(() => {
    if (!product) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [product, onClose]);

  if (!product) return null;

  const name = lang === 'es' ? product.name_es : product.name_en;
  const qty = cart.find((item) => item.id === product.id)?.qty ?? 0;

  const goToCart = () => {
    onClose();
    setCartOpen(true);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-label={name}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.closeBtn} onClick={onClose} aria-label={t.close}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <div className={styles.body}>
          <div className={styles.imageWrap}>
            <Image
              src={product.image}
              alt={name}
              fill
              sizes="(min-width: 720px) 320px, 70vw"
              className={styles.image}
            />
          </div>

          <div className={styles.info}>
            <span className={styles.category}>{t[product.category]}</span>
            <h2 className={styles.name}>{name}</h2>
            <p className={styles.price}>${product.price.toFixed(2)}</p>
            <p className={styles.delivery}>
              <span aria-hidden="true">🚚</span> {t.deliveryNote}
            </p>

            {qty === 0 ? (
              <button className={styles.addBtn} onClick={() => addToCart(product)}>
                {t.addToCart}
              </button>
            ) : (
              <div className={styles.actions}>
                <div className={styles.stepper}>
                  <button
                    className={styles.stepBtn}
                    onClick={() => updateQty(product.id, qty - 1)}
                    aria-label={t.decrease}
                  >
                    −
                  </button>
                  <span className={styles.qty} aria-live="polite">
                    {qty}
                  </span>
                  <button
                    className={styles.stepBtn}
                    onClick={() => updateQty(product.id, qty + 1)}
                    aria-label={t.increase}
                  >
                    +
                  </button>
                </div>
                <button className={styles.cartBtn} onClick={goToCart}>
                  {t.viewCart}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
