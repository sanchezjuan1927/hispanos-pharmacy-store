'use client';

import { useStore } from '../context/StoreContext';
import styles from './Cart.module.css';

export default function Cart() {
  const {
    t,
    lang,
    cart,
    cartTotal,
    cartOpen,
    setCartOpen,
    removeFromCart,
    updateQty,
    setCheckoutOpen,
  } = useStore();

  if (!cartOpen) return null;

  const handleCheckout = () => {
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  return (
    <div className={styles.overlay} onClick={() => setCartOpen(false)}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>🛒 {t.cart}</h2>
          <button className={styles.closeBtn} onClick={() => setCartOpen(false)}>
            ✕
          </button>
        </div>

        {cart.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🛒</span>
            <p>{t.cartEmpty}</p>
          </div>
        ) : (
          <>
            <div className={styles.items}>
              {cart.map((item) => {
                const name = lang === 'es' ? item.name_es : item.name_en;
                return (
                  <div key={item.id} className={styles.item}>
                    <div className={styles.itemInfo}>
                      <p className={styles.itemName}>{name}</p>
                      <p className={styles.itemPrice}>
                        ${(item.price * item.qty).toFixed(2)}
                      </p>
                    </div>
                    <div className={styles.itemActions}>
                      <div className={styles.qtyControls}>
                        <button
                          className={styles.qtyBtn}
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className={styles.qtyValue}>{item.qty}</span>
                        <button
                          className={styles.qtyBtn}
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          aria-label="Increase quantity"
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
                );
              })}
            </div>

            <div className={styles.footer}>
              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>{t.total}:</span>
                <span className={styles.totalValue}>${cartTotal.toFixed(2)}</span>
              </div>
              <button className={styles.checkoutBtn} onClick={handleCheckout}>
                {t.checkout} →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
