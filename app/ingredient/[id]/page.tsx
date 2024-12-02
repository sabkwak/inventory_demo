'use client';

import { useQuery } from '@tanstack/react-query';
import CreateTransactionDialog from '@/app/(dashboard)/_components/CreateTransactionDialog';

export default function IngredientDetails({ params }: { params: { id: string } }) {
  const { id } = params;

  const { data, isLoading, error } = useQuery({
    queryKey: ['ingredient', id],
    queryFn: () => fetch(`/api/ingredient?id=${id}`).then((res) => res.json()),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="container mx-auto py-4">
      <h1 className="text-2xl font-bold">Ingredient: {data.product}</h1>
      <p>Quantity: {data.quantity}</p>
      <p>Brand: {data.brand?.name}</p>
      <p>Category: {data.category?.name}</p>

      {/* Trigger for the CreateTransactionDialog */}
      <div className="mt-4">
        <CreateTransactionDialog
          trigger={<button className="btn btn-primary">Add Transaction</button>}
          type="add" // or "subtract" based on your use case
          defaultProductId={data.id}
        />
      </div>
    </div>
  );
}
