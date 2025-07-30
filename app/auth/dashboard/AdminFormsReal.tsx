'use client'

import { useEffect, useState } from 'react'
import { z } from 'zod'

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
})




const variantStockSchema = z.record(z.string(), z.number().int().gte(0)); // e.g. { XS: 10, S: 5 }

const variantSchema = z.object({
  sizeType: z.enum(['STANDARD', 'WAIST']),
  sizeValue: z.string().min(1),
  stock: z.number().int().gte(0),
});

export const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.coerce.number().gt(0),
  stock: z.coerce.number().int().gte(0),
  categoryId: z.string().uuid(),
  images: z.any().nullable(),
  sizeType: z.enum(['STANDARD', 'WAIST']),
  variants: z.array(variantSchema).min(1, "At least one variant is required"),
});



export default function AdminFormsReal() {
  const [categories, setCategories] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [catSuccess, setCatSuccess] = useState(false)
  const [prodSuccess, setProdSuccess] = useState(false)
  const [categoryData, setCategoryData] = useState({ name: '' })
  const [categoryErrors, setCategoryErrors] = useState({ name: '' })
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [showCategories, setShowCategories] = useState(false)
  const [showProducts, setShowProducts] = useState(false)
  const [showOrders, setShowOrders] = useState(false)
  const [SizeType, SetSizeType]=useState("");
  

 
const standardSizes = ['XS', 'S', 'M', 'L', 'XL'];
const waistSizes = ['28', '30', '32', '34', '36'];

const [standardSizesStock, setStandardSizesStock] = useState<Record<string, number>>(
  standardSizes.reduce((acc, size) => {
    acc[size] = 0;
    return acc;
  }, {} as Record<string, number>)
);

const handleToggleSent = async (orderId: string, sentAt: number) => {
  try {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sentAt }), // send timestamp
    });

    if (!res.ok) throw new Error('Failed to toggle isSent');

    // Optimistically update UI
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId
          ? { ...order, isSent: !order.isSent, sentAt }
          : order
      )
    );
  } catch (error) {
    console.error('Failed to toggle isSent:', error);
  }
};




const [waistSizesStock, setWaistSizesStock] = useState<Record<string, number>>(
  waistSizes.reduce((acc, size) => {
    acc[size] = 0;
    return acc;
  }, {} as Record<string, number>)
);

const totalVariantStock = (
  SizeType === 'STANDARD'
    ? Object.values(standardSizesStock)
    : Object.values(waistSizesStock)
).reduce((sum, val) => sum + val, 0);


const variantsToSubmit =
  SizeType === 'STANDARD'
    ? Object.entries(standardSizesStock)
        .filter(([_, stock]) => stock > 0)
        .map(([sizeValue, stock]) => ({
          sizeType: 'STANDARD',
          sizeValue,
          stock,
        }))
    : Object.entries(waistSizesStock)
        .filter(([_, stock]) => stock > 0)
        .map(([sizeValue, stock]) => ({
          sizeType: 'WAIST',
          sizeValue,
          stock,
        }));

  
const handleStandardSizeStockChange = (size: string, value: string) => {
  const parsed = parseInt(value, 10);
  if (!isNaN(parsed) && parsed >= 0) {
    setStandardSizesStock((prev) => ({ ...prev, [size]: parsed }));
  }
};

const handleWaistSizeStockChange = (size: string, value: string) => {
  const parsed = parseInt(value, 10);
  if (!isNaN(parsed) && parsed >= 0) {
    setWaistSizesStock((prev) => ({ ...prev, [size]: parsed }));
  }
};


type ProductData = {
  name: string;
  description: string;
  price: number | string;
  stock: number | string;
  categoryId: string;
  images: File | null;
  sizeType: 'STANDARD' | 'WAIST';
  variants: { sizeType: string; sizeValue: string; stock: number }[];  // array now
};

const [productData, setProductData] = useState<ProductData>({
  name: '',
  description: '',
  price: '',
  stock: '',
  categoryId: '',
  images: null,
  sizeType: 'STANDARD',
  variants: [],  // start with empty array
});


  const [productErrors, setProductErrors] = useState<any>({})



  const fetchCategories = async () => {
    const res = await fetch('/api/categories')
    const data = await res.json()
    setCategories(data)
  }

  const fetchProducts = async () => {
    const res = await fetch('/api/products')
    const data = await res.json()
    setProducts(data)
  }

  const fetchOrders = async () => {
  setOrdersLoading(true);
  setOrdersError(null);
  try {
    const res = await fetch('/api/orders');
    if (!res.ok) throw new Error('Failed to fetch orders');
    const data = await res.json();
    setOrders(data);
  } catch (err) {
    setOrdersError(err instanceof Error ? err.message : 'Unknown error');
  } finally {
    setOrdersLoading(false);
  }
};

useEffect(() => {
  fetchOrders();
}, []);
  useEffect(() => {
    fetchCategories()
  }, [catSuccess])

  useEffect(() => {
    fetchProducts()
  }, [prodSuccess])



const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCategoryData({ ...categoryData, [e.target.name]: e.target.value })
  }

const handleProductChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
) => {
  const { name, value } = e.target;

if (name === 'images' && e.target instanceof HTMLInputElement) {
  const files = e.target.files;
  if (files && files.length > 0) {
    setProductData({ ...productData, images: files[0] });
  }
  } else {
    setProductData({ ...productData, [name]: value });
  }
};


  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = categorySchema.safeParse(categoryData)
    if (!result.success) {
      setCategoryErrors({ name: result.error.flatten().fieldErrors.name?.[0] || '' })
      return
    }
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.data),
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to create category')
      }
      setCatSuccess(!catSuccess)
      setCategoryData({ name: '' })
      setCategoryErrors({ name: '' })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Unexpected error')
    }
  }

const handleProductSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const dataToValidate = {
  ...productData,
  stock: totalVariantStock,
  variants: variantsToSubmit,
};

const result = productSchema.safeParse(dataToValidate);

  if (!result.success) {
    setProductErrors(result.error.flatten().fieldErrors);
    return;
  }

const formData = new FormData();
formData.append('name', dataToValidate.name);
formData.append('description', dataToValidate.description);
formData.append('price', dataToValidate.price.toString());
formData.append('stock', dataToValidate.stock.toString());
formData.append('categoryId', dataToValidate.categoryId);
formData.append('sizeType', dataToValidate.sizeType);
formData.append('variants', JSON.stringify(dataToValidate.variants));
if (dataToValidate.images) {
  formData.append('image', dataToValidate.images);
}

  const res = await fetch('/api/products', {
    method: 'POST',
    body: formData,
  });

  if (res.ok) {
    setProdSuccess(!prodSuccess);
    setProductData({
      name: '',
      description: '',
      price: '',
      stock: '',
      categoryId: '',
      images: null,
      sizeType: 'STANDARD', 
      variants: [], 
    });
    setProductErrors({});
  }
};


  const handleDeleteProduct = async (id: string) => {
    try {
      await fetch('/api/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      fetchProducts()
    } catch (error) {
      console.error('Failed to delete product:', error)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    await fetch('/api/categories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchCategories()
  }


async function handleVariantStockChange(productId: string, variantIndex: number, value: string) {
  const newStock = parseInt(value, 10);
  if (isNaN(newStock) || newStock < 0) return;

  let variantIdToUpdate: string | undefined;

  // Update local state and grab variantId from updated product
  setProducts((prevProducts) =>
    prevProducts.map((product) => {
      if (product.id === productId) {
        const updatedVariants = product.variants.map((variant: any, i: number) => {
          if (i === variantIndex) {
            variantIdToUpdate = variant.id; // capture variantId
            return { ...variant, stock: newStock };
          }
          return variant;
        });
        return { ...product, variants: updatedVariants };
      }
      return product;
    })
  );

  // If variantId is not found, stop
  if (!variantIdToUpdate) return;

  // Call backend API to update DB
  try {
    const res = await fetch('/api/products/variant-stock', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, variantId: variantIdToUpdate, stock: newStock }),
    });

    if (!res.ok) {
      console.error('Failed to update variant stock on server');
    }
  } catch (err) {
    console.error('Error updating variant stock:', err);
  }
}

  return (
    <div className="space-y-10">
      <div className="p-6 max-w-md border rounded">
        <h2 className="text-xl font-bold mb-4">Create Category</h2>
        <form onSubmit={handleCategorySubmit} className="space-y-4">
          <input
            name="name"
            value={categoryData.name}
            onChange={handleCategoryChange}
            placeholder="Category Name"
            className="w-full border px-3 py-2 rounded"
          />
          {categoryErrors.name && <p className="text-red-500 text-sm">{categoryErrors.name}</p>}
          <button className="bg-[#5C4A2B] text-white px-4 py-2 rounded cursor-pointer" type="submit">
            Create
          </button>
          {catSuccess && <p className="text-green-600">Category created!</p>}
        </form>
      </div>

      <div className="p-6 max-w-md border rounded">
        <h2 className="text-xl font-bold mb-4">Create Product</h2>
        <form onSubmit={handleProductSubmit} className="space-y-4" encType="multipart/form-data">
          <input
            name="name"
            value={productData.name}
            onChange={handleProductChange}
            placeholder="Product Name"
            className="w-full border px-3 py-2 rounded"
          />
          {productErrors.name && <p className="text-red-500 text-sm">{productErrors.name}</p>}

          <textarea
            name="description"
            value={productData.description}
            onChange={handleProductChange}
            placeholder="Description"
            className="w-full border px-3 py-2 rounded"
          />
          {productErrors.description && <p className="text-red-500 text-sm">{productErrors.description}</p>}

          <input
            type="number"
            name="price"
            value={productData.price}
            onChange={handleProductChange}
            placeholder="Price"
            className="w-full border px-3 py-2 rounded"
          />
          {productErrors.price && <p className="text-red-500 text-sm">{productErrors.price}</p>}


          <select
            name="categoryId"
            value={productData.categoryId}
            onChange={handleProductChange}
            className="w-full border px-3 py-2 rounded cursor-pointer"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {productErrors.categoryId && <p className="text-red-500 text-sm">{productErrors.categoryId}</p>}
            <div>
            <div className="flex gap-4 mb-4">
            <button
              type="button"
              onClick={() => {
                SetSizeType("STANDARD");

              }}
              className={`px-4 py-2 rounded border cursor-pointer ${
                SizeType === "STANDARD" ? "bg-[#5C4A2B] text-white" : "bg-white text-[#5C4A2B]"
              }`}
            >
              STANDARD
            </button>
            <button
              type="button"
              onClick={() => {
                SetSizeType("WAIST");

              }
            }
              className={`px-4 py-2 rounded border cursor-pointer ${
                SizeType === "WAIST" ? "bg-[#5C4A2B] text-white" : "bg-white text-[#5C4A2B]"
              }`}
            >
              WAIST
            </button>
        {productErrors.variants && (
          <p className="text-red-500 text-sm">{productErrors.variants[0]}</p>
        )}
            
          </div>



          <div>
            {SizeType === 'STANDARD' && (
              <div className="space-y-2 mb-4">
                <label className="block font-medium mb-2">Stock per Size (STANDARD)</label>
                {standardSizes.map((size) => (
                  <div key={size} className="flex items-center gap-4">
                    <span className="w-10">{size}</span>
                    <input
                      type="number"
                      min={0}
                      value={standardSizesStock[size]}
                      onChange={(e) => handleStandardSizeStockChange(size, e.target.value)}
                      className="border px-2 py-1 rounded w-20"
                    />
                  </div>
                ))}
              </div>
            )}

            {SizeType === 'WAIST' && (
              <div className="space-y-2 mb-4">
                <label className="block font-medium mb-2">Stock per Size (WAIST)</label>
                {waistSizes.map((size) => (
                  <div key={size} className="flex items-center gap-4">
                    <span className="w-16">{size}</span>
                    <input
                      type="number"
                      min={0}
                      value={waistSizesStock[size]}
                      onChange={(e) => handleWaistSizeStockChange(size, e.target.value)}
                      className="border px-2 py-1 rounded w-20"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>


              <input
                id="imageUpload"
                type="file"
                name="images"
                accept="image/*"
                required
                className="hidden"
                onChange={handleProductChange}
              />

            <label
              htmlFor="imageUpload"
              className="cursor-pointer inline-block px-6 py-2 bg-[#5C4A2B] text-white font-medium rounded-md shadow hover:bg-[#4a3b21] transition-colors duration-300"
            >
              Upload Image
            </label>

            </div>
          {productErrors.images && <p className="text-red-500 text-sm">{productErrors.images}</p>}

          <button className="bg-[#5C4A2B] text-white px-4 py-2 rounded cursor-pointer" type="submit">
            Create
          </button>
          {prodSuccess && <p className="text-green-600">Product created!</p>}
        </form>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setShowCategories((v) => !v)}
          className="bg-[#5C4A2B] text-white px-4 py-2 rounded cursor-pointer"
        >
          {showCategories ? 'Hide Categories' : 'Show Categories'}
        </button>
        <button
          onClick={() => setShowProducts((v) => !v)}
          className="bg-[#5C4A2B] text-white px-4 py-2 rounded cursor-pointer"
        >
          {showProducts ? 'Hide Products' : 'Show Products'}
        </button>
        <button
          onClick={() => setShowOrders((v) => !v)}
          className="bg-[#5C4A2B] text-white px-4 py-2 rounded cursor-pointer"
        >
          {showOrders ? 'Hide Orders' : 'Show Orders'}
        </button>
      </div>

      {/* Conditionally rendered tables */}

      {showCategories && (
        <div className="p-6 border rounded">
          <h2 className="text-xl font-bold mb-4">All Categories</h2>
          <ul className="list-disc pl-5 space-y-2">
            {categories.map((cat) => (
              <li key={cat.id} className="flex justify-between items-center">
                {cat.name}
                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="text-red-600 hover:underline text-sm cursor-pointer"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showProducts && (
        <div className="p-6 border rounded overflow-x-auto">
          <h2 className="text-xl font-bold mb-4">All Products</h2>
          <table className="min-w-[600px] w-full text-left border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-b p-2">Name</th>
                <th className="border-b p-2">Description</th>
                <th className="border-b p-2">Price</th>
                <th className="border-b p-2">Sizes</th>
                <th className="border-b p-2">Category</th>
                <th className="border-b p-2">Delete</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod: any) => (
                <tr key={prod.id}>
                  <td className="border-b p-2">{prod.name}</td>
                  <td className="border-b p-2">{prod.description}</td>
                  <td className="border-b p-2">{Number(prod.price).toFixed(2)} tk.</td>
                  <td className="border-b p-2">
                  {prod.variants.map((variant: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 mb-1">
                      <label className="w-12 text-sm font-medium">
                        {variant.sizeType === 'WAIST'
                          ? variant.sizeValue.replace('/', ' / ')
                          : variant.sizeValue}
                      </label>
                      <input
                        type="number"
                        min={0}
                        className="w-16 border rounded px-1 py-0.5 text-sm"
                        value={variant.stock}
                        onChange={(e) => handleVariantStockChange(prod.id, i, e.target.value)}
                      />
                    </div>
                      ))}

                </td>

                  <td className="border-b p-2">{prod.category?.name || prod.categoryId}</td>
                  <td className="border-b p-2">
                    <button
                      onClick={() => handleDeleteProduct(prod.id)}
                      className="text-red-600 hover:underline cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

{showOrders && (
  <div className="p-6 border rounded overflow-x-auto">
    <h2 className="text-xl font-bold mb-4">All Orders</h2>

    {ordersLoading && <p>Loading orders...</p>}
    {ordersError && <p className="text-red-600">Error: {ordersError}</p>}

    {!ordersLoading && !ordersError && (
      <table className="min-w-[1100px] w-full text-left border-collapse text-sm">
        <thead>
          <tr>
            <th className="border-b p-2">Sent</th>
            <th className="border-b p-2">Name</th>
            <th className="border-b p-2">Email</th>
            <th className="border-b p-2">phone no.</th>
            <th className="border-b p-2">Address</th>
            <th className="border-b p-2">City</th>
            <th className="border-b p-2">Postal Code</th>
            <th className="border-b p-2">Payment Method</th>
            <th className="border-b p-2">Items</th>
            <th className="border-b p-2">Total</th>
            <th className="border-b p-2">Date</th>

          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="border-b p-2 text-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={order.isSent}
                  onChange={() => handleToggleSent(order.id, Date.now())}

                />
              </td>
              <td className="border-b p-2">{order.fullName}</td>
              <td className="border-b p-2">{order.email}</td>
              <td className="border-b p-2">{order.phone}</td>
              <td className="border-b p-2">{order.address}</td>

              <td className="border-b p-2">{order.city}</td>
              <td className="border-b p-2">{order.postalCode}</td>
              <td className="border-b p-2">{order.paymentMethod}</td>
              <td className="border-b p-2">
                <ul className="list-disc list-inside space-y-1">
                  {order.items.map((item: any, index: number) => (
                    <li key={index}>
                      <div>
                        <span className="font-medium">{item.product.name}</span> — 
                        Qty: {item.quantity} — Price: {item.product.price} tk
                      </div>
                      {item.variant && (
                        <div className="text-xs text-gray-600">
                          Size: {item.variant.sizeValue}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </td>
              <td className="border-b p-2">{Number(order.total).toFixed(2)} tk.</td>
              <td className="border-b p-2">{new Date(order.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
        </div>
      )}
    </div>
  )

}