'use client';

import { useState } from 'react';
import { getSupabase } from '../../lib/supabase';
import styles from './admin.module.css';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = getSupabase();
    if (!supabase) {
      setError('Falta configurar Supabase en este servidor.');
      setLoading(false);
      return;
    }
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (authError) setError('Correo o contraseña incorrectos.');
    setLoading(false);
  };

  return (
    <div className={styles.loginWrap}>
      <form className={styles.loginCard} onSubmit={handleSubmit}>
        <p className={styles.eyebrow}>Hispanos Pharmacy</p>
        <h1 className={styles.loginTitle}>Pedidos online</h1>
        <p className={styles.loginSub}>Solo para el personal de la farmacia.</p>

        <label className={styles.loginLabel} htmlFor="admin-email">Correo</label>
        <input
          id="admin-email"
          type="email"
          className={styles.loginInput}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          required
        />

        <label className={styles.loginLabel} htmlFor="admin-password">Contraseña</label>
        <input
          id="admin-password"
          type="password"
          className={styles.loginInput}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        {error && <p className={styles.loginError} role="alert">{error}</p>}

        <button className={styles.loginBtn} type="submit" disabled={loading}>
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
