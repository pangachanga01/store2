import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-white shadow-md">
      <nav className="container flex items-center justify-between p-4 mx-auto">
        <Link to="/" className="text-xl font-bold">
          PangaStore
        </Link>
        <div className="space-x-4">
          <Link to="/" className="text-gray-600 hover:text-gray-900">
            Home
          </Link>
          <Link to="/login" className="text-gray-600 hover:text-gray-900">
            Admin Login
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
