import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  Tile,
  Button,
  TextInput,
  Select,
  SelectItem,
  InlineLoading,
  FormGroup,
  Stack,
} from '@carbon/react';
import { Location, Login, Logout } from '@carbon/icons-react';
import { useDetailPanel } from '../../../context/DetailPanelContext';
import { getEmployees, getSites, signIn, signOut } from '../../../api/client';
import type { Employee, Site, AttendanceLog } from '../../../types';
import styles from './Attendance.module.css';

/** Content shown in the bottom detail panel after a successful sign-in/out */
function AttendanceResult({ data }: { data: AttendanceLog }) {
  return (
    <pre className={styles.resultPre}>{JSON.stringify(data, null, 2)}</pre>
  );
}

interface SignInForm {
  employee_id: string;
  site_id: string;
  latitude: string;
  longitude: string;
}

interface SignOutForm {
  attendance_id: string;
  latitude: string;
  longitude: string;
}

export default function Attendance() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  const [signInForm, setSignInForm] = useState<SignInForm>({
    employee_id: '',
    site_id: '',
    latitude: '',
    longitude: '',
  });

  const [signOutForm, setSignOutForm] = useState<SignOutForm>({
    attendance_id: '',
    latitude: '',
    longitude: '',
  });

  const [locating, setLocating] = useState(false);

  const { openPanel } = useDetailPanel();

  const load = useCallback(async () => {
    try {
      const [emps, sts] = await Promise.all([getEmployees(), getSites()]);
      setEmployees(emps ?? []);
      setSites(sts ?? []);
    } catch (err) {
      // toast.error('Failed to load data');
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const useCurrentLocation = (onSuccess: (lat: number, lon: number) => void) => {
    setLocating(true);
    if (!navigator.geolocation) {
      // toast.error('Geolocation not supported by this browser');
      console.error('Geolocation not supported by this browser');
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onSuccess(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
      },
      (err) => {
        // toast.error('Could not get location. Please enter manually.');
        console.error('Could not get location. Please enter manually.', err);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await signIn({
        employee_id: signInForm.employee_id,
        site_id: signInForm.site_id,
        latitude: parseFloat(signInForm.latitude),
        longitude: parseFloat(signInForm.longitude),
      });
      toast.success('Signed in successfully');
      openPanel('Attendance Record', <AttendanceResult data={result} />);
      setSignInForm({ employee_id: '', site_id: '', latitude: '', longitude: '' });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Sign-in failed';
      // toast.error(msg);
      console.error('Sign-in error:', msg, err);
    }
  };

  const handleSignOut = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await signOut({
        attendance_id: signOutForm.attendance_id,
        latitude: parseFloat(signOutForm.latitude),
        longitude: parseFloat(signOutForm.longitude),
      });
      toast.success('Signed out successfully');
      openPanel('Attendance Record', <AttendanceResult data={result} />);
      setSignOutForm({ attendance_id: '', latitude: '', longitude: '' });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Sign-out failed';
      // toast.error(msg);
      console.error('Sign-out error:', msg, err);
    }
  };

  if (loading) return <InlineLoading description="Loading…" style={{ padding: '1.5rem' }} />;

  return (
    <div className={styles.container}>
      <h4 className="cds--type-heading-04" style={{ marginBottom: '1.5rem' }}>Attendance</h4>

      <Tabs>
        <TabList aria-label="Attendance actions">
          <Tab renderIcon={Login}>Sign In</Tab>
          <Tab renderIcon={Logout}>Sign Out</Tab>
        </TabList>

        <TabPanels>
          {/* Sign In panel */}
          <TabPanel>
            <Tile className={styles.formTile}>
              <form onSubmit={handleSignIn}>
                <Stack gap={5}>
                  <Select
                    id="signin-employee"
                    labelText="Employee"
                    value={signInForm.employee_id}
                    onChange={(e) => setSignInForm((f) => ({ ...f, employee_id: e.target.value }))}
                    required
                  >
                    <SelectItem value="" text="— select employee —" />
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id} text={emp.name} />
                    ))}
                  </Select>

                  <Select
                    id="signin-site"
                    labelText="Site"
                    value={signInForm.site_id}
                    onChange={(e) => setSignInForm((f) => ({ ...f, site_id: e.target.value }))}
                    required
                  >
                    <SelectItem value="" text="— select site —" />
                    {sites.map((s) => (
                      <SelectItem key={s.id} value={s.id} text={s.name} />
                    ))}
                  </Select>

                  <FormGroup legendText="Coordinates">
                    <div className={styles.coordRow}>
                      <TextInput
                        id="signin-lat"
                        labelText="Latitude"
                        type="number"
                        step="any"
                        required
                        value={signInForm.latitude}
                        onChange={(e) => setSignInForm((f) => ({ ...f, latitude: e.target.value }))}
                        placeholder="e.g. 6.9271"
                      />
                      <TextInput
                        id="signin-lng"
                        labelText="Longitude"
                        type="number"
                        step="any"
                        required
                        value={signInForm.longitude}
                        onChange={(e) => setSignInForm((f) => ({ ...f, longitude: e.target.value }))}
                        placeholder="e.g. 79.8612"
                      />
                    </div>
                    <Button
                      kind="tertiary"
                      size="md"
                      renderIcon={Location}
                      type="button"
                      disabled={locating}
                      onClick={() =>
                        useCurrentLocation((lat, lon) =>
                          setSignInForm((f) => ({ ...f, latitude: String(lat), longitude: String(lon) })),
                        )
                      }
                      style={{ marginTop: '0.5rem' }}
                    >
                      {locating ? 'Locating…' : 'Use My Location'}
                    </Button>
                  </FormGroup>

                  <Button type="submit" size="md" renderIcon={Login}>Sign In</Button>
                </Stack>
              </form>
            </Tile>
          </TabPanel>

          {/* Sign Out panel */}
          <TabPanel>
            <Tile className={styles.formTile}>
              <form onSubmit={handleSignOut}>
                <Stack gap={5}>
                  <TextInput
                    id="signout-id"
                    labelText="Attendance ID"
                    required
                    value={signOutForm.attendance_id}
                    onChange={(e) => setSignOutForm((f) => ({ ...f, attendance_id: e.target.value }))}
                    placeholder="Paste attendance record ID"
                  />

                  <FormGroup legendText="Coordinates">
                    <div className={styles.coordRow}>
                      <TextInput
                        id="signout-lat"
                        labelText="Latitude"
                        type="number"
                        step="any"
                        required
                        value={signOutForm.latitude}
                        onChange={(e) => setSignOutForm((f) => ({ ...f, latitude: e.target.value }))}
                        placeholder="e.g. 6.9271"
                      />
                      <TextInput
                        id="signout-lng"
                        labelText="Longitude"
                        type="number"
                        step="any"
                        required
                        value={signOutForm.longitude}
                        onChange={(e) => setSignOutForm((f) => ({ ...f, longitude: e.target.value }))}
                        placeholder="e.g. 79.8612"
                      />
                    </div>
                    <Button
                      kind="tertiary"
                      size="md"
                      renderIcon={Location}
                      type="button"
                      disabled={locating}
                      onClick={() =>
                        useCurrentLocation((lat, lon) =>
                          setSignOutForm((f) => ({ ...f, latitude: String(lat), longitude: String(lon) })),
                        )
                      }
                      style={{ marginTop: '0.5rem' }}
                    >
                      {locating ? 'Locating…' : 'Use My Location'}
                    </Button>
                  </FormGroup>

                  <Button type="submit" size="md" renderIcon={Logout} kind="secondary">Sign Out</Button>
                </Stack>
              </form>
            </Tile>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
}
