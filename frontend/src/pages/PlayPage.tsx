import * as React from 'react';
import Map, { Marker } from 'react-map-gl/maplibre';
import { Source, Layer } from 'react-map-gl/maplibre';
import type { LayerProps } from 'react-map-gl/maplibre';
import type { FeatureCollection, Feature, Point } from 'geojson';

import 'maplibre-gl/dist/maplibre-gl.css';

import InventorySystem from "../components/InventorySystem.tsx"
import GameFooter from "../components/GameFooter.tsx"
import QuestIcon from "../components/QuestIcon.tsx"


function App() {
  // Modals
  const [modalStates, setModalStates] = React.useState<{inventory: Boolean;}>({inventory:false});

  const [userLocation, setUserLocation] = React.useState<{longitude: number; latitude: number} | null>(null);
  const [viewState, setViewState] = React.useState({
    longitude: -81.2005,
    latitude: 28.6016,
    zoom: 17,
    pitch: 50,
    bearing: -30
  });

  // Pulse factor state (declare BEFORE useEffect)
  const [pulse, setPulse] = React.useState(1);

  // Geolocation effect (only once)
  React.useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // const { longitude, latitude } = position.coords;
        console.log("Actula Pos",position)
        const { longitude, latitude } = { longitude: -81.2005, latitude: 28.6016 };
        setUserLocation({ longitude, latitude });
        setViewState((prev) => ({ ...prev, longitude, latitude }));
      },
      (error) => {
        console.error('Error getting location:', error);
      }
    );
  }, []);

  // Pulse animation effect (separate)
  React.useEffect(() => {
    let animationFrameId: number;
    let startTime: number | null = null;

    function animate(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      // Pulse between 0.8 and 1.2 every 2 seconds
      const pulseFactor = 1 + 0.05 * Math.sin((elapsed / 2000) * 2 * Math.PI);
      setPulse(pulseFactor);

      animationFrameId = requestAnimationFrame(animate);
    }

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // --- HOTZONES ---
  const radiusMeters = 300;

  const radiusPixels = React.useMemo(() => {
    return metersToPixelsAtLatitude(radiusMeters, viewState.latitude, viewState.zoom) * pulse;
  }, [viewState.latitude, viewState.zoom, pulse]);
  
  const hotzoneLayer: LayerProps = React.useMemo(() => ({
    id: 'hotzones',
    type: 'circle',
    source: 'hotzones',
    paint: {
      'circle-radius': radiusPixels,
      'circle-color': [
        'match',
        ['get', 'difficulty'],
        1, '#E07B7B',
        2, '#9B59B6',
        3, '#F39C12',
        '#000000',
      ],
      'circle-opacity': 0.5,
    },
  }), [radiusPixels]);


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

          {/* QUEST ICONS */}
          {QUESTZONE.map((questData,i)=>{
            return(
              <Marker key={`quest_${i}`} longitude={questData.longitude} latitude={questData.latitude}>
                <QuestIcon zoom={viewState.zoom} questData={questData}/>
              </Marker>
            )
          })}
          
          {/* HOTZONE CIRCLES */}
          <Source id="hotzones" type="geojson" data={hotzoneGeoJSON}>
            <Layer {...hotzoneLayer} />
          </Source>

        </Map>
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-0 left-0 w-full z-3">
          <GameFooter OnClickInventory={()=>setModalStates((old)=>{old.inventory=true;return old;})} />
      </div>

      {/* ALL MODALS CONTAINER*/}
      {modalStates.inventory &&  
        <div className='absolute w-[30%] h-[85%] left-[50%] top-[50%] translate-[-50%] z-5'>
            <InventorySystem onClose={()=>setModalStates((old)=>{old.inventory=false;return old;})} />
        </div>
      }
    </div>
    
  );
}

export default App;



const HOTZONES = [
  {difficulty:1,longitude: -81.2005,latitude: 28.6016},
  {difficulty:2,longitude: -81.1960 ,latitude: 28.6016},
  {difficulty:3,longitude: -81.1970,latitude: 28.6080}
]

const QUESTZONE = [
  {longitude: -81.1988 ,latitude: 28.6032},
  {longitude: -81.2055 ,latitude: 28.6012},
  {longitude: -81.2055 ,latitude: 28.6052},
  {longitude: -81.2000 ,latitude: 28.5970},
]

const hotzoneGeoJSON: FeatureCollection<Point> = {
  type: "FeatureCollection",
  features: HOTZONES.map((zone): Feature<Point> => ({
    type: "Feature",
    properties: { difficulty: zone.difficulty },
    geometry: {
      type: "Point",
      coordinates: [zone.longitude, zone.latitude],
    },
  })),
};

function metersToPixelsAtLatitude(meters: number, latitude: number, zoom: number) {
  const earthCircumference = 40075017; // meters
  const latitudeRadians = (latitude * Math.PI) / 180;
  const metersPerPixel = earthCircumference * Math.cos(latitudeRadians) / Math.pow(2, zoom + 8);
  return meters / metersPerPixel;
}