"use client";

import { useCart } from "@/app/context/CartContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function CartPage() {
  const { cart, increaseQuantity, decreaseQuantity, removeFromCart } = useCart();
  const router = useRouter();

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Your Cart</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items with motion container */}
        <motion.div
          className="lg:col-span-2 space-y-4"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {cart.map((item) => (
            <motion.div
              key={item.variantId ? `${item.id}-${item.variantId}` : item.id}
              className="flex items-center gap-4 p-4 border rounded-lg bg-white shadow-sm"
              variants={itemVariants}
              // Optional: smooth easing
              transition={{ ease: "easeOut", duration: 0.4 }}
            >
              <button
                onClick={() => removeFromCart(item.id, item.variantId)}
                className="text-white bg-red-500 hover:bg-red-600 rounded-full w-6 h-6 text-sm flex items-center justify-center cursor-pointer"
              >
                ×
              </button>

              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-md"
              />

              <div className="flex flex-col flex-grow">
                <div className="font-semibold">
                  {item.name}
                  {item.sizeValue ? (
                    <span className="text-sm text-gray-500 ml-2">({item.sizeValue})</span>
                  ) : null}
                </div>
                <div className="text-gray-600 mb-1">{item.price.toFixed(2)} tk.</div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => increaseQuantity(item.id, item.variantId)}
                    className="px-2 py-1 border rounded hover:bg-gray-100 cursor-pointer"
                  >
                    +
                  </button>
                  <span className="text-sm">Qty: {item.quantity}</span>
                  <button
                    onClick={() => decreaseQuantity(item.id, item.variantId)}
                    className="px-2 py-1 border rounded hover:bg-gray-100 cursor-pointer"
                  >
                    -
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Cart Summary */}
        <div className="bg-gray-50 p-6 border rounded-lg shadow-sm">
          <div className="space-y-2 text-gray-700 text-sm">
            <div>
              <span className="font-medium">Items ({totalItems}):</span> {total.toFixed(2)} tk.
            </div>
            <div>Shipping: Free</div>
            <hr className="my-2" />
            <div className="text-lg font-semibold">Total: {total.toFixed(2)} tk.</div>
          </div>

          <button
            onClick={() => router.push("/checkout")}
            className="mt-4 w-full bg-[#5C4A2B] text-white py-2 rounded hover:bg-[#4a3b21] transition cursor-pointer"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
