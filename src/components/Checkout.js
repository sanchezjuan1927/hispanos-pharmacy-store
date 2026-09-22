'use client';

import { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { getSupabase } from '../lib/supabase';
import styles from './Checkout.module.css';

const PHARMACY_PHONE = '(718) 255-6129';
const PHARMACY_TEL = 'tel:+17182556129';

const digitsOf = (value) => value.replace(/\D/g, '');

// US numbers only: 10 digits, or 11 with a leading 1.
const isValidPhone = (value) => {
  const d = digitsOf(value);
  return d.length === 10 || (d.length === 11 && d.startsWith('1'));
};

// Shape "9295551234" into "(929) 555-1234" as the customer types.
const formatPhone = (value) => {
  let d = digitsOf(value);
  if (d.length === 11 && d.startsWith('1')) d = d.slice(1);
  d = d.slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
};

export default function Checkout() {
  const { t, lang, cart, cartTotal, checkoutOpen, setCheckoutOpen, setCartOpen, clearCart } =
    useStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [payment, setPayment] = useState('cash');
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  // Snapshot of the placed order, so the confirmation survives clearing the cart
  const [placed, setPlaced] = useState(null);

  const open = checkoutOpen || placed !== null;

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  const phoneOk = isValidPhone(phone);
  const isValid =
    name.trim().length >= 2 && phoneOk && address.trim().length >= 5 && cart.length > 0;

  const close = () => {
    setCheckoutOpen(false);
    setPlaced(null);
  };

  const backToCart = () => {
    setCheckoutOpen(false);
    setCartOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || submitting) return;
    setSubmitting(true);
    setError(false);

    const items = cart.map((item) => ({
      id: item.id,
      name: item.name_es,
      name_en: item.name_en,
      qty: item.qty,
      price: item.price,
    }));

    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error('not_configured');

      const { data: orderId, error: rpcError } = await supabase.rpc('place_order', {
        p_full_name: name.trim(),
        p_phone: formatPhone(phone),
        p_address: address.trim(),
        p_items: items,
        p_notes: notes.trim(),
        p_payment_method: payment,
        p_lang: lang,
      });
      if (rpcError) throw rpcError;

      // The order only counts as placed once the database has it; the cart
      // is kept on any failure so nobody has to rebuild it.
      setPlaced({
        id: orderId,
        name: name.trim(),
        phone: formatPhone(phone),
        total: cartTotal,
        count: cart.reduce((sum, item) => sum + item.qty, 0),
      });
      clearCart();
      setCheckoutOpen(false);
      setName('');
      setPhone('');
      setAddress('');
      setNotes('');
      setPayment('cash');
      setPhoneTouched(false);
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Confirmation ─────────────────────────────────────────────
  if (placed) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal} role="dialog" aria-modal="true" aria-label={t.orderPlacedTitle}>
          <div className={styles.confirm}>
            <div className={styles.checkCircle} aria-hidden="true">
              <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </div>
            <h2 className={styles.confirmTitle}>{t.orderPlacedTitle}</h2>
            <p className={styles.orderNumber}>
              {t.orderNumber} <strong>#{placed.id}</strong>
            </p>
            <p className={styles.confirmText}>
              {t.orderPlacedText.replace('{name}', placed.name.split(' ')[0])}
            </p>

            <div className={styles.confirmSummary}>
              <div>
                <span>{t.phone}</span>
                <strong>{placed.phone}</strong>
              </div>
              <div>
                <span>
                  {placed.count} {placed.count === 1 ? t.productCountOne : t.productCount}
                </span>
                <strong>${placed.total.toFixed(2)}</strong>
              </div>
            </div>

            <p className={styles.confirmHelp}>
              {t.questions} <a href={PHARMACY_TEL}>{PHARMACY_PHONE}</a>
            </p>

            <button className={styles.submitBtn} onClick={close}>
              {t.continueShopping}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────
  return (
    <div className={styles.overlay} onClick={() => setCheckoutOpen(false)}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={t.checkoutTitle}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={backToCart}>
            ← {t.backToCart}
          </button>
          <h2 className={styles.title}>{t.checkoutTitle}</h2>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="checkout-name">
              {t.name} <span className={styles.req}>*</span>
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
              {t.phone} <span className={styles.req}>*</span>
            </label>
            <input
              id="checkout-phone"
              type="tel"
              inputMode="tel"
              className={`${styles.input} ${phoneTouched && !phoneOk ? styles.inputError : ''}`}
              placeholder={t.phonePlaceholder}
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              onBlur={() => setPhoneTouched(true)}
              required
              autoComplete="tel-national"
              aria-invalid={phoneTouched && !phoneOk}
              aria-describedby="phone-help"
            />
            <p id="phone-help" className={phoneTouched && !phoneOk ? styles.fieldError : styles.fieldHint}>
              {phoneTouched && !phoneOk ? t.phoneInvalid : t.phoneHint}
            </p>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="checkout-address">
              {t.address} <span className={styles.req}>*</span>
            </label>
            <textarea
              id="checkout-address"
              className={`${styles.input} ${styles.textarea}`}
              placeholder={t.addressPlaceholder}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              rows={2}
              autoComplete="street-address"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="checkout-notes">
              {t.notes} <span className={styles.optional}>({t.optional})</span>
            </label>
            <textarea
              id="checkout-notes"
              className={`${styles.input} ${styles.textarea}`}
              placeholder={t.notesPlaceholder}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              maxLength={500}
            />
          </div>

          <fieldset className={styles.field}>
            <legend className={styles.label}>{t.paymentMethod}</legend>
            <div className={styles.paymentOptions}>
              {['cash', 'card'].map((option) => (
                <label
                  key={option}
                  className={`${styles.paymentOption} ${payment === option ? styles.paymentActive : ''}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={option}
                    checked={payment === option}
                    onChange={() => setPayment(option)}
                  />
                  <span aria-hidden="true">{option === 'cash' ? '💵' : '💳'}</span>
                  {option === 'cash' ? t.payCash : t.payCard}
                </label>
              ))}
            </div>
            <p className={styles.fieldHint}>{t.paymentHint}</p>
          </fieldset>

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

          {error && (
            <p className={styles.submitError} role="alert">
              {t.orderError} <a href={PHARMACY_TEL}>{PHARMACY_PHONE}</a>
            </p>
          )}

          <button type="submit" className={styles.submitBtn} disabled={!isValid || submitting}>
            {submitting ? t.placingOrder : `${t.placeOrder} · $${cartTotal.toFixed(2)}`}
          </button>
        </form>
      </div>
    </div>
  );
}
