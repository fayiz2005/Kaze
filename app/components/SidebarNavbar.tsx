'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/app/context/CartContext';
import { motion } from 'framer-motion';

type Category = {
  id: string;
  name: string;
};

const listVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export function SidebarNavbar() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { setCategory } = useCart();

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then(setCategories)
      .catch((err) => console.error('Failed to fetch categories', err));
  }, []);

  const handleCategoryClick = (id: string) => {
    setCategory(id);
    setIsOpen(false); // close sidebar on mobile
  };

  return (
    <>
      {/* Mobile menu toggle */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden m-3 px-4 py-2 bg-gray-100 text-gray-900 rounded border border-gray-300"
      >
        ☰ Menu
      </button>

      {/* Mobile sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-52 bg-white text-gray-900 shadow-md z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:hidden`}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-300">
          <div className="flex flex-col items-center text-[#5C4A2B]">
            <span
              style={{ fontFamily: "'Yuji Boku', serif" }}
              className="text-6xl"
            >
              風
            </span>
            <span className="text-2xl font-serif mt-2">Kazé</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-700 hover:text-gray-900 text-xl font-bold"
          >
            ×
          </button>
        </div>

        <motion.ul
          className="flex flex-col p-4 space-y-2"
          initial="hidden"
          animate={isOpen ? 'visible' : 'hidden'}
          variants={listVariants}
        >
          <motion.li variants={itemVariants}>
            <Link
              href="/"
              className="px-4 py-2 border border-[#5C4A2B] text-[#5C4A2B] rounded-md hover:bg-[#5C4A2B] hover:text-white transition"
              onClick={() => {
                setCategory('');
                setIsOpen(false);
              }}
            >
              Home
            </Link>
          </motion.li>

          {categories.map((category) => (
            <motion.li key={category.id} variants={itemVariants}>
              <button
                className="w-full text-left px-4 py-2 border border-[#5C4A2B] text-[#5C4A2B] rounded-md hover:bg-[#5C4A2B] hover:text-white transition"
                onClick={() => handleCategoryClick(category.id)}
              >
                {category.name}
              </button>
            </motion.li>
          ))}
        </motion.ul>
      </div>

      {/* Desktop navbar */}
      <motion.div
        className="hidden lg:flex justify-around items-center px-4 py-2 bg-white shadow w-full"
        initial="hidden"
        animate="visible"
        variants={listVariants}
      >
        <motion.div variants={itemVariants}>
          <Link
            href="/"
            className="px-4 py-2 border border-[#5C4A2B] text-[#5C4A2B] rounded-md hover:bg-[#5C4A2B] hover:text-white transition"
            onClick={() => setCategory('')}
          >
            Home
          </Link>
        </motion.div>
        {categories.map((category) => (
          <motion.div key={category.id} variants={itemVariants}>
            <button
              className="px-4 py-2 border border-[#5C4A2B] text-[#5C4A2B] rounded-md hover:bg-[#5C4A2B] hover:text-white transition cursor-pointer"
              onClick={() => setCategory(category.id)}
            >
              {category.name}
            </button>
          </motion.div>
        ))}
      </motion.div>
    </>
  );
}
