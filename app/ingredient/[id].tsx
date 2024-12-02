import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';

function IngredientDetails() {
  const { query } = useRouter();
  const { data, isLoading, error } = useQuery({
    queryKey: ['product', query.id],
    queryFn: () => fetch(`/api/ingredient?id=${query.id}`).then((res) => res.json()),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Ingredient: {data.product}</h1>
      <p>Quantity: {data.quantity}</p>
      <p>Brand: {data.brand?.name}</p>
      <p>Category: {data.category?.name}</p>
      <p>Description: {data.description || 'No description available'}</p>
    </div>
  );
}

export default IngredientDetails;
