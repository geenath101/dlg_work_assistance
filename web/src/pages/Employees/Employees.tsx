import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Button,
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableContainer,
  TableToolbar,
  TableToolbarContent,
  Modal,
  TextInput,
  Select,
  SelectItem,
  InlineLoading,
  Accordion,
  AccordionItem,
  Tag,
} from '@carbon/react';
import { Add, UserMultiple } from '@carbon/icons-react';
import { useDetailPanel } from '../../context/DetailPanelContext';
import {
  getEmployees,
  createEmployee,
  getSites,
  assignEmployeeToSite,
  getAssignmentsBySite,
} from '../../api/client';
import type { Employee, Site, SiteAssignment } from '../../types';
import styles from './Employees.module.css';

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
      <Button size="sm" renderIcon={UserMultiple} onClick={onAssignClick}>
        Assign to Site
      </Button>
    </div>
  );
}

interface EmployeeTableRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  actions: Employee;
}

const TABLE_HEADERS = [
  { key: 'name',    header: 'Name' },
  { key: 'email',   header: 'Email' },
  { key: 'phone',   header: 'Phone' },
  { key: 'actions', header: '' },
];

interface EmployeeForm {
  name: string;
  email: string;
  phone: string;
}

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<EmployeeForm>({ name: '', email: '', phone: '' });
  const [assignModal, setAssignModal] = useState<Employee | null>(null);
  const [assignSiteId, setAssignSiteId] = useState('');
  const [siteAssignments, setSiteAssignments] = useState<Record<string, SiteAssignment[]>>({});
  const [activeEmpId, setActiveEmpId] = useState<string | null>(null);

  const { openPanel } = useDetailPanel();

  const openAssignFor = (emp: Employee) => { setAssignModal(emp); setAssignSiteId(''); };

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

  const handleCreate = async (e: React.FormEvent) => {
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

  const handleAssign = async () => {
    if (!assignSiteId || !assignModal) return;
    try {
      await assignEmployeeToSite({ employee_id: assignModal.id, site_id: assignSiteId });
      toast.success(`${assignModal.name} assigned to site`);
      setAssignModal(null);
      setAssignSiteId('');
    } catch {
      toast.error('Failed to assign employee');
    }
  };

  const loadAssignmentsForSite = async (siteId: string) => {
    if (siteAssignments[siteId]) return;
    try {
      const data = await getAssignmentsBySite(siteId);
      setSiteAssignments((prev) => ({ ...prev, [siteId]: data ?? [] }));
    } catch {
      toast.error('Failed to load assignments');
    }
  };

  const handleRowClick = (emp: Employee) => {
    setActiveEmpId(emp.id);
    openPanel(
      emp.name,
      <EmployeeDetailPanel emp={emp} onAssignClick={() => openAssignFor(emp)} />,
    );
  };

  const rows: EmployeeTableRow[] = employees.map((emp) => ({
    id: emp.id,
    name: emp.name,
    email: emp.email,
    phone: emp.phone || '—',
    actions: emp,
  }));

  return (
    <div className={styles.container}>
      {loading ? (
        <InlineLoading description="Loading employees…" />
      ) : (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <DataTable rows={rows as any} headers={TABLE_HEADERS} isSortable>
          {({ rows: tableRows, headers, getTableProps, getHeaderProps, getRowProps }: any) => (
            <TableContainer title="Employees" description="Manage workforce and site assignments">
              <TableToolbar>
                <TableToolbarContent>
                  <Button renderIcon={Add} onClick={() => setShowCreate(true)}>
                    New Employee
                  </Button>
                </TableToolbarContent>
              </TableToolbar>
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    {headers.map((header: any) => (
                      <TableHeader {...getHeaderProps({ header })} key={header.key}>
                        {header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tableRows.map((row: any) => {
                    const emp = employees.find((e) => e.id === row.id);
                    return (
                      <TableRow
                        {...getRowProps({ row })}
                        key={row.id}
                        onClick={() => emp && handleRowClick(emp)}
                        className={activeEmpId === row.id ? styles.rowActive : styles.rowClickable}
                      >
                        {row.cells.map((cell: any) => (
                          <TableCell key={cell.id}>
                            {cell.info.header === 'actions' ? (
                              <Button
                                kind="ghost"
                                size="sm"
                                renderIcon={UserMultiple}
                                onClick={(e: React.MouseEvent) => {
                                  e.stopPropagation();
                                  setAssignModal(cell.value as Employee);
                                  setAssignSiteId('');
                                }}
                              >
                                Assign to Site
                              </Button>
                            ) : (
                              cell.value
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DataTable>
      )}

      {/* Site assignments accordion */}
      {sites.length > 0 && (
        <div className={styles.assignmentsSection}>
          <h5 className="cds--type-heading-03" style={{ marginBottom: '0.75rem' }}>
            Site Assignments
          </h5>
          <Accordion>
            {sites.map((s) => (
              <AccordionItem
                key={s.id}
                title={s.name}
                onHeadingClick={() => loadAssignmentsForSite(s.id)}
              >
                {siteAssignments[s.id] ? (
                  siteAssignments[s.id].length === 0 ? (
                    <p className="cds--type-body-short-01" style={{ color: 'var(--cds-text-secondary)' }}>
                      No employees assigned.
                    </p>
                  ) : (
                    <ul className={styles.assignList}>
                      {siteAssignments[s.id].map((a) => (
                        <li key={a.id} className="cds--type-body-short-01">{a.employee_id}</li>
                      ))}
                    </ul>
                  )
                ) : (
                  <InlineLoading description="Loading…" />
                )}
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}

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
          />
          <TextInput
            id="emp-email"
            labelText="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          <TextInput
            id="emp-phone"
            labelText="Phone"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
        </div>
      </Modal>

      {/* Assign to site modal */}
      <Modal
        open={!!assignModal}
        onRequestClose={() => setAssignModal(null)}
        onRequestSubmit={handleAssign}
        modalHeading={assignModal ? `Assign ${assignModal.name} to a Site` : ''}
        primaryButtonText="Assign"
        secondaryButtonText="Cancel"
      >
        <div className={styles.modalBody}>
          <Select
            id="assign-site"
            labelText="Site"
            value={assignSiteId}
            onChange={(e) => setAssignSiteId(e.target.value)}
          >
            <SelectItem value="" text="— select a site —" />
            {sites.map((s) => (
              <SelectItem key={s.id} value={s.id} text={s.name} />
            ))}
          </Select>
        </div>
      </Modal>
    </div>
  );
}
