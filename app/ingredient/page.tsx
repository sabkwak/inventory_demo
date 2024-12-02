'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

function IngredientIndex() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['products'], // Use a descriptive key
    queryFn: () => fetch('/api/ingredient').then((res) => res.json()), // Adjust endpoint if necessary
  });

  if (isLoading) return <div>Loading ingredients...</div>;
  if (error) return <div>Error loading ingredients: {error.message}</div>;

  return (
    <div>
      <h1>Ingredient List</h1>
      <ul>
        {data.map((product: { id: number; product: string }) => (
          <li key={product.id}>
            <Link href={`/ingredient/${product.id}`}>
              {product.product}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default IngredientIndex;
