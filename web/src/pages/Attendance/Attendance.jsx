import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getEmployees, getSites, signIn, signOut } from '../../api/client';
import styles from './Attendance.module.css';

export default function Attendance() {
  const [employees, setEmployees] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('sign-in'); // 'sign-in' | 'sign-out'

  // Sign-in form
  const [signInForm, setSignInForm] = useState({
    employee_id: '',
    site_id: '',
    latitude: '',
    longitude: '',
  });

  // Sign-out form
  const [signOutForm, setSignOutForm] = useState({
    attendance_id: '',
    latitude: '',
    longitude: '',
  });

  const [lastResult, setLastResult] = useState(null);
  const [locating, setLocating] = useState(false);

  const load = useCallback(async () => {
    try {
      const [emps, sts] = await Promise.all([getEmployees(), getSites()]);
      setEmployees(emps ?? []);
      setSites(sts ?? []);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const useCurrentLocation = (onSuccess) => {
    setLocating(true);
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported by this browser');
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onSuccess(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
      },
      () => {
        toast.error('Could not get location. Please enter manually.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const result = await signIn({
        employee_id: signInForm.employee_id,
        site_id: signInForm.site_id,
        latitude: parseFloat(signInForm.latitude),
        longitude: parseFloat(signInForm.longitude),
      });
      toast.success('Signed in successfully');
      setLastResult(result);
      setSignInForm({ employee_id: '', site_id: '', latitude: '', longitude: '' });
    } catch (err) {
      const msg = err.response?.data?.error ?? 'Sign-in failed';
      toast.error(msg);
    }
  };

  const handleSignOut = async (e) => {
    e.preventDefault();
    try {
      const result = await signOut({
        attendance_id: signOutForm.attendance_id,
        latitude: parseFloat(signOutForm.latitude),
        longitude: parseFloat(signOutForm.longitude),
      });
      toast.success('Signed out successfully');
      setLastResult(result);
      setSignOutForm({ attendance_id: '', latitude: '', longitude: '' });
    } catch (err) {
      const msg = err.response?.data?.error ?? 'Sign-out failed';
      toast.error(msg);
    }
  };

  if (loading) return <p style={{ padding: '1.5rem' }}>Loading…</p>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Attendance</h2>
        <div className={styles.tabs}>
          <button
            className={mode === 'sign-in' ? styles.tabActive : styles.tab}
            onClick={() => setMode('sign-in')}
          >
            Sign In
          </button>
          <button
            className={mode === 'sign-out' ? styles.tabActive : styles.tab}
            onClick={() => setMode('sign-out')}
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className={styles.formCard}>
        {mode === 'sign-in' ? (
          <form onSubmit={handleSignIn}>
            <label>
              Employee
              <select required value={signInForm.employee_id}
                onChange={(e) => setSignInForm((f) => ({ ...f, employee_id: e.target.value }))}>
                <option value="">— select —</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </label>
            <label>
              Site
              <select required value={signInForm.site_id}
                onChange={(e) => setSignInForm((f) => ({ ...f, site_id: e.target.value }))}>
                <option value="">— select —</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </label>
            <div className={styles.locationRow}>
              <label>
                Latitude
                <input required type="number" step="any"
                  value={signInForm.latitude}
                  onChange={(e) => setSignInForm((f) => ({ ...f, latitude: e.target.value }))}
                  placeholder="e.g. 6.9271" />
              </label>
              <label>
                Longitude
                <input required type="number" step="any"
                  value={signInForm.longitude}
                  onChange={(e) => setSignInForm((f) => ({ ...f, longitude: e.target.value }))}
                  placeholder="e.g. 79.8612" />
              </label>
            </div>
            <button
              type="button"
              className={styles.locateBtn}
              onClick={() => useCurrentLocation((lat, lon) =>
                setSignInForm((f) => ({ ...f, latitude: String(lat), longitude: String(lon) }))
              )}
              disabled={locating}
            >
              {locating ? 'Locating…' : '📍 Use My Location'}
            </button>
            <button type="submit" className={styles.submitBtn}>Sign In</button>
          </form>
        ) : (
          <form onSubmit={handleSignOut}>
            <label>
              Attendance ID
              <input required value={signOutForm.attendance_id}
                onChange={(e) => setSignOutForm((f) => ({ ...f, attendance_id: e.target.value }))}
                placeholder="Paste attendance record ID" />
            </label>
            <div className={styles.locationRow}>
              <label>
                Latitude
                <input required type="number" step="any"
                  value={signOutForm.latitude}
                  onChange={(e) => setSignOutForm((f) => ({ ...f, latitude: e.target.value }))}
                  placeholder="e.g. 6.9271" />
              </label>
              <label>
                Longitude
                <input required type="number" step="any"
                  value={signOutForm.longitude}
                  onChange={(e) => setSignOutForm((f) => ({ ...f, longitude: e.target.value }))}
                  placeholder="e.g. 79.8612" />
              </label>
            </div>
            <button
              type="button"
              className={styles.locateBtn}
              onClick={() => useCurrentLocation((lat, lon) =>
                setSignOutForm((f) => ({ ...f, latitude: String(lat), longitude: String(lon) }))
              )}
              disabled={locating}
            >
              {locating ? 'Locating…' : '📍 Use My Location'}
            </button>
            <button type="submit" className={styles.submitBtn}>Sign Out</button>
          </form>
        )}
      </div>

      {lastResult && (
        <div className={styles.result}>
          <h4>Last Record</h4>
          <pre>{JSON.stringify(lastResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
