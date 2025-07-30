import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { z } from 'zod';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// Variant schema
const variantSchema = z.object({
  sizeType: z.enum(['STANDARD', 'WAIST']),
  sizeValue: z.string().min(1),
  stock: z.coerce.number().int().gte(0).transform(n => n.toString()), // converted to string for consistency
});


// Product schema with variants (required)
const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)), { message: "Invalid price" }),
  stock: z
    .string()
    .refine((val) => !isNaN(parseInt(val)), { message: "Invalid stock" }),
  categoryId: z.string().min(1, "Category ID is required"),
  variants: z
    .array(variantSchema)
    .min(1, "At least one variant is required"), // ✅ required
});



export async function GET() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      variants: true,  // include variants
    },
  });
  return NextResponse.json(products);
}

// POST create product with variants
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    console.log('--- Raw FormData ---');
for (const [key, value] of formData.entries()) {
  console.log(key, value);
}

    const rawData = {
      name: formData.get('name'),
      description: formData.get('description'),
      price: formData.get('price'),
      stock: formData.get('stock'),
      categoryId: formData.get('categoryId'),
      variants: formData.get('variants'), // expected to be JSON string
    };

    // Parse variants JSON if present
    let variantsParsed = [];
    if (rawData.variants && typeof rawData.variants === 'string') {
      try {
        variantsParsed = JSON.parse(rawData.variants);
      } catch {
        return NextResponse.json({ error: "Invalid variants JSON" }, { status: 400 });
      }
    }

    // Override variants in rawData for zod validation
    const parsed = productSchema.safeParse({ ...rawData, variants: variantsParsed });

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { name, description, price, stock, categoryId, variants } = parsed.data;

    // Validate image
    const file = formData.get('image') as File | null;

    if (!file || !file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Valid image file is required" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: 'products' }, (error, result) => {
        if (error || !result) return reject(error);
        resolve(result as { secure_url: string });
      }).end(buffer);
    });

    // Create product with variants inside a transaction
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        categoryId,
        image: uploadResult.secure_url,
        variants: variants && variants.length > 0 ? {
          create: variants.map((v: any) => ({
            sizeType: v.sizeType,
            sizeValue: v.sizeValue,
            stock: parseInt(v.stock),
          })),
        } : undefined,
      },
      include: {
        category: true,
        variants: true,
      },
    });

    return NextResponse.json(product);
  } catch (error: any) {
    console.error('POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    console.log("Delete request body:", body);

    const { id } = body;

    const deleted = await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json(deleted);
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
