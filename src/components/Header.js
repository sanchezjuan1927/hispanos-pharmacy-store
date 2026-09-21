'use client';

import { useStore } from '../context/StoreContext';
import SearchBar from './SearchBar';
import styles from './Header.module.css';

const CATEGORIES = ['todos', 'farmacia', 'comida', 'limpieza', 'utilidades'];

export default function Header({ search, onSearchChange, category, onCategorySelect }) {
  const { t, toggleLang, cartCount, setCartOpen } = useStore();

  return (
    <header className={styles.header}>
      <div className={styles.mainRow}>
        <img src="/logo-light.svg" alt="Hispanos Pharmacy" className={styles.logo} />

        <div className={styles.searchRow}>
          <SearchBar value={search} onChange={onSearchChange} />
        </div>

        <div className={styles.actions}>
          <button className={styles.langBtn} onClick={toggleLang}>
            <span aria-hidden="true">🌐</span>
            <span className={styles.langLabel}>{t.langToggle}</span>
          </button>

          <button
            className={styles.cartBtn}
            onClick={() => setCartOpen(true)}
            aria-label={`${t.cart}${cartCount > 0 ? ` (${cartCount})` : ''}`}
          >
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
          </button>
        </div>
      </div>

      <nav className={styles.categoryNav} aria-label={t.categories}>
        <ul className={styles.categoryList}>
          {CATEGORIES.map((key) => (
            <li key={key}>
              <button
                className={`${styles.categoryPill} ${category === key ? styles.categoryActive : ''}`}
                onClick={() => onCategorySelect(key)}
                aria-current={category === key ? 'true' : undefined}
              >
                {t[key]}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
