import { useState, useEffect } from 'react';

const images = [
  '/images/slide1.jpg',
  '/images/slide2.jpg',
  '/images/slide3.jpg'
];

export default function ImageSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full overflow-hidden rounded-2xl relative shadow-sm border border-slate-200/80 dark:border-white/10 bg-slate-200 dark:bg-[#002455]/30 mb-7">
      <div 
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((img, index) => (
          <div key={index} className="min-w-full aspect-[3/1]">
            <img 
              src={img} 
              alt={`Slide ${index}`} 
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 flex gap-1.5">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1 transition-all rounded-full ${
              currentIndex === index ? 'w-7 bg-[#DC0000]' : 'w-2 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  );
}