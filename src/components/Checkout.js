'use client';

import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import styles from './Checkout.module.css';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '14155238886';

export default function Checkout() {
  const { t, lang, cart, cartTotal, checkoutOpen, setCheckoutOpen, clearCart } =
    useStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  if (!checkoutOpen) return null;

  const buildWhatsAppMessage = () => {
    const header = lang === 'es' ? '🛒 *Nuevo Pedido - Hispanos Pharmacy*' : '🛒 *New Order - Hispanos Pharmacy*';
    const divider = '─────────────────────';

    let items = cart
      .map((item) => {
        const itemName = lang === 'es' ? item.name_es : item.name_en;
        return `• ${itemName} x${item.qty}  —  $${(item.price * item.qty).toFixed(2)}`;
      })
      .join('\n');

    const totalLabel = lang === 'es' ? 'TOTAL' : 'TOTAL';
    const nameLabel = lang === 'es' ? 'Nombre' : 'Name';
    const phoneLabel = lang === 'es' ? 'Teléfono' : 'Phone';
    const addressLabel = lang === 'es' ? 'Dirección' : 'Address';

    const message = `${header}\n${divider}\n\n${items}\n\n${divider}\n💰 *${totalLabel}: $${cartTotal.toFixed(2)}*\n${divider}\n\n👤 *${nameLabel}:* ${name}\n📞 *${phoneLabel}:* ${phone}\n📍 *${addressLabel}:* ${address}`;

    return encodeURIComponent(message);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const message = buildWhatsAppMessage();
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    window.open(url, '_blank');
    clearCart();
    setCheckoutOpen(false);
    setName('');
    setPhone('');
    setAddress('');
  };

  const isValid = name.trim() && phone.trim() && address.trim() && cart.length > 0;

  return (
    <div className={styles.overlay} onClick={() => setCheckoutOpen(false)}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <button
            className={styles.backBtn}
            onClick={() => setCheckoutOpen(false)}
          >
            ← {t.backToCart}
          </button>
          <h2 className={styles.title}>{t.checkoutTitle}</h2>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="checkout-name">
              👤 {t.name}
            </label>
            <input
              id="checkout-name"
              type="text"
              className={styles.input}
              placeholder={t.namePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="checkout-phone">
              📞 {t.phone}
            </label>
            <input
              id="checkout-phone"
              type="tel"
              className={styles.input}
              placeholder={t.phonePlaceholder}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              autoComplete="tel"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="checkout-address">
              📍 {t.address}
            </label>
            <textarea
              id="checkout-address"
              className={`${styles.input} ${styles.textarea}`}
              placeholder={t.addressPlaceholder}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              rows={3}
              autoComplete="street-address"
            />
          </div>

          <div className={styles.summary}>
            <h3 className={styles.summaryTitle}>{t.orderSummary}</h3>
            {cart.map((item) => {
              const itemName = lang === 'es' ? item.name_es : item.name_en;
              return (
                <div key={item.id} className={styles.summaryItem}>
                  <span>
                    {itemName} <span className={styles.qty}>×{item.qty}</span>
                  </span>
                  <span className={styles.summaryPrice}>
                    ${(item.price * item.qty).toFixed(2)}
                  </span>
                </div>
              );
            })}
            <div className={styles.summaryTotal}>
              <span>{t.total}</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={!isValid}
          >
            <span className={styles.whatsappIcon}>
              <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </span>
            {t.sendOrder}
          </button>
        </form>
      </div>
    </div>
  );
}
