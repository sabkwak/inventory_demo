// app/api/products/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server'; // Example for Clerk authentication

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  // Check if the ID is valid
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  try {
    // Get the authenticated user
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Fetch the product while ensuring it belongs to the logged-in user
    const product = await prisma.product.findFirst({
      where: {
        id: parseInt(id as string, 10),
      },
      include: {
        brand: true,
        category: true,
        unit: true,
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
