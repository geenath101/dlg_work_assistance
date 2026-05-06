import { useState } from 'react';
import EmployeeInfoTab from './tabs/EmployeeInfoTab';
import CalculatePaymentsTab from './tabs/CalculatePaymentsTab';
import ViewAttendanceTab from './tabs/ViewAttendanceTab';
import styles from './Employees.module.css';

// ── Types ────────────────────────────────────────────────────────────────────

type TabId = 'employeeInfo' | 'calculatePayments' | 'viewAttendance';

const TABS: { id: TabId; label: string }[] = [
  { id: 'employeeInfo',       label: 'Employee Info' },
  { id: 'calculatePayments',  label: 'Calculate Payments' },
  { id: 'viewAttendance',     label: 'View Attendance' },
];

// ── Main component ────────────────────────────────────────────────────────

export default function Employees() {
  const [activeTab, setActiveTab] = useState<TabId>('employeeInfo');
  return (
    <div className={styles.container}>
      {/* ── Horizontal sub-tabs ── */}
      <div className={styles.tabBar}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div className={styles.tabContent}>
        {activeTab === 'employeeInfo'       && <EmployeeInfoTab />}
        {activeTab === 'calculatePayments'  && <CalculatePaymentsTab />}
        {activeTab === 'viewAttendance'     && <ViewAttendanceTab />}
      </div>
    </div>
  );
}
