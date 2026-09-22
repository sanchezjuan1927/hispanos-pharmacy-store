'use client';

import { useEffect, useState } from 'react';
import { getSupabase } from '../../lib/supabase';
import AdminLogin from '../../components/admin/AdminLogin';
import OrdersDashboard from '../../components/admin/OrdersDashboard';
import styles from '../../components/admin/admin.module.css';

/**
 * Gate for the orders dashboard. The real protection is the database's
 * row-level security (only rows in pharmacy_staff can read orders); this page
 * just picks which screen to show.
 */
export default function AdminPage() {
  const [session, setSession] = useState(undefined); // undefined = still checking

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setSession(null);
      return undefined;
    }
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return <div className={styles.page} aria-busy="true" />;
  }

  return (
    <div className={styles.page}>
      {session ? <OrdersDashboard session={session} /> : <AdminLogin />}
    </div>
  );
}
