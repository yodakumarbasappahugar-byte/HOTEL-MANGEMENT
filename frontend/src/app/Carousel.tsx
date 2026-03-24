"use client";

import { useState, useEffect } from 'react';
import './carousel.css';

const images = [
  '/images/hotel-1.png',
  '/images/hotel-2.png',
  '/images/hotel-3.png'
];

export default function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="carousel-container">
      {images.map((src, index) => (
        <div 
          key={src} 
          className={`carousel-slide ${index === currentIndex ? 'active' : ''}`}
          style={{ backgroundImage: `url(${src})` }}
        />
      ))}
      <div className="carousel-overlay"></div>
    </div>
  );
}
