// pages/ingredient/[id].tsx
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';

function IngredientDetails() {
  const { query } = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ['ingredient', query.id],
    queryFn: () => fetch(`/api/ingredient?id=${query.id}`).then((res) => res.json())
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Ingredient: {data.productName}</h1>
      <p>Quantity: {data.quantity}</p>
      <p>Brand: {data.brandName}</p>
      <p>Unit: {data.unitName}</p>
    </div>
  );
}

export default IngredientDetails;
