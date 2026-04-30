import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Theme,
  Header,
  HeaderName,
  HeaderMenuButton,
  SkipToContent,
  SideNav,
  SideNavItems,
  SideNavLink,
  Content,
  Button,
} from '@carbon/react';
import { Location, UserMultiple, CheckmarkOutline, Close } from '@carbon/icons-react';
import { type CarbonIconType } from '@carbon/icons-react';
import { DetailPanelProvider, useDetailPanel } from '../../context/DetailPanelContext';
import styles from './Layout.module.css';

interface NavItem {
  to: string;
  label: string;
  Icon: CarbonIconType;
}

const navItems: NavItem[] = [
  { to: '/sites',      label: 'Sites',      Icon: Location },
  { to: '/employees',  label: 'Employees',  Icon: UserMultiple },
  { to: '/attendance', label: 'Attendance', Icon: CheckmarkOutline },
];

/** Inner shell — rendered inside the DetailPanelProvider so it can use the context */
function LayoutShell() {
  const [isSideNavExpanded, setIsSideNavExpanded] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { panel, closePanel } = useDetailPanel();

  // Close the detail panel whenever the user navigates to a different page
  useEffect(() => {
    closePanel();
  }, [location.pathname, closePanel]);

  return (
    <>
      <Header aria-label="Dimeo Work Assistance">
        <SkipToContent />
        <HeaderMenuButton
          aria-label={isSideNavExpanded ? 'Close menu' : 'Open menu'}
          onClick={() => setIsSideNavExpanded((v) => !v)}
          isActive={isSideNavExpanded}
        />
        <HeaderName prefix="Dimeo">Admin</HeaderName>
      </Header>

      <SideNav
        aria-label="Side navigation"
        expanded={isSideNavExpanded}
        isPersistent
      >
        <SideNavItems>
          {navItems.map(({ to, label, Icon }) => (
            <SideNavLink
              key={to}
              renderIcon={Icon}
              isActive={location.pathname.startsWith(to)}
              href={to}
              onClick={(e: React.MouseEvent) => { e.preventDefault(); navigate(to); }}
            >
              {label}
            </SideNavLink>
          ))}
        </SideNavItems>
      </SideNav>

      <Content>
        {/* contentInner is the flex-column host for pageArea + detailPanel */}
        <div className={styles.contentInner}>
          <div className={styles.pageArea}>
            <Outlet />
          </div>

          {/* Bottom detail panel — only renders when an item is selected */}
          {panel && (
            <div className={styles.detailPanel}>
              <div className={styles.detailPanelHeader}>
                <h5 className="cds--type-heading-03">{panel.title}</h5>
                <Button
                  kind="ghost"
                  size="sm"
                  hasIconOnly
                  renderIcon={Close}
                  iconDescription="Close panel"
                  onClick={closePanel}
                />
              </div>
              <div className={styles.detailPanelBody}>
                {panel.content}
              </div>
            </div>
          )}
        </div>
      </Content>
    </>
  );
}

export default function Layout() {
  return (
    <Theme theme="g10">
      <DetailPanelProvider>
        <LayoutShell />
      </DetailPanelProvider>
    </Theme>
  );
}
