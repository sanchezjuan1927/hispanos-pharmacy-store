'use client';

import { useStore } from '../context/StoreContext';
import styles from './SearchBar.module.css';

export default function SearchBar({ value, onChange }) {
  const { t } = useStore();

  return (
    <div className={styles.container}>
      <span className={styles.icon} aria-hidden="true">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </span>
      <input
        type="text"
        className={styles.input}
        placeholder={t.searchPlaceholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={t.searchPlaceholder}
      />
      {value && (
        <button
          className={styles.clear}
          onClick={() => onChange('')}
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}
