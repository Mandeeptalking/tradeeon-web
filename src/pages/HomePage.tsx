import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <Hero />
    </div>
  );
};

export default HomePage;