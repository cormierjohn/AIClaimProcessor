// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Claims from './components/Claims';
import ClaimDetails from './components/ClaimDetails'; // Adjust the import path as necessary
// App.js
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Claims />} />
          <Route path="claim/:id" element={<ClaimDetails />} />
          {/* Add more routes here as needed */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
