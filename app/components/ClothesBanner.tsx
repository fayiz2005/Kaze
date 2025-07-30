"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const images = [
  "https://images.pexels.com/photos/3812433/pexels-photo-3812433.jpeg",
  "https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg",
  "https://images.pexels.com/photos/2129970/pexels-photo-2129970.jpeg",
];

const slideDuration = 10000;

const ClothesBanner = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset slide timer on manual change
  const resetTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  useEffect(() => {
    resetTimeout();
    timeoutRef.current = setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, slideDuration);

    return () => resetTimeout();
  }, [activeIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        resetTimeout();
        setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
      } else if (e.key === "ArrowRight") {
        resetTimeout();
        setActiveIndex((prev) => (prev + 1) % images.length);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className="relative w-full overflow-hidden max-h-[375px] h-[375px] select-none">
      <AnimatePresence initial={false}>
        <motion.img
          key={activeIndex}
          src={images[activeIndex]}
          alt={`Slide ${activeIndex + 1}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute w-full h-full object-cover top-0 left-0"
          draggable={false}
        />
      </AnimatePresence>

      {/* Left / Right controls */}
      <button
        aria-label="Previous Slide"
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded z-20 cursor-pointer hover:bg-opacity-75 transition"
        onClick={() =>
          setActiveIndex((prev) => (prev - 1 + images.length) % images.length)
        }
      >
        ‹
      </button>
      <button
        aria-label="Next Slide"
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded z-20 cursor-pointer hover:bg-opacity-75 transition"
        onClick={() => setActiveIndex((prev) => (prev + 1) % images.length)}
      >
        ›
      </button>

      {/* Dots navigation */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
        {images.map((_, idx) => (
          <button
            key={idx}
            aria-label={`Go to slide ${idx + 1}`}
            className={`w-3 h-3 rounded-full ${
              idx === activeIndex ? "bg-white" : "bg-gray-400"
            }`}
            onClick={() => setActiveIndex(idx)}
          />
        ))}
      </div>
    </div>
  );
};

export default ClothesBanner;
