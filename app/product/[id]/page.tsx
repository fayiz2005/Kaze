"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useCart } from "@/app/context/CartContext";
import { useRouter } from "next/navigation";

type Variant = {
  id: string;
  sizeType: "STANDARD" | "WAIST";
  sizeValue: string;
  stock: number;
};

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stock?: number;
  variants: Variant[];
};

interface Props {
  params: {
    id: string;
  };
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const id = unwrappedParams.id;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number | null>(null);
  const [VariantSelected, setVariantSelected]=useState(false);
  const [showVariantWarning, setShowVariantWarning] = useState(false);

  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error("Failed to fetch product");
        const data: Product = await res.json();
        setProduct(data);
         data.variants.sort((a, b) => {
        // Handle standard sizes
        const standardOrder = ["XS", "S", "M", "L", "XL", "XXL"];
        if (a.sizeType === "STANDARD" && b.sizeType === "STANDARD") {
          return standardOrder.indexOf(a.sizeValue) - standardOrder.indexOf(b.sizeValue);
        }

        // Handle waist sizes numerically
        if (a.sizeType === "WAIST" && b.sizeType === "WAIST") {
          return parseInt(a.sizeValue) - parseInt(b.sizeValue);
        }

        // Fallback to alphabetical sort
        return a.sizeValue.localeCompare(b.sizeValue);
      });

        setSelectedVariantIndex(null); // reset selected variant when product changes
        setQuantity(1);
      } catch {
        setError("Error loading product");
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error)
    return (
      <p className="text-center mt-10 text-red-600 font-semibold">{error}</p>
    );
  if (!product) return null;

  // Use stock from selected variant if chosen, else fallback to product stock
  const selectedVariant = selectedVariantIndex !== null ? product.variants[selectedVariantIndex] : null;
  const availableStock = selectedVariant ? selectedVariant.stock : product.stock ?? 0;
  const isOutOfStock = availableStock === 0;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        {/* Product Image */}
        <div className="relative w-full h-[450px] rounded-xl overflow-hidden border">
          <Image
            src={product.image}
            alt={product.name || "Product image"}
            fill
            className="object-cover"
          />
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-[#1c1c1c]">{product.name}</h1>
          <p className="text-gray-700 leading-relaxed">{product.description}</p>
          <p className="text-2xl font-semibold text-[#5C4A2B]">
            {product.price.toFixed(2)} tk.
          </p>

          <p className={`text-sm font-medium ${isOutOfStock ? "text-red-600" : "text-green-600"}`}>
            {isOutOfStock ? "Out of Stock" : `In Stock: ${availableStock}`}
          </p>

          {product.variants.length > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Select Size</label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant, i) => (
                  <button
                    key={variant.id}
                    onClick={() => {
                      setSelectedVariantIndex(i);
                      setQuantity(1); 
                      setVariantSelected(true)

                    }}
                    className={`px-3 py-1 border rounded-md transition cursor-pointer ${
                      i === selectedVariantIndex
                        ? "bg-[#5C4A2B] text-white border-[#5C4A2B]"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                    }`}
                    type="button"
                    disabled={variant.stock === 0}
                    title={variant.stock === 0 ? "Out of stock" : ""}
                  >
                    {variant.sizeValue}
                  </button>
                ))}
              </div>
            </div>
          )}
          {showVariantWarning && (
            <p className="text-sm text-red-600 mt-2">Please select a size before adding to cart.</p>
          )}

          <div className="flex items-center gap-4">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="px-4 py-1 bg-gray-200 rounded hover:bg-gray-300 transition cursor-pointer"
            >
              −
            </button>
            <span className="min-w-[40px] text-center text-lg">{quantity}</span>
            <button
              onClick={() => setQuantity(q => Math.min(availableStock, 10, q + 1))}
              className="px-4 py-1 bg-gray-200 rounded hover:bg-gray-300 transition cursor-pointer"
              disabled={isOutOfStock}
            >
              +
            </button>
          </div>

          <button
          onClick={() => {
            if (product.variants.length > 0 && !selectedVariant) {
              setShowVariantWarning(true);
              return;
            }

            setShowVariantWarning(false); 

            if (selectedVariant) {
              addToCart({
                ...product,
                quantity,
                stock: selectedVariant.stock,
                variantId: selectedVariant.id,
                sizeValue: selectedVariant.sizeValue,
              });
            } else {
              addToCart({ ...product, quantity, stock: product.stock ?? 0 });
            }
          }}

            className="mt-4 w-full bg-[#5C4A2B] hover:bg-[#4a3b21] text-white py-3 rounded-lg font-medium transition cursor-pointer disabled:opacity-50"
            disabled={isOutOfStock}
          >
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
