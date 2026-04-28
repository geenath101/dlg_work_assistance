import { useState, useEffect, useCallback } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
import toast from 'react-hot-toast';
import { getSites, createSite, deleteSite } from '../../api/client';
import styles from './Sites.module.css';

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const DEFAULT_CENTER = { lat: 6.9271, lng: 79.8612 }; // Colombo default

export default function Sites() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPin, setSelectedPin] = useState(null);   // site shown in InfoWindow
  const [pendingPin, setPendingPin] = useState(null);     // new pin placed by click
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', proximity_radius_m: 100 });

  const loadSites = useCallback(async () => {
    try {
      const data = await getSites();
      setSites(data ?? []);
    } catch {
      toast.error('Failed to load sites');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSites(); }, [loadSites]);

  // Click on map to drop a new pin and open the creation form
  const handleMapClick = (e) => {
    const lat = e.detail.latLng.lat;
    const lng = e.detail.latLng.lng;
    setPendingPin({ lat, lng });
    setForm((f) => ({ ...f, address: `${lat.toFixed(5)}, ${lng.toFixed(5)}` }));
    setShowForm(true);
    setSelectedPin(null);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!pendingPin) return;
    try {
      await createSite({
        name: form.name,
        address: form.address,
        latitude: pendingPin.lat,
        longitude: pendingPin.lng,
        proximity_radius_m: Number(form.proximity_radius_m),
      });
      toast.success('Site created');
      setPendingPin(null);
      setShowForm(false);
      setForm({ name: '', address: '', proximity_radius_m: 100 });
      loadSites();
    } catch {
      toast.error('Failed to create site');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this site?')) return;
    try {
      await deleteSite(id);
      toast.success('Site deleted');
      setSelectedPin(null);
      loadSites();
    } catch {
      toast.error('Failed to delete site');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <h2>Sites</h2>
        <p className={styles.hint}>Click on the map to add a new site.</p>

        {loading ? (
          <p>Loading…</p>
        ) : sites.length === 0 ? (
          <p className={styles.empty}>No sites yet.</p>
        ) : (
          <ul className={styles.list}>
            {sites.map((s) => (
              <li key={s.id} className={styles.item}>
                <div>
                  <strong>{s.name}</strong>
                  <span>{s.address}</span>
                  <span className={styles.radius}>Radius: {s.proximity_radius_m} m</span>
                </div>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(s.id)}
                  title="Delete site"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={styles.mapWrapper}>
        <APIProvider apiKey={MAPS_API_KEY}>
          <Map
            mapId="dimeo-sites-map"
            defaultCenter={DEFAULT_CENTER}
            defaultZoom={12}
            onClick={handleMapClick}
            style={{ width: '100%', height: '100%' }}
          >
            {/* Existing sites */}
            {sites.map((s) => (
              <AdvancedMarker
                key={s.id}
                position={{ lat: s.latitude, lng: s.longitude }}
                onClick={() => { setSelectedPin(s); setShowForm(false); setPendingPin(null); }}
              />
            ))}

            {/* Pending new pin */}
            {pendingPin && (
              <AdvancedMarker position={pendingPin} />
            )}

            {/* InfoWindow for existing site */}
            {selectedPin && (
              <InfoWindow
                position={{ lat: selectedPin.latitude, lng: selectedPin.longitude }}
                onCloseClick={() => setSelectedPin(null)}
              >
                <div className={styles.infoWindow}>
                  <strong>{selectedPin.name}</strong>
                  <p>{selectedPin.address}</p>
                  <p>Radius: {selectedPin.proximity_radius_m} m</p>
                  <button onClick={() => handleDelete(selectedPin.id)}>Delete</button>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
      </div>

      {/* New site form panel */}
      {showForm && (
        <div className={styles.formPanel}>
          <h3>New Site</h3>
          <form onSubmit={handleCreate}>
            <label>
              Name
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. CBD Office Block"
              />
            </label>
            <label>
              Address
              <input
                required
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="Street address or coordinates"
              />
            </label>
            <label>
              Check-in radius (m)
              <input
                type="number"
                min={10}
                max={5000}
                value={form.proximity_radius_m}
                onChange={(e) => setForm((f) => ({ ...f, proximity_radius_m: e.target.value }))}
              />
            </label>
            <div className={styles.formActions}>
              <button type="submit">Save</button>
              <button type="button" onClick={() => { setShowForm(false); setPendingPin(null); }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
