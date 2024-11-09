// pages/strain/[id].tsx
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';

function StrainDetails() {
  const { query } = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ['strain', query.id],
    queryFn: () => fetch(`/api/strain?id=${query.id}`).then((res) => res.json())
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Strain: {data.productName}</h1>
      <p>Quantity: {data.quantity}</p>
      <p>Grower: {data.growerName}</p>
      <p>Category: {data.categoryName}</p>
    </div>
  );
}

export default StrainDetails;
