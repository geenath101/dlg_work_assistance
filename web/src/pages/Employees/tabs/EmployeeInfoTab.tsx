import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Button,
  Modal,
  TextInput,
  Select,
  SelectItem,
  InlineLoading,
  Tag,
} from '@carbon/react';
import { Add, UserMultiple } from '@carbon/icons-react';
import { useDetailPanel } from '../../../context/DetailPanelContext';
import {
  getEmployees,
  createEmployee,
  getSites,
  assignEmployeeToSite,
} from '../../../api/client';
import type { Employee, Site } from '../../../types';
import styles from '../Employees.module.css';

interface EmployeeDetailPanelProps {
  emp: Employee;
  onAssignClick: () => void;
}

/** Content rendered inside the detail panel when an employee row is clicked */
function EmployeeDetailPanel({ emp, onAssignClick }: EmployeeDetailPanelProps) {
  return (
    <div className={styles.empDetail}>
      <dl className={styles.detailGrid}>
        <dt>Email</dt>  <dd>{emp.email}</dd>
        <dt>Phone</dt>  <dd>{emp.phone || <Tag type="gray" size="sm">Not set</Tag>}</dd>
        <dt>ID</dt>     <dd style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{emp.id}</dd>
      </dl>
      <Button size="md" renderIcon={UserMultiple} onClick={onAssignClick}>
        Assign to Site
      </Button>
    </div>
  );
}

interface EmployeeForm {
  name: string;
  email: string;
  phone: string;
}

export default function EmployeeInfoTab() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<EmployeeForm>({ name: '', email: '', phone: '' });
  const [assignModal, setAssignModal] = useState<Employee | null>(null);
  const [assignSiteId, setAssignSiteId] = useState('');
  const [activeEmpId, setActiveEmpId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { openPanel } = useDetailPanel();

  const openAssignFor = (emp: Employee) => { setAssignModal(emp); setAssignSiteId(''); };

  const load = useCallback(async () => {
    try {
      const [emps, sts] = await Promise.all([getEmployees(), getSites()]);
      setEmployees(emps ?? []);
      setSites(sts ?? []);
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createEmployee(form);
      toast.success('Employee created');
      setShowCreate(false);
      setForm({ name: '', email: '', phone: '' });
      load();
    } catch (err) {
      console.error('Failed to create employee', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAssign = async () => {
    if (!assignSiteId || !assignModal) return;
    setSaving(true);
    try {
      await assignEmployeeToSite({ employee_id: assignModal.id, site_id: assignSiteId });
      toast.success(`${assignModal.name} assigned to site`);
      setAssignModal(null);
      setAssignSiteId('');
      load();
    } catch (err) {
      console.error('Failed to assign employee', err);
    } finally {
      setSaving(false);
    }
  };

  const handleRowClick = (emp: Employee) => {
    setActiveEmpId(emp.id);
    openPanel(
      emp.name,
      <EmployeeDetailPanel emp={emp} onAssignClick={() => openAssignFor(emp)} />,
    );
  };

  return (
    <>
      <div className={styles.employeeSetup}>
        {/* Header with title and Add button */}
        <div className={styles.employeeSetupHeader}>
          <h4 className="cds--type-heading-04">Employees</h4>
          <Button renderIcon={Add} size="md" onClick={() => setShowCreate(true)}>
            New Employee
          </Button>
        </div>

        {/* Employees table */}
        {loading ? (
          <InlineLoading description="Loading employees…" />
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.employeeTable}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={styles.emptyRow}>
                      No employees yet. Click "New Employee" to get started.
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => (
                    <tr 
                      key={emp.id} 
                      className={styles.employeeRow}
                      onClick={() => handleRowClick(emp)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>{emp.name}</td>
                      <td>{emp.email}</td>
                      <td>{emp.phone || '—'}</td>
                      <td style={{ textAlign: 'right', width: '120px' }}>
                        <Button
                          kind="ghost"
                          size="sm"
                          hasIconOnly
                          renderIcon={UserMultiple}
                          iconDescription="Assign to site"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            openAssignFor(emp);
                          }}
                        />
                      </td>
                      <td style={{ textAlign: 'right', width: '50px' }}>
                        {/* Action column for future delete button */}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create employee modal */}
      <Modal
        open={showCreate}
        onRequestClose={() => setShowCreate(false)}
        onRequestSubmit={handleCreate}
        modalHeading="New Employee"
        primaryButtonText="Save"
        secondaryButtonText="Cancel"
      >
        <div className={styles.modalBody}>
          <TextInput
            id="emp-name"
            labelText="Name"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Full name"
          />
          <TextInput
            id="emp-email"
            labelText="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="user@example.com"
          />
          <TextInput
            id="emp-phone"
            labelText="Phone (Optional)"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="+1-555-0100"
          />
        </div>
      </Modal>

      {/* Assign to site modal */}
      <Modal
        open={assignModal !== null}
        onRequestClose={() => setAssignModal(null)}
        onRequestSubmit={handleAssign}
        modalHeading={`Assign ${assignModal?.name} to Site`}
        primaryButtonText="Assign"
        secondaryButtonText="Cancel"
      >
        <div className={styles.modalBody}>
          {sites.length === 0 ? (
            <p className="cds--type-body-short-01">No sites available. Create a site first.</p>
          ) : (
            <Select
              id="assign-site"
              labelText="Select Site"
              value={assignSiteId}
              onChange={(e) => setAssignSiteId(e.target.value)}
            >
              <SelectItem value="" text="-- Choose a site --" />
              {sites.map((s) => (
                <SelectItem key={s.id} value={s.id} text={s.name} />
              ))}
            </Select>
          )}
        </div>
      </Modal>
    </>
  );
}
