import { useState } from 'react';
import LocationSetupTab from './tabs/LocationSetupTab';
import EmployeeAssignmentTab from './tabs/EmployeeAssignmentTab';
import SupplyManagementTab from './tabs/SupplyManagementTab';
import styles from './Sites.module.css';

// ── Types ────────────────────────────────────────────────────────────────────

type TabId = 'locationSetup' | 'employeeAssignment' | 'supplyManagement';

const TABS: { id: TabId; label: string }[] = [
  { id: 'locationSetup',      label: 'Location Setup' },
  { id: 'employeeAssignment', label: 'Employee Assignment' },
  { id: 'supplyManagement',   label: 'Supply Management' },
];

// ── Main component ────────────────────────────────────────────────────────────

export default function Sites() {
  const [activeTab, setActiveTab] = useState<TabId>('locationSetup');

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
        {activeTab === 'locationSetup'      && <LocationSetupTab />}
        {activeTab === 'employeeAssignment' && <EmployeeAssignmentTab />}
        {activeTab === 'supplyManagement'   && <SupplyManagementTab />}
      </div>
    </div>
  );
}
