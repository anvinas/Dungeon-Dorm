//import React from 'react';
import { BrowserRouter as Router, Routes, Route, } from 'react-router-dom';
import './App.css';

import LoginPage from './pages/LoginPage';
import PlayPage from './pages/PlayPage';
import CharacterSelectPage from './pages/CharacterSelectPage';

function App() {
  return (
   <Router>
      <Routes>
        <Route path="/" element={<LoginPage/>} />
        <Route path="/play" element={<PlayPage/>} />
        <Route path="/character" element={<CharacterSelectPage/>} />
        {/* <Route path="about" element={<CardPage/>} /> */}
      </Routes>
      </Router>
  );
}

export default App;

