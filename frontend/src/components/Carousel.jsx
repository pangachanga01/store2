import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Carousel = () => {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await api.get('/carousel');
        setSlides(response.data);
      } catch (error) {
        console.error('Failed to fetch carousel slides:', error);
      }
    };
    fetchSlides();
  }, []);

  useEffect(() => {
    if (slides.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
      }, 5000); // Change slide every 5 seconds
      return () => clearInterval(interval);
    }
  }, [slides]);

  if (slides.length === 0) {
    return null; // Don't render anything if there are no slides
  }

  const currentSlide = slides[currentIndex];

  const getLink = (slide) => {
    switch (slide.link_type) {
      case 'PRODUCT':
        return `/products/${slide.link_target}`;
      case 'PAGE':
        return `/${slide.link_target}`;
      case 'EXTERNAL':
        return slide.link_target;
      default:
        return '#';
    }
  };

  return (
    <div className="relative w-full h-96">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `url(${slide.image_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-center text-white">
              <h2 className="text-4xl font-bold">{slide.title}</h2>
              <p className="mt-2 text-lg">{slide.subtitle}</p>
              {slide.button_text && (
                <Link to={getLink(slide)} className="inline-block px-6 py-2 mt-4 font-semibold text-white bg-indigo-600 rounded hover:bg-indigo-700">
                  {slide.button_text}
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}
       <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full ${
              index === currentIndex ? 'bg-white' : 'bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
