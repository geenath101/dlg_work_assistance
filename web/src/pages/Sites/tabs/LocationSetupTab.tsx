import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { APIProvider, Map, AdvancedMarker, useMapsLibrary, useMap, MapMouseEvent } from '@vis.gl/react-google-maps';
import toast from 'react-hot-toast';
import {
  Button,
  TextInput,
  NumberInput,
  Tag,
  InlineLoading,
} from '@carbon/react';
import { TrashCan, Location, Add } from '@carbon/icons-react';
import { getSites, createSite, deleteSite } from '../../../api/client';
import type { Site } from '../../../types';
import styles from '../Sites.module.css';

// ── Types ─────────────────────────────────────────────────────────────────────

interface PendingPin { lat: number; lng: number; }
interface SiteForm { name: string; address: string; proximity_radius_m: number; lat:number;lng:number}
const PROXIMITY_RADIUS = 100

const MAPS_API_KEY   = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;

// double check the distance capturing in bellow
const DEFAULT_CENTER = { lat: -41.287529941445925, lng: 174.77658842283134 };
const DEFAULT_BOUND = {
  north: DEFAULT_CENTER.lat + 0.1,
  south: DEFAULT_CENTER.lat - 0.1,
  east: DEFAULT_CENTER.lng + 0.1,
  west: DEFAULT_CENTER.lng - 0.1,
};

// ── Places search bar (must live inside <APIProvider>) ────────────────────────

interface PlacesSearchProps {
  onPlaceSelect: (lat: number | null, lng: number | null, address: string | null) => void;
}

function PlacesSearch({onPlaceSelect}: PlacesSearchProps){
    const places = useMapsLibrary('places')
    const [inputValue,setInputValue] = useState("")
    const [suggestions,setSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([])
    const [pickedLocation,setPickedLocation] = useState<google.maps.places.AutocompleteSuggestion>()
    const [isOpen,setIsOpen] = useState(false);

    const sessionToken = useMemo(() => {
        return places ? new places.AutocompleteSessionToken() : undefined
    },[places]);

    useEffect(()=> {
        if (!places || inputValue.length < 3 ){
            setSuggestions([])
            return;
        }
    
    const fetchResults = async () => {
        try{
            const { suggestions } = await places?.AutocompleteSuggestion
            .fetchAutocompleteSuggestions({
                input:inputValue,
                locationBias:DEFAULT_BOUND,
                sessionToken
            });
            setSuggestions(suggestions)
            setIsOpen(true)
            console.log("got suggestions")
            suggestions.forEach((t) => {
              console.log(t.placePrediction?.mainText)
            })
        }catch(e){
            console.error("Autocomplete error ",e)
        }
    };

    const delay = setTimeout(fetchResults,300);
    return () => clearTimeout(delay);
},[inputValue,places,sessionToken]);

const handleSelect = async (suggestions: google.maps.places.AutocompleteSuggestion) => {
 
   const place = suggestions.placePrediction;
    if (!place || !places) {
        return
    }
    setInputValue(place.text.toString())
    setIsOpen(false)

    const placeDetails = new places.Place({id: place.placeId })
    await placeDetails.fetchFields({ fields :['displayName', 'formattedAddress', 'location']})

    if (placeDetails.location) {
      onPlaceSelect(
        placeDetails.location.lat(),
        placeDetails.location.lng(),
        placeDetails.formattedAddress ?? ''
      );
    }
}

  return (

    <div style={{ position: 'relative', width: '100%' }}>
      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className={styles.mapSearchInput}
        placeholder="Search for a location…"
        onBlur={() => setTimeout(() => setIsOpen(false), 200)} // Delay to allow click
      />

      {isOpen && suggestions.length > 0 && (

        
        <ul className={styles.dropdown}>
          {suggestions.map((s, index) => (
            <li 
              key={index} 
              onClick={() => handleSelect(s)}
              className={styles.dropdownItem}
            >
          <strong>{s.placePrediction?.mainText?.text}</strong>
              <small>{s.placePrediction?.text?.text}</small>
            </li>
          ))}

        </ul>
      )
      }
    </div>
  );
}


// ── Pans the map when a place is selected ────────────────────────────────────

function MapController({ center }: { center: { lat: number; lng: number } | null }) {
  const map = useMap();
  console.log("map instance retrieved",map)
  useEffect(() => { if (map && center) { map.panTo(center); map.setZoom(16); }
  }, [map, center]);
  return null;
}

// ── LocationSetupTab ──────────────────────────────────────────────────────────

export default function LocationSetupTab() {
  const [sites,      setSites]      = useState<Site[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [showModal,  setShowModal]  = useState(false);
  const [pendingPin, setPendingPin] = useState<PendingPin | null>(null);
  const [mapCenter,  setMapCenter]  = useState<{ lat: number; lng: number } | null>(null);
  const [form,       setForm]       =
   useState<SiteForm>({ name: '',address: '',proximity_radius_m: PROXIMITY_RADIUS,lat:DEFAULT_CENTER.lat,lng:DEFAULT_CENTER.lng });
  const [saving,     setSaving]     = useState(false);

  const loadSites = useCallback(async () => {
    try {
      const data = await getSites();
      setSites(data ?? []);
    } catch( e ) {
      //toast.error('Failed to load sites');
      console.error("error loading sites",e)
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSites(); }, [loadSites]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this site?')) return;
    try {
      await deleteSite(id);
      toast.success('Site deleted');
      loadSites();
    } catch (err) {
      // toast.error('Failed to delete site');
      console.error('Failed to delete site', err);
    }
  };

  const handlePlaceSelect = useCallback((lat: number | null, lng: number | null, address: string | null) => {
    console.log("place been selected")
    if (lat !== null && lng !== null) {
      setPendingPin({ lat, lng });
      setMapCenter({ lat, lng });
    }
    if (address !== null) {
      setForm((f) => ({ ...f, address }));
    }
  }, []);

  const handleMapClick = (e: MapMouseEvent) => {
    if (!e?.detail?.latLng) return;
    const { lat, lng } = e.detail.latLng;
    setPendingPin({ lat, lng });
    setForm((f) => ({...f,lat:lat,lng:lng}));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingPin) { /* toast.error('Pin a location on the map first'); */ console.error('Pin a location on the map first'); return; }
    setSaving(true);
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
      setShowModal(false);
      //setForm({ name: '', address: '', proximity_radius_m: 100 });
      loadSites();
    } catch (err) {
      // toast.error('Failed to create site');
      console.error('Failed to create site', err);
    } finally {
      setSaving(false);
    }
  };

  const openAddModal = () => {
    setShowModal(true);
    setPendingPin(null);
    setMapCenter(null);
   // setForm({ name: '', address: '', proximity_radius_m: 100 });
  };

  const closeAddModal = () => {
    setShowModal(false);
    setPendingPin(null);
    setMapCenter(null);
  };

  return (
    <>
      <div className={styles.locationSetup}>
        <div className={styles.locationSetupHeader}>
          <h4 className="cds--type-heading-04">Sites</h4>
          <Button renderIcon={Add} size="md" onClick={openAddModal}>
            Add Site
          </Button>
        </div>

        {loading ? (
          <InlineLoading description="Loading sites…" />
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.siteTable}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Address</th>
                  <th>Latitude</th>
                  <th>Longitude</th>
                  <th>Radius</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sites.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={styles.emptyRow}>
                      No sites yet. Click "Add Site" to get started.
                    </td>
                  </tr>
                ) : (
                  sites.map((s) => (
                    <tr key={s.id} className={styles.siteRow}>
                      <td>{s.name}</td>
                      <td>{s.address}</td>
                      <td>{s.latitude.toFixed(5)}</td>
                      <td>{s.longitude.toFixed(5)}</td>
                      <td><Tag type="blue" size="sm">{s.proximity_radius_m} m</Tag></td>
                      <td>
                        <Button
                          kind="ghost"
                          size="sm"
                          hasIconOnly
                          renderIcon={TrashCan}
                          iconDescription="Delete site"
                          onClick={() => handleDelete(s.id)}
                          style={{ color: 'var(--cds-support-error)' }}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add Site modal ── */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) closeAddModal(); }}>
          <div className={styles.modalDialog}>
            <div className={styles.modalHeader}>
              <Location size={20} />
              <h5 className="cds--type-heading-03" style={{ margin: 0 }}>Add Site</h5>
            </div>

            <div className={styles.modalBody}>
              {/* Map area */}
              <div className={styles.modalMapArea}>
                <APIProvider apiKey={MAPS_API_KEY}>
                  <div className={styles.mapSearchBar}>
                    <PlacesSearch onPlaceSelect={handlePlaceSelect} />
                  </div>
                  <Map
                    mapId="add_site_map"
                    defaultCenter={DEFAULT_CENTER}
                    defaultZoom={13}
                    onClick={handleMapClick}
                    style={{ width: '100%', height: '100%' }}
                  >
                    <MapController center={mapCenter} />
                    {pendingPin && <AdvancedMarker position={pendingPin} />}
                  </Map>
                </APIProvider>
              </div>

              {/* Form */}
              <form onSubmit={handleCreate} className={styles.modalForm}>
                <TextInput
                  id="site-name"
                  labelText="Site Name"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. CBD Office Block"
                />
                <TextInput
                  id="site-address"
                  labelText="Address"
                  required
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  placeholder="Search map or click to set"
                  helperText="Auto-filled from map search; edit if needed"
                />
                {/* <NumberInput
                  id="site-radius"
                  label="Check-in radius (m)"
                  min={10}
                  max={5000}
                  value={form.proximity_radius_m}
                  onChange={(_e: unknown, { value }: { value: string | number }) =>
                    setForm((f) => ({ ...f, proximity_radius_m: Number(value) }))
                  }
                /> */}
                <div className={styles.modalActions}>
                  <Button type="submit" renderIcon={Add} disabled={saving} size="md">
                    {saving ? 'Saving…' : 'Save Site'}
                  </Button>
                  <Button kind="secondary" size="md" type="button" onClick={closeAddModal}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
