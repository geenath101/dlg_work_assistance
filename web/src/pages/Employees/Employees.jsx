import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  getEmployees,
  createEmployee,
  getSites,
  assignEmployeeToSite,
  getAssignmentsBySite,
} from '../../api/client';
import styles from './Employees.module.css';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [assignModal, setAssignModal] = useState(null); // employee being assigned
  const [assignSiteId, setAssignSiteId] = useState('');
  const [siteAssignments, setSiteAssignments] = useState({}); // siteId -> assignments[]

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

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createEmployee(form);
      toast.success('Employee created');
      setShowCreate(false);
      setForm({ name: '', email: '', phone: '' });
      load();
    } catch {
      toast.error('Failed to create employee');
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!assignSiteId) return;
    try {
      await assignEmployeeToSite({ employee_id: assignModal.id, site_id: assignSiteId });
      toast.success(`${assignModal.name} assigned to site`);
      setAssignModal(null);
      setAssignSiteId('');
    } catch {
      toast.error('Failed to assign employee');
    }
  };

  const loadAssignmentsForSite = async (siteId) => {
    if (siteAssignments[siteId]) return; // already loaded
    try {
      const data = await getAssignmentsBySite(siteId);
      setSiteAssignments((prev) => ({ ...prev, [siteId]: data ?? [] }));
    } catch {
      toast.error('Failed to load assignments');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Employees</h2>
        <button className={styles.primaryBtn} onClick={() => setShowCreate(true)}>
          + New Employee
        </button>
      </div>

      {loading ? (
        <p>Loading…</p>
      ) : employees.length === 0 ? (
        <p className={styles.empty}>No employees yet.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id}>
                <td>{emp.name}</td>
                <td>{emp.email}</td>
                <td>{emp.phone || '—'}</td>
                <td>
                  <button
                    className={styles.actionBtn}
                    onClick={() => { setAssignModal(emp); setAssignSiteId(''); }}
                  >
                    Assign to Site
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Sites + their current assignments */}
      {sites.length > 0 && (
        <section className={styles.sitesSection}>
          <h3>Site Assignments</h3>
          {sites.map((s) => (
            <div key={s.id} className={styles.siteBlock}>
              <button
                className={styles.siteToggle}
                onClick={() => loadAssignmentsForSite(s.id)}
              >
                {s.name} <span className={styles.hint}>(click to load assigned employees)</span>
              </button>
              {siteAssignments[s.id] && (
                <ul className={styles.assignList}>
                  {siteAssignments[s.id].length === 0
                    ? <li className={styles.noAssign}>No employees assigned.</li>
                    : siteAssignments[s.id].map((a) => (
                      <li key={a.id}>{a.employee_id}</li>
                    ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Create employee modal */}
      {showCreate && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3>New Employee</h3>
            <form onSubmit={handleCreate}>
              <label>
                Name
                <input required value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </label>
              <label>
                Email
                <input required type="email" value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              </label>
              <label>
                Phone
                <input value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              </label>
              <div className={styles.modalActions}>
                <button type="submit" className={styles.primaryBtn}>Save</button>
                <button type="button" onClick={() => setShowCreate(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign to site modal */}
      {assignModal && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3>Assign {assignModal.name} to a Site</h3>
            <form onSubmit={handleAssign}>
              <label>
                Site
                <select required value={assignSiteId}
                  onChange={(e) => setAssignSiteId(e.target.value)}>
                  <option value="">— select —</option>
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </label>
              <div className={styles.modalActions}>
                <button type="submit" className={styles.primaryBtn}>Assign</button>
                <button type="button" onClick={() => setAssignModal(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
