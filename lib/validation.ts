import { z } from "zod";

export const addressSchema = z.object({
  fullName: z.string().min(1, "Full Name is required"),
  email: z.string().email("Invalid email"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(1, "Postal Code is required"),
  phone: z.string().min(11, 'Phone is required'),
});

export const checkoutSchema = addressSchema.extend({
  paymentMethod: z.enum(["COD"], "Payment method is required"),
});

export type AddressFormData = z.infer<typeof addressSchema>;
export type CheckoutFormData = z.infer<typeof checkoutSchema>;
