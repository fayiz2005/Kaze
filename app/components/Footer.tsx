"use client";

import React from "react";

export default function Footer() {
  return (
    <footer className="bg-[#5C4A2B] text-white py-8 px-6 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8">
        <div className="md:w-1/3">
          <h2 className="text-xl font-semibold mb-3">About Us</h2>
          <p className="text-gray-200 leading-relaxed">
            At Kaze, we are committed to providing you with
            premium products and exceptional customer service. Our mission is
            to bring quality and style to your doorstep with every order.
          </p>
        </div>

        <div className="md:w-1/3">
          <h2 className="text-xl font-semibold mb-3">Contact</h2>
          <p>Email: support@yourstore.com</p>
          <p>Phone: +1 (555) 123-4567</p>
          <p>Address: 123 Commerce St, Cityville, Country</p>
        </div>

        <div className="md:w-1/3">
          <h2 className="text-xl font-semibold mb-3">Follow Us</h2>
          <div className="flex gap-4">
            <a
              href="https://facebook.com/yourpage"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-300"
            >
              Facebook
            </a>
            <a
              href="https://twitter.com/yourhandle"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-300"
            >
              Twitter
            </a>
            <a
              href="https://instagram.com/yourhandle"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-300"
            >
              Instagram
            </a>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-gray-300 text-sm">
        &copy; {new Date().getFullYear()} Kaze. All rights reserved.
      </div>
    </footer>
  );
}
