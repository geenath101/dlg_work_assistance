import { NavLink, Outlet } from 'react-router-dom';
import styles from './Layout.module.css';

const nav = [
  { to: '/sites',      label: '📍 Sites' },
  { to: '/employees',  label: '👷 Employees' },
  { to: '/attendance', label: '✅ Attendance' },
];

export default function Layout() {
  return (
    <div className={styles.shell}>
      <aside className={styles.nav}>
        <div className={styles.brand}>Dimeo Admin</div>
        <ul>
          {nav.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  isActive ? `${styles.link} ${styles.active}` : styles.link
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </aside>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
