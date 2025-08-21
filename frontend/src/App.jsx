import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          {/* A placeholder for the admin section */}
          <Route path="/admin" element={
            <div className="text-center">
              <h1 className="text-3xl">Admin Dashboard</h1>
              <p>Welcome, admin!</p>
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
}

export default App;
