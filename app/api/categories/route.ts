import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
})

const deleteSchema = z.object({
  id: z.string().uuid('Invalid category ID'),
})

export async function GET() {

  try {
    const categories = await prisma.category.findMany()
    return NextResponse.json(categories)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(req: Request) {
const session = await getServerSession(authOptions);

if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

  try {
    const body = await req.json()
    const parsed = categorySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const category = await prisma.category.create({
      data: { name: parsed.data.name },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Error creating category' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
const session = await getServerSession(authOptions);

if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

  try {
    const body = await req.json()
    const parsed = deleteSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const deleted = await prisma.category.delete({
      where: { id: parsed.data.id },
    })

    return NextResponse.json(deleted)
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting category' }, { status: 500 })
  }
}
