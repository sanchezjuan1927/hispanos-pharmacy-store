'use client';

import { useStore } from '../context/StoreContext';
import styles from './SearchBar.module.css';

export default function SearchBar({ value, onChange }) {
  const { t } = useStore();

  return (
    <div className={styles.container}>
      <span className={styles.icon}>🔍</span>
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
