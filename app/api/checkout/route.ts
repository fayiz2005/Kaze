import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

type CartItem = {
  productId: string;
  variantId?: string;
  quantity: number;
};

type OrderRequestBody = {
  fullName: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  paymentMethod: string;
  phone: string; 
  items: CartItem[];
};

export async function POST(req: Request) {
  try {
    const body: OrderRequestBody = await req.json();
    const { fullName, email, address, city, postalCode, paymentMethod, phone, items } = body;


    if (!items?.length) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    const productIds = [...new Set(items.map((item) => item.productId))];
    const variantIds = [...new Set(items.map((item) => item.variantId).filter(Boolean) as string[])];

    const [products, variants] = await Promise.all([
      prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, price: true, stock: true },
      }),
      prisma.productVariant.findMany({
        where: { id: { in: variantIds } },
        select: { id: true, sizeValue: true, stock: true, productId: true },
      }),
    ]);

    const productMap = new Map(products.map((p) => [p.id, p]));
    const variantMap = new Map(variants.map((v) => [v.id, v]));

    let total = 0;

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) throw new Error(`Product not found: ${item.productId}`);

      if (item.variantId) {
        const variant = variantMap.get(item.variantId);
        if (!variant) throw new Error(`Variant not found: ${item.variantId}`);
        if (variant.stock < item.quantity) throw new Error(`Insufficient stock for variant ${variant.sizeValue}`);
      } else {
        if (product.stock < item.quantity) throw new Error(`Insufficient stock for product ${product.name}`);
      }

      total += product.price * item.quantity;
    }

    const createdOrder = await prisma.$transaction(async (tx) => {
      for (const item of items) {
        if (item.variantId) {
          const variant = variantMap.get(item.variantId)!;
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: variant.stock - item.quantity },
          });
        } else {
          const product = productMap.get(item.productId)!;
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: product.stock - item.quantity },
          });
        }
      }
try {
  const order = await prisma.order.create({
    data: {
      fullName,
      email,
      address,
      city,
      postalCode,
      paymentMethod,
      phone,
      total,
      items: {
        create: items.map((item) => {
          const variantConnect = item.variantId ? { connect: { id: item.variantId } } : undefined;
          const productPrice = productMap.get(item.productId)?.price;

          if (productPrice === undefined) {
            console.error(`Product price not found for productId: ${item.productId}`);
            throw new Error(`Missing product price for productId: ${item.productId}`);
          }

          console.log('Creating item:', {
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: productPrice,
          });

          return {
            product: { connect: { id: item.productId } },
            variant: variantConnect,
            quantity: item.quantity,
            price: productPrice,
          };
        }),
      },
    },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
    },
  });

  console.log('Order created successfully:', order);
  return order;
} catch (err) {
  console.error('Error creating order:', err);
  return new NextResponse('Failed to create order: ' + (err as Error).message, { status: 500 });
}

    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const itemList = items
      .map((item) => {
        const product = productMap.get(item.productId);
        const variant = item.variantId ? variantMap.get(item.variantId) : null;
        return `• ${product?.name ?? 'Unknown'}${variant ? ` (${variant.sizeValue})` : ''}, Quantity: ${item.quantity}, Price: $${product?.price.toFixed(2)}`;
      })
      .join('\n');

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Order Confirmation',
      text: `
Thank you for your order, ${fullName}!

Here are your order details:
- Address: ${address}, ${city}, ${postalCode}
- Payment Method: ${paymentMethod}
- Total: $${total.toFixed(2)}

Items:
${itemList}

We’ll notify you when your order ships.

Thanks for shopping with us!
      `,
    });

    return NextResponse.json(createdOrder, { status: 201 });
  } catch (error) {
    console.error('Checkout API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
