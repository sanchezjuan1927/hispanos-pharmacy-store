'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useStore } from '../context/StoreContext';
import styles from './Cart.module.css';

export default function Cart() {
  const {
    t,
    lang,
    cart,
    cartTotal,
    cartCount,
    cartOpen,
    setCartOpen,
    removeFromCart,
    updateQty,
    setCheckoutOpen,
  } = useStore();

  useEffect(() => {
    if (!cartOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setCartOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [cartOpen, setCartOpen]);

  if (!cartOpen) return null;

  const handleCheckout = () => {
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  return (
    <div className={styles.overlay} onClick={() => setCartOpen(false)}>
      <aside
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-label={t.cart}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.header}>
          <h2 className={styles.title}>
            {t.cart}
            {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
          </h2>
          <button
            className={styles.closeBtn}
            onClick={() => setCartOpen(false)}
            aria-label={t.close}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        {cart.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon} aria-hidden="true">🛒</span>
            <p className={styles.emptyText}>{t.cartEmpty}</p>
            <button className={styles.keepBtn} onClick={() => setCartOpen(false)}>
              {t.continueShopping}
            </button>
          </div>
        ) : (
          <>
            <ul className={styles.items}>
              {cart.map((item) => {
                const name = lang === 'es' ? item.name_es : item.name_en;
                return (
                  <li key={item.id} className={styles.item}>
                    <div className={styles.thumb}>
                      <Image
                        src={item.image}
                        alt=""
                        fill
                        sizes="72px"
                        className={styles.thumbImg}
                      />
                    </div>

                    <div className={styles.itemBody}>
                      <p className={styles.itemName}>{name}</p>
                      <p className={styles.itemUnit}>
                        ${item.price.toFixed(2)} {t.each}
                      </p>

                      <div className={styles.itemControls}>
                        <div className={styles.stepper}>
                          <button
                            className={styles.stepBtn}
                            onClick={() => updateQty(item.id, item.qty - 1)}
                            aria-label={t.decrease}
                          >
                            −
                          </button>
                          <span className={styles.qty}>{item.qty}</span>
                          <button
                            className={styles.stepBtn}
                            onClick={() => updateQty(item.id, item.qty + 1)}
                            aria-label={t.increase}
                          >
                            +
                          </button>
                        </div>
                        <button
                          className={styles.removeBtn}
                          onClick={() => removeFromCart(item.id)}
                        >
                          {t.remove}
                        </button>
                      </div>
                    </div>

                    <p className={styles.itemTotal}>
                      ${(item.price * item.qty).toFixed(2)}
                    </p>
                  </li>
                );
              })}
            </ul>

            <footer className={styles.footer}>
              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>{t.total}</span>
                <span className={styles.totalValue}>${cartTotal.toFixed(2)}</span>
              </div>
              <button className={styles.checkoutBtn} onClick={handleCheckout}>
                {t.checkout}
                <span aria-hidden="true">→</span>
              </button>
              <button className={styles.keepLink} onClick={() => setCartOpen(false)}>
                {t.continueShopping}
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
