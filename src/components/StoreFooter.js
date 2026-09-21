'use client';

import { useStore } from '../context/StoreContext';
import styles from './StoreFooter.module.css';

const ADDRESS = '80-11 37th Ave, Jackson Heights, NY 11372';
const PHONE_DISPLAY = '(718) 255-6129';
const PHONE_HREF = 'tel:+17182556129';
const MAPS_HREF = 'https://maps.google.com/?q=80-11+37th+Ave,+Jackson+Heights,+NY+11372';

export default function StoreFooter() {
  const { t } = useStore();

  return (
    <footer className={styles.footer}>
      <img src="/logo-light.svg" alt="Hispanos Pharmacy" className={styles.logo} />
      <p className={styles.tagline}>{t.storeTagline}</p>

      <div className={styles.links}>
        <a className={styles.link} href={MAPS_HREF} target="_blank" rel="noopener noreferrer">
          <span aria-hidden="true">📍</span> {ADDRESS}
        </a>
        <a className={styles.link} href={PHONE_HREF}>
          <span aria-hidden="true">📞</span> {PHONE_DISPLAY}
        </a>
      </div>
    </footer>
  );
}
