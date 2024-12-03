'use client';

import { useQuery } from '@tanstack/react-query';
import QRTransactionDialog from '@/app/(dashboard)/_components/QRTransactionDialog';
import { useRouter } from 'next/navigation';  // Import useRouter hook

export default function IngredientDetails({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();  // Initialize router for navigation

  const { data, isLoading, error } = useQuery({
    queryKey: ['ingredient', id],
    queryFn: () => fetch(`/api/ingredient?id=${id}`).then((res) => res.json()),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // Handle going back to the /inventory page
  const handleBackToInventory = () => {
    router.push('/inventory');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-smoke-light flex text-black">
      <div className="relative p-4 w-full max-w-md m-auto flex-col flex bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-between pb-3">
          <h1 className="text-lg font-semibold text-black">Ingredient Details</h1>
          {/* Add a back button */}
          <button
            onClick={handleBackToInventory}
            className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-700"
          >
            Back to Inventory
          </button>
        </div>
        <div className="mb-4">
          <h2 className="text-xl font-bold">Ingredient: {data.product}</h2>
          <p className="text-sm">
            <strong>Quantity:</strong> {data.quantity} {data.unit?.name ? data.unit?.name : ''}
          </p>
          <p className="text-sm">
            <strong>Brand:</strong> {data.brand?.name || 'None'}
          </p>
          <p className="text-sm">
            <strong>Category:</strong> {data.category?.name || 'None'}
          </p>
        </div>
        <div className="flex flex-col items-center gap-4 mt-4">
          {/* Add Transaction */}
          <QRTransactionDialog
            trigger={
              <button className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded hover:bg-green-700">
                Add Transaction
              </button>
            }
            type="add"
            defaultProductId={data.id}
          />
          {/* Subtract Transaction */}
          <QRTransactionDialog
            trigger={
              <button className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded hover:bg-red-700">
                Subtract Transaction
              </button>
            }
            type="subtract"
            defaultProductId={data.id}
          />
        </div>
      </div>
    </div>
  );
}
