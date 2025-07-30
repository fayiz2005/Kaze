"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Fuse from "fuse.js";
import { useCart } from "./context/CartContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  image: string;
};


const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
};

function ProductCard({
  product,
  onClick,
}: {
  product: Product;
  onClick?: () => void;
}) {
  return (
    <motion.div
      className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-4 bg-gray-50"
      style={{ boxSizing: "border-box" }}
      variants={cardVariants}
    >
      <div
        className="bg-white rounded-xl shadow hover:shadow-lg cursor-pointer transition"
        onClick={onClick}
      >
        <div className="relative w-full h-[300px] overflow-hidden rounded-t-xl">
          <Image
            src={product.image}
            alt={product.name || "Product image"}
            fill
            sizes="300px"
            style={{ objectFit: "cover" }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/fallback.jpg";
            }}
          />
        </div>

        <div className="p-4 rounded-b-xl">
          <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
          <p className="text-gray-600 mb-1">{product.price.toFixed(2)} tk.</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function HomePage() {
  const { searchQuery, category } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/products")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      })
      .then(setProducts)
      .catch((err) => {
        console.error("Product fetch failed:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = useMemo(() => {
    const byCategory = category
      ? products.filter((p) => p.categoryId === category)
      : products;

    if (searchQuery) {
      const fuse = new Fuse(byCategory, {
        keys: ["name", "description"],
        threshold: 0.3,
      });
      return fuse.search(searchQuery).map((r) => r.item);
    }

    return byCategory;
  }, [products, searchQuery, category]);

  return (
    <main className="p-4 max-w-7xl mx-auto">
      {loading ? (
        <p className="text-gray-500 mt-10 text-center">Loading...</p>
      ) : filteredProducts.length === 0 ? (
        <p className="text-gray-500 mt-10 text-center">No matching products found.</p>
      ) : (
        <motion.div
          className="flex flex-wrap justify-center"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.15,
              },
            },
          }}
        >
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => router.push(`/product/${product.id}`)}
            />
          ))}
        </motion.div>
      )}
    </main>
  );
}
