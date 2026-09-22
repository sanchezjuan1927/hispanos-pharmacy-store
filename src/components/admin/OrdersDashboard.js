'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getSupabase } from '../../lib/supabase';
import styles from './admin.module.css';

const TABLE = 'Hisp Pharmacy Order taker';
const POLL_MS = 15_000;
const TZ = 'America/New_York';

// Order lifecycle, in the order the groups are shown.
const STATUSES = [
  { key: 'pending', label: 'Nuevo', group: 'Nuevos', next: 'preparing', action: 'Empezar a preparar' },
  { key: 'preparing', label: 'Preparando', group: 'Preparando', next: 'delivering', action: 'Salió a entregar' },
  { key: 'delivering', label: 'En camino', group: 'En camino', next: 'delivered', action: 'Marcar entregado' },
  { key: 'delivered', label: 'Entregado', group: 'Entregados' },
  { key: 'cancelled', label: 'Cancelado', group: 'Cancelados' },
];
const STATUS = Object.fromEntries(STATUSES.map((s) => [s.key, s]));
const OPEN = new Set(['pending', 'preparing', 'delivering']);

// ── Formatting ───────────────────────────────────────────────────────────

const money = (n) => `$${Number(n || 0).toFixed(2)}`;

const dayKey = (d) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);

const clock = (d) =>
  new Intl.DateTimeFormat('es-US', { timeZone: TZ, hour: 'numeric', minute: '2-digit' }).format(d);

const shortDate = (d) =>
  new Intl.DateTimeFormat('es-US', { timeZone: TZ, month: 'short', day: 'numeric' }).format(d);

function ago(iso, now) {
  const mins = Math.floor((now - new Date(iso).getTime()) / 60_000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return days === 1 ? 'ayer' : `hace ${days} días`;
}

function when(iso, now) {
  const d = new Date(iso);
  return dayKey(d) === dayKey(new Date(now)) ? clock(d) : `${shortDate(d)} · ${clock(d)}`;
}

const itemCount = (order) => (order.items || []).reduce((sum, i) => sum + (Number(i.qty) || 0), 0);

const itemsSummary = (order) =>
  (order.items || []).map((i) => `${i.name} ×${i.qty}`).join(', ');

// Older orders stored raw digits; show every number the same way.
const prettyPhone = (phone) => {
  const d = phone.replace(/\D/g, '').slice(-10);
  return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : phone;
};

const telHref = (phone) => `tel:+1${phone.replace(/\D/g, '').slice(-10)}`;

const mapsHref = (address) => `https://maps.google.com/?q=${encodeURIComponent(address)}`;

// Short tone when a new order arrives. Browsers only allow audio after the
// page has been interacted with (the login click counts); failures are fine.
function chime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [880, 1320].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + i * 0.18 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.18 + 0.25);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.18);
      osc.stop(ctx.currentTime + i * 0.18 + 0.3);
    });
  } catch {
    // no audio available
  }
}

// ── Pieces ───────────────────────────────────────────────────────────────

function CopyButton({ value, label }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={styles.iconBtn}
      title={label}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard?.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        });
      }}
    >
      {copied ? '✓' : (
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="9" width="12" height="12" rx="2" />
          <path d="M5 15V5a2 2 0 0 1 2-2h10" />
        </svg>
      )}
    </button>
  );
}

function StatusSelect({ order, onChange }) {
  return (
    <select
      className={`${styles.statusSelect} ${styles['status_' + order.status]}`}
      value={order.status}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => onChange(order.id, e.target.value)}
      aria-label={`Estado del pedido #${order.id}`}
    >
      {STATUSES.map((s) => (
        <option key={s.key} value={s.key}>{s.label}</option>
      ))}
    </select>
  );
}

function OrderRow({ order, now, fresh, onOpen, onStatus }) {
  const count = itemCount(order);
  return (
    <div
      className={`${styles.row} ${fresh ? styles.rowFresh : ''}`}
      role="button"
      tabIndex={0}
      onClick={() => onOpen(order.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onOpen(order.id);
      }}
    >
      <div className={styles.cellCustomer}>
        <span className={styles.primary}>{order.full_name}</span>
        <span className={styles.meta}>
          #{order.id} · {order.lang === 'en' ? 'English' : 'Español'}
          {fresh && <span className={styles.newTag}>Nuevo</span>}
        </span>
      </div>

      <div className={styles.cellPhone}>
        <span className={styles.mobileLabel}>Teléfono</span>
        <span className={styles.phoneLine}>
          <a href={telHref(order.phone)} onClick={(e) => e.stopPropagation()} className={styles.link}>
            {prettyPhone(order.phone)}
          </a>
          <CopyButton value={order.phone} label="Copiar teléfono" />
        </span>
      </div>

      <div className={styles.cellAddress}>
        <span className={styles.mobileLabel}>Dirección</span>
        <span className={styles.clamp2}>{order.address}</span>
        {order.notes && <span className={styles.note} title={order.notes}><span className={styles.emoji} aria-hidden="true">📝</span>{order.notes}</span>}
      </div>

      <div className={styles.cellItems}>
        <span className={styles.mobileLabel}>Productos</span>
        <span className={styles.clamp2}>{itemsSummary(order)}</span>
        <span className={styles.meta}>{count} {count === 1 ? 'artículo' : 'artículos'}</span>
      </div>

      <div className={styles.cellPay}>
        <span className={styles.mobileLabel}>Pago</span>
        <span className={styles.payTag}>{order.payment_method === 'card' ? 'Tarjeta' : 'Efectivo'}</span>
      </div>

      <div className={styles.cellTotal}>
        <span className={styles.mobileLabel}>Total</span>
        <span className={styles.total}>{money(order.total)}</span>
      </div>

      <div className={styles.cellStatus}>
        <StatusSelect order={order} onChange={onStatus} />
      </div>

      <div className={styles.cellTime}>
        <span className={styles.timeRel}>{ago(order.created_at, now)}</span>
        <span className={styles.meta}>{when(order.created_at, now)}</span>
      </div>
    </div>
  );
}

function OrderDetail({ order, now, onClose, onStatus }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const status = STATUS[order.status] || STATUS.pending;

  return (
    <div className={styles.drawerOverlay} onClick={onClose}>
      <aside
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-label={`Pedido #${order.id}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.drawerHead}>
          <div>
            <p className={styles.eyebrow}>Pedido #{order.id}</p>
            <h2 className={styles.drawerTitle}>{order.full_name}</h2>
            <p className={styles.meta}>
              {when(order.created_at, now)} · {ago(order.created_at, now)}
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">✕</button>
        </header>

        <div className={styles.drawerBody}>
          <div className={styles.drawerStatus}>
            <StatusSelect order={order} onChange={onStatus} />
            {status.next && (
              <button className={styles.nextBtn} onClick={() => onStatus(order.id, status.next)}>
                {status.action} →
              </button>
            )}
          </div>

          <section className={styles.block}>
            <p className={styles.blockLabel}>Contacto</p>
            <div className={styles.contactActions}>
              <a className={styles.actionBtn} href={telHref(order.phone)}><span aria-hidden="true">📞</span>Llamar {prettyPhone(order.phone)}</a>
              <a className={styles.actionBtn} href={mapsHref(order.address)} target="_blank" rel="noopener noreferrer">
                <span aria-hidden="true">📍</span>Abrir en mapa
              </a>
            </div>
            <p className={styles.blockText}>{order.address}</p>
            {order.notes && (
              <p className={styles.blockNote}>
                <span className={styles.emoji} aria-hidden="true">📝</span>
                {order.notes}
              </p>
            )}
          </section>

          <section className={styles.block}>
            <p className={styles.blockLabel}>
              Productos · {itemCount(order)}
            </p>
            <ul className={styles.itemList}>
              {(order.items || []).map((item, i) => (
                <li key={i}>
                  <span className={styles.itemQty}>{item.qty}×</span>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.itemPrice}>{money(item.price * item.qty)}</span>
                </li>
              ))}
            </ul>
            <div className={styles.itemTotal}>
              <span>Total</span>
              <span>{money(order.total)}</span>
            </div>
          </section>

          <section className={styles.block}>
            <p className={styles.blockLabel}>Pago al entregar</p>
            <p className={styles.blockText}>
              <span className={styles.emoji} aria-hidden="true">{order.payment_method === 'card' ? '💳' : '💵'}</span>
              {order.payment_method === 'card' ? 'Tarjeta — lleva la terminal' : 'Efectivo — lleva cambio'}
            </p>
          </section>
        </div>
      </aside>
    </div>
  );
}

// ── Dashboard ────────────────────────────────────────────────────────────

export default function OrdersDashboard({ session }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [access, setAccess] = useState('checking'); // checking | ok | denied
  const [loadError, setLoadError] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [now, setNow] = useState(() => Date.now());
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState(null);
  const [collapsed, setCollapsed] = useState({ delivered: true, cancelled: true });
  const [fresh, setFresh] = useState(() => new Set());
  const known = useRef(null);

  const supabase = getSupabase();

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) {
      setLoadError(true);
      setLoading(false);
      return;
    }
    setLoadError(false);

    // Anything we haven't seen since the first load is a new order
    if (known.current) {
      const arrivals = data.filter((o) => !known.current.has(o.id)).map((o) => o.id);
      if (arrivals.length) {
        chime();
        setFresh((prev) => new Set([...prev, ...arrivals]));
      }
    }
    known.current = new Set(data.map((o) => o.id));

    setOrders(data);
    setLastSync(Date.now());
    setLoading(false);
  }, [supabase]);

  // Confirm this account is on the staff list before showing anything
  useEffect(() => {
    let cancelled = false;
    supabase
      .from('pharmacy_staff')
      .select('user_id')
      .eq('user_id', session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setAccess(data ? 'ok' : 'denied');
      });
    return () => {
      cancelled = true;
    };
  }, [supabase, session.user.id]);

  useEffect(() => {
    if (access !== 'ok') return undefined;
    load();
    const poll = setInterval(load, POLL_MS);
    const tick = setInterval(() => setNow(Date.now()), 30_000);
    return () => {
      clearInterval(poll);
      clearInterval(tick);
    };
  }, [access, load]);

  // Tab title shows how many orders still need attention
  const openCount = orders.filter((o) => OPEN.has(o.status)).length;
  useEffect(() => {
    const pending = orders.filter((o) => o.status === 'pending').length;
    document.title = pending ? `(${pending}) Pedidos nuevos · Hispanos` : 'Pedidos · Hispanos Pharmacy';
  }, [orders]);

  const updateStatus = useCallback(
    async (id, status) => {
      const previous = orders;
      setOrders((list) => list.map((o) => (o.id === id ? { ...o, status } : o)));
      setFresh((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      const { error } = await supabase
        .from(TABLE)
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) {
        setOrders(previous);
        window.alert('No se pudo cambiar el estado. Revisa la conexión e intenta otra vez.');
      }
    },
    [orders, supabase]
  );

  const signOut = () => supabase.auth.signOut();

  const stats = useMemo(() => {
    const today = dayKey(new Date(now));
    const todays = orders.filter((o) => dayKey(new Date(o.created_at)) === today);
    return {
      today: todays.length,
      open: openCount,
      salesToday: todays.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + Number(o.total), 0),
      all: orders.length,
    };
  }, [orders, now, openCount]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return orders;
    const qDigits = q.replace(/\D/g, '');
    return orders.filter(
      (o) =>
        o.full_name.toLowerCase().includes(q) ||
        o.address.toLowerCase().includes(q) ||
        String(o.id) === q.replace('#', '') ||
        (qDigits.length >= 3 && o.phone.replace(/\D/g, '').includes(qDigits))
    );
  }, [orders, query]);

  const selected = orders.find((o) => o.id === openId) || null;

  if (access === 'denied') {
    return (
      <div className={styles.loginWrap}>
        <div className={styles.loginCard}>
          <p className={styles.eyebrow}>Hispanos Pharmacy</p>
          <h1 className={styles.loginTitle}>Sin acceso</h1>
          <p className={styles.loginSub}>
            La cuenta {session.user.email} no está en la lista del personal de la farmacia.
          </p>
          <button className={styles.loginBtn} onClick={signOut}>Salir</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      <header className={styles.top}>
        <div>
          <p className={styles.eyebrow}>Hispanos Pharmacy</p>
          <h1 className={styles.title}>Pedidos online</h1>
        </div>
        <div className={styles.topActions}>
          <span className={`${styles.live} ${loadError ? styles.liveError : ''}`}>
            <span className={styles.liveDot} />
            {loadError
              ? 'Sin conexión'
              : lastSync
                ? `En vivo · ${clock(new Date(lastSync))}`
                : 'Cargando…'}
          </span>
          <button className={styles.ghostBtn} onClick={load}>↻ Actualizar</button>
          <button className={styles.ghostBtn} onClick={signOut}>Salir</button>
        </div>
      </header>

      <section className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Pedidos hoy</span>
          <span className={styles.statValue}>{stats.today}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Por atender</span>
          <span className={`${styles.statValue} ${stats.open ? styles.statAccent : ''}`}>{stats.open}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Ventas hoy</span>
          <span className={styles.statValue}>{money(stats.salesToday)}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Total pedidos</span>
          <span className={styles.statValue}>{stats.all}</span>
        </div>
      </section>

      <div className={styles.toolbar}>
        <input
          className={styles.search}
          type="search"
          placeholder="Buscar por nombre, teléfono, dirección o #pedido"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar pedidos"
        />
      </div>

      <div className={styles.table}>
        <div className={styles.headRow} aria-hidden="true">
          <span>Cliente</span>
          <span>Teléfono</span>
          <span>Dirección</span>
          <span>Productos</span>
          <span>Pago</span>
          <span>Total</span>
          <span>Estado</span>
          <span>Recibido</span>
        </div>

        {loading && <p className={styles.empty}>Cargando pedidos…</p>}

        {!loading && orders.length === 0 && (
          <p className={styles.empty}>Todavía no hay pedidos. Aparecerán aquí automáticamente.</p>
        )}

        {!loading && orders.length > 0 && visible.length === 0 && (
          <p className={styles.empty}>Ningún pedido coincide con “{query}”.</p>
        )}

        {!loading &&
          STATUSES.map((s) => {
            const group = visible.filter((o) => o.status === s.key);
            if (group.length === 0) return null;
            const isCollapsed = collapsed[s.key] && !query;
            return (
              <section key={s.key} className={styles.group}>
                <button
                  className={`${styles.groupHead} ${styles['group_' + s.key]}`}
                  onClick={() => setCollapsed((c) => ({ ...c, [s.key]: !c[s.key] }))}
                  aria-expanded={!isCollapsed}
                >
                  <span className={styles.caret}>{isCollapsed ? '▶' : '▼'}</span>
                  {s.group}
                  <span className={styles.groupCount}>{group.length}</span>
                </button>
                {!isCollapsed &&
                  group.map((order) => (
                    <OrderRow
                      key={order.id}
                      order={order}
                      now={now}
                      fresh={fresh.has(order.id)}
                      onOpen={setOpenId}
                      onStatus={updateStatus}
                    />
                  ))}
              </section>
            );
          })}
      </div>

      {selected && (
        <OrderDetail
          order={selected}
          now={now}
          onClose={() => setOpenId(null)}
          onStatus={updateStatus}
        />
      )}
    </div>
  );
}
