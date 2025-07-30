'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addressSchema, checkoutSchema, AddressFormData, CheckoutFormData } from '@/lib/validation'
import { useCart } from '../context/CartContext'

// Sanitize input strings to prevent injection attacks
function sanitize(str: string) {
  return str.replace(/[<>"'`]/g, '').trim()
}

export default function CheckoutPage() {
  const { cart, clearCart } = useCart()
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const cartItemsTotal = cart.reduce((acc, item) => acc + item.quantity, 0)


  const {
    register: registerAddress,
    handleSubmit: handleSubmitAddress,
    formState: { errors: errorsAddress },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
  })

  const {
    setValue: setCheckoutValue,
    watch: watchCheckout,
    formState: { errors: errorsCheckout },
    handleSubmit: handleSubmitCheckout,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: undefined,
      fullName: '',
      email: '',
      address: '',
      city: '',
      postalCode: '',
    },
  })

  const [addressSubmitted, setAddressSubmitted] = useState(false)
  const [placeOrderText, setPlaceOrderText] = useState('Place Order')
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)


  const onSubmitAddress = (data: AddressFormData) => {
    setAddressSubmitted(true)


    Object.entries(data).forEach(([key, value]) => {
      setCheckoutValue(key as keyof CheckoutFormData, value)
    })
  }

  const paymentMethod = watchCheckout('paymentMethod')


  const onPlaceOrder = handleSubmitCheckout(async (data) => {
    if (!addressSubmitted) {
      setStatusMessage({ type: 'error', text: 'Please submit your address first.' })
      return
    }

    if (cart.length === 0) {
      setStatusMessage({ type: 'error', text: 'Your cart is empty.' })
      return
    }

    setPlaceOrderText('Placing Order...')
    setStatusMessage(null)

    const sanitizedData = {
      ...data,
      fullName: sanitize(data.fullName),
      email: sanitize(data.email),
      address: sanitize(data.address),
      city: sanitize(data.city),
      postalCode: sanitize(data.postalCode),
      phone: sanitize(data.phone),
    }


    const orderData = {
      ...sanitizedData,
      items: cart.map((item) => ({
        productId: item.id,
        variantId: item.variantId,
        size: item.sizeValue,
        quantity: item.quantity,
        price: item.price,
      })),
      total: total.toFixed(2),
    }

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        clearCart()
        setPlaceOrderText('Order Placed ✔')
        setStatusMessage({ type: 'success', text: 'Your order has been placed successfully!' })
        setTimeout(() => {
          setPlaceOrderText('Place Order')
          setStatusMessage(null)
          setAddressSubmitted(false)
        }, 3000)
      } else {
        setPlaceOrderText('Place Order')
        setStatusMessage({ type: 'error', text: 'Failed to place your order. Please try again.' })
      }
    } catch (error) {
      setPlaceOrderText('Place Order')
      setStatusMessage({ type: 'error', text: 'An unexpected error occurred. Please try again.' })
      console.error(error)
    }
  })

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          {/* Address form or submitted confirmation */}
          {!addressSubmitted ? (
            <form onSubmit={handleSubmitAddress(onSubmitAddress)} className="space-y-4">
              <input {...registerAddress('fullName')} placeholder="Full Name" className="w-full p-3 border rounded" />
              {errorsAddress.fullName && <p className="text-red-500 text-sm">{errorsAddress.fullName.message}</p>}
              <input {...registerAddress('phone')} placeholder="Phone" className="w-full p-3 border rounded" />
              {errorsAddress.phone && <p className="text-red-500 text-sm">{errorsAddress.phone.message}</p>}

              <input {...registerAddress('email')} placeholder="Email" type="email" className="w-full p-3 border rounded" />
              {errorsAddress.email && <p className="text-red-500 text-sm">{errorsAddress.email.message}</p>}

              <input {...registerAddress('address')} placeholder="Address" className="w-full p-3 border rounded" />
              {errorsAddress.address && <p className="text-red-500 text-sm">{errorsAddress.address.message}</p>}

              <input {...registerAddress('city')} placeholder="City" className="w-full p-3 border rounded" />
              {errorsAddress.city && <p className="text-red-500 text-sm">{errorsAddress.city.message}</p>}

              <input {...registerAddress('postalCode')} placeholder="Postal Code" className="w-full p-3 border rounded" />
              {errorsAddress.postalCode && <p className="text-red-500 text-sm">{errorsAddress.postalCode.message}</p>}

              <button
                type="submit"
                className="w-full bg-[#5C4A2B] text-white py-3 rounded hover:bg-[#4a3b21] transition cursor-pointer"
              >
                Submit Address
              </button>
            </form>
          ) : (
            <button disabled className="w-full bg-[#5C4A2B] text-white py-3 rounded cursor-default">
              Address Submitted ✔
            </button>
          )}

          {/* Payment Method */}
          <div className="mt-6">
            <div className="mb-2 font-semibold">Select Payment Method</div>
            <div className="flex gap-3">
              <button
                type="button"
                disabled
                className="flex-1 py-3 rounded border bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed"
              >
                bKash (Coming Soon)
              </button>
              <button
                type="button"
                disabled
                className="flex-1 py-3 rounded border bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed"
              >
                Rocket (Coming Soon)
              </button>
              <button
                type="button"
                className={`flex-1 py-3 rounded border cursor-pointer ${
                  paymentMethod === 'COD'
                    ? 'bg-[#5C4A2B] text-white border-[#5C4A2B]'
                    : 'bg-white text-black border-gray-300 hover:bg-[#5C4A2B] hover:text-white'
                }`}
                onClick={() => setCheckoutValue('paymentMethod', 'COD', { shouldValidate: true })}
              >
                Cash on Delivery
              </button>
            </div>
            {errorsCheckout.paymentMethod && <p className="text-red-500 text-sm mt-1">{errorsCheckout.paymentMethod.message}</p>}
          </div>

          {/* Place Order Button */}
          <button
            disabled={!addressSubmitted || !paymentMethod}
            onClick={onPlaceOrder}
            className={`mt-6 w-full py-3 rounded text-white transition cursor-pointer ${
              !addressSubmitted || !paymentMethod
                ? 'bg-[#A1865F] cursor-not-allowed'
                : 'bg-[#5C4A2B] hover:bg-[#4a3b21]'
            }`}
          >
            {placeOrderText}
          </button>

          {/* Status Message */}
          {statusMessage && (
            <p className={`mt-4 text-sm ${statusMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {statusMessage.text}
            </p>
          )}
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-1/3 border rounded p-4 flex flex-col gap-4 h-fit">
          <div className="text-gray-500 uppercase tracking-wide font-semibold">Order Summary</div>
          <div className="flex justify-between text-gray-600">
            <div>Items:</div>
            <div>{cartItemsTotal}</div>
          </div>
          <div className="flex justify-between text-gray-600">
            <div>Subtotal:</div>
            <div>${total.toFixed(2)}</div>
          </div>
          <div className="flex justify-between text-gray-600">
            <div>Shipping:</div>
            <div>FREE</div>
          </div>
          <hr />
          <div className="flex justify-between font-semibold text-lg">
            <div>Total:</div>
            <div>{total.toFixed(2)} tk.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
