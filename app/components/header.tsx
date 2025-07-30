"use client";
import Link from "next/link";
import { useCart } from "../context/CartContext";



export default function Header() {
  const { cart, searchQuery, setSearchQuery } = useCart();
  const totalItems = cart?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <header className="w-full bg-white shadow p-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
        {/* Logo */}
        <div className="text-xl font-bold tracking-wide">
          <Link href="/">
            <div className="flex flex-col items-center leading-none">
              <span
                style={{ fontFamily: "'Yuji Boku'", display: "inline-block", textAlign: "center", color: "#5C4A2B" }}
                className="text-6xl font-serif"
              >
                風
              </span>
              <span className="text-lg mt-1 font-medium tracking-widest text-[#5C4A2B]">Kazé</span>
            </div>
          </Link>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search..."
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5C4A2B]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Cart */}
        <div>
          <Link
            href="/cart"
            className="relative inline-flex items-center px-4 py-2 border border-[#5C4A2B] text-[#5C4A2B] rounded-md hover:bg-[#5C4A2B] hover:text-white transition"
          >
            <span className="mr-2">Cart</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386a.75.75 0 01.74.641L4.886 6.75h14.228l-1.286 8.143a.75.75 0 01-.74.607H6.053a.75.75 0 01-.74-.607L4.886 6.75L4.5 4.5m2.25 14.25a.75.75 0 100 1.5.75.75 0 000-1.5zm10.5 0a.75.75 0 100 1.5.75.75 0 000-1.5z"
              />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
