'use client';

import { useStore } from '../context/StoreContext';
import styles from './DeliveryBanner.module.css';

export default function DeliveryBanner() {
  const { t } = useStore();

  return (
    <div className={styles.banner}>
      <span aria-hidden="true">🚚</span>
      <span>{t.deliveryBanner}</span>
    </div>
  );
}
