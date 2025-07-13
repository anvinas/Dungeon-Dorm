import * as React from 'react';
import Map, { Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

import InventorySystem from "../components/InventorySystem.tsx"
import GameFooter from "../components/GameFooter.tsx"

function App() {
  const [userLocation, setUserLocation] = React.useState<{
    longitude: number;
    latitude: number;
  } | null>(null);

  const [viewState, setViewState] = React.useState({
    longitude: -81.4, // default somewhere near Orlando
    latitude: 28.5,
    zoom: 17,
    pitch:50,
    bearing:-30
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
    <div className='w-full h-full'>

      {/* MAP ITEMS */}
      <div style={{ width: '100%', height: '100vh' }}>
        <Map
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          mapStyle="https://api.maptiler.com/maps/streets-v2/style.json?key=6tt8Z9sB8XXEvl0jd1gY"
          style={{ width: '100%', height: '100%' }}
          
        >
          {userLocation && (
              
              <Marker longitude={userLocation.longitude} latitude={userLocation.latitude}>
              <img
                src="/assets/character.png"
                alt="Character"
                style={{
                  height: `${viewState.zoom * 6}px`, // You can tweak multiplier (e.g. 6) to suit your style
                  transform: 'translate(25%, -40%)',
                  transition: 'height 0.2s ease', // smooth resizing
                }}
              />
            </Marker>
          )}
        </Map>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 w-full">
          <GameFooter />
      </div>

      {/* ALL MODALS CONTAINER*/}
      <div className='absolute w-[30%] h-[80%] left-[50%] top-[50%] translate-[-50%]'>
          <InventorySystem />
      </div>
    </div>
    
  );
}

export default App;