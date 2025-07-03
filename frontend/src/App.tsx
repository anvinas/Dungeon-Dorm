import './App.css';
import LoginPage from './pages/LoginPage';
import CardPage from './pages/CardPage';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; // Updated imports

function App() {
  return (
    <BrowserRouter>
      <Routes> {/* Replaced <Switch> with <Routes> */}
        <Route path="/" element={<LoginPage />} /> {/* Updated Route syntax */}
        <Route path="/cards" element={<CardPage />} /> {/* Updated Route syntax */}
        <Route path="*" element={<Navigate to="/" />} /> {/* Replaced <Redirect> with <Navigate> and set as catch-all */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;