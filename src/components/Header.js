'use client';

import { useStore } from '../context/StoreContext';
import SearchBar from './SearchBar';
import styles from './Header.module.css';

export default function Header({ search, onSearchChange }) {
  const { t, toggleLang, cartCount, setCartOpen } = useStore();

  return (
    <header className={styles.header}>
      <div className={styles.topRow}>
        <div className={styles.storeInfo}>
          <span className={styles.infoLine}>📍 80-11 37th Ave, Jackson Heights NY</span>
          <span className={styles.infoLine}>📞 (718) 255-6129</span>
        </div>
        <div className={styles.brand}>
          <img src="/logo.svg" alt="Hispanos Pharmacy" className={styles.logoImg} />
        </div>
        <button className={styles.langBtn} onClick={toggleLang} aria-label="Toggle language">
          🌐 {t.langToggle}
        </button>
      </div>
      <div className={styles.searchArea}>
        <SearchBar value={search} onChange={onSearchChange} />
      </div>
      <button
        className={styles.cartBtn}
        onClick={() => setCartOpen(true)}
        aria-label={t.cart}
      >
        <span className={styles.cartIcon}>🛒</span>
        {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
      </button>
    </header>
  );
}
