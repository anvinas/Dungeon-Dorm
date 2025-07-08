import * as React from 'react';
import Map, { Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

import InventorySystem from "../components/InventorySystem.tsx"

function App() {
  const [userLocation, setUserLocation] = React.useState<{
    longitude: number;
    latitude: number;
  } | null>(null);

  const [viewState, setViewState] = React.useState({
    longitude: -81.4, // default somewhere near Orlando
    latitude: 28.5,
    zoom: 14,
  });

  React.useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        setUserLocation({ longitude, latitude });
        setViewState((prev) => ({
          ...prev,
          longitude,
          latitude,
        }));
      },
      (error) => {
        console.error('Error getting location:', error);
      }
    );
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle="https://api.maptiler.com/maps/streets-v2/style.json?key=6tt8Z9sB8XXEvl0jd1gY"
        style={{ width: '100%', height: '100%' }}
      >
        {userLocation && (
          <Marker
            longitude={userLocation.longitude}
            latitude={userLocation.latitude}
            color="red"
          />
        )}
      </Map>
      <div className="absolute top-[50%] left-[50%] translate-[-50%] w-[50%] h-[80%]">
        <InventorySystem />
      </div>
    </div>
  );
}

export default App;
