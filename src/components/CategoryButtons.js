'use client';

import { useStore } from '../context/StoreContext';
import styles from './CategoryButtons.module.css';

const categories = [
  {
    key: 'farmacia',
    image: '/products/tylenol.jpg',
    bg: '#e8f4ef',
  },
  {
    key: 'comida',
    image: '/products/bustelo.jpg',
    bg: '#fdf3e3',
  },
  {
    key: 'limpieza',
    image: '/products/fabuloso.jpg',
    bg: '#f0e8f8',
  },
  {
    key: 'utilidades',
    image: '/products/pilas.jpg',
    bg: '#e8eef8',
  },
];

export default function CategoryButtons({ active, onSelect }) {
  const { t } = useStore();

  return (
    <div className={styles.container}>
      {/* Todos button — full-width chip */}
      <button
        className={`${styles.todosBtn} ${active === 'todos' ? styles.todosActive : ''}`}
        onClick={() => onSelect('todos')}
        aria-pressed={active === 'todos'}
      >
        {t.todos}
      </button>

      {/* 2×2 category card grid */}
      <div className={styles.grid}>
        {categories.map((cat) => (
          <button
            key={cat.key}
            className={`${styles.card} ${active === cat.key ? styles.cardActive : ''}`}
            style={{ '--card-bg': cat.bg }}
            onClick={() => onSelect(cat.key)}
            aria-pressed={active === cat.key}
          >
            <div className={styles.imageWrap} style={{ background: cat.bg }}>
              <img
                src={cat.image}
                alt={t[cat.key]}
                className={styles.cardImage}
              />
            </div>
            <span className={styles.cardLabel}>{t[cat.key]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
