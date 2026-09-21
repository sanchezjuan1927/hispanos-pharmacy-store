'use client';

import { useStore } from '../context/StoreContext';
import styles from './CartBar.module.css';

/**
 * Sticky bottom bar — appears only once there is something in the cart.
 * Keeps the running total and the way forward in reach on a phone.
 */
export default function CartBar() {
  const { t, cartCount, cartTotal, cartOpen, checkoutOpen, setCartOpen } = useStore();

  if (cartCount === 0 || cartOpen || checkoutOpen) return null;

  return (
    <div className={styles.bar}>
      <div className={styles.summary}>
        <span className={styles.count}>
          {cartCount} {cartCount === 1 ? t.productCountOne : t.productCount}
        </span>
        <span className={styles.total}>${cartTotal.toFixed(2)}</span>
      </div>
      <button className={styles.btn} onClick={() => setCartOpen(true)}>
        {t.viewCart}
        <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}
