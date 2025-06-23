import { NextResponse } from "next/server";

// Sample data for testing analytics dashboard
export async function GET() {
  const sampleData = {
    // Sample brands (keeping schema naming but will display as ingredient brands)
    brands: [
      { id: 1, name: "Organic Valley", createdAt: new Date() },
      { id: 2, name: "Fresh Farms", createdAt: new Date() },
      { id: 3, name: "Local Harvest", createdAt: new Date() },
      { id: 4, name: "Premium Foods", createdAt: new Date() },
    ],
    
    // Sample categories
    categories: [
      { id: 1, name: "Vegetables", createdAt: new Date() },
      { id: 2, name: "Fruits", createdAt: new Date() },
      { id: 3, name: "Grains", createdAt: new Date() },
      { id: 4, name: "Dairy", createdAt: new Date() },
      { id: 5, name: "Spices", createdAt: new Date() },
    ],
    
    // Sample units
    units: [
      { id: 1, name: "lbs", createdAt: new Date() },
      { id: 2, name: "oz", createdAt: new Date() },
      { id: 3, name: "kg", createdAt: new Date() },
      { id: 4, name: "pieces", createdAt: new Date() },
      { id: 5, name: "cups", createdAt: new Date() },
    ],
    
    // Sample products (ingredients)
    products: [
      {
        id: 1,
        product: "Organic Tomatoes",
        brandId: 1,
        categoryId: 1,
        unitId: 1,
        quantity: 25,
        value: 75,
        description: "Fresh organic tomatoes",
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        id: 2,
        product: "Fresh Spinach",
        brandId: 1,
        categoryId: 1,
        unitId: 1,
        quantity: 8,
        value: 24,
        description: "Baby spinach leaves",
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      },
      {
        id: 3,
        product: "Honey Crisp Apples",
        brandId: 2,
        categoryId: 2,
        unitId: 1,
        quantity: 45,
        value: 90,
        description: "Sweet and crisp apples",
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      },
      {
        id: 4,
        product: "Whole Wheat Flour",
        brandId: 3,
        categoryId: 3,
        unitId: 1,
        quantity: 3,
        value: 12,
        description: "Stone ground whole wheat flour",
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      },
      {
        id: 5,
        product: "Organic Milk",
        brandId: 4,
        categoryId: 4,
        unitId: 3,
        quantity: 0,
        value: 0,
        description: "Fresh organic whole milk",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        id: 6,
        product: "Black Pepper",
        brandId: 3,
        categoryId: 5,
        unitId: 2,
        quantity: 2,
        value: 8,
        description: "Freshly ground black pepper",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        id: 7,
        product: "Organic Carrots",
        brandId: 1,
        categoryId: 1,
        unitId: 1,
        quantity: 15,
        value: 30,
        description: "Fresh organic carrots",
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      },
      {
        id: 8,
        product: "Fresh Basil",
        brandId: 2,
        categoryId: 5,
        unitId: 2,
        quantity: 6,
        value: 18,
        description: "Fresh basil leaves",
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      },
    ],
    
    // Sample transactions
    transactions: generateSampleTransactions(),
  };
  
  return NextResponse.json(sampleData);
}

function generateSampleTransactions() {
  const transactions = [];
  const productIds = [1, 2, 3, 4, 5, 6, 7, 8];
  const types = ['add', 'subtract'];
  
  // Generate transactions for the last 30 days
  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    
    transactions.push({
      id: i + 1,
      productId: productIds[Math.floor(Math.random() * productIds.length)],
      amount: Math.floor(Math.random() * 10) + 1,
      type: types[Math.floor(Math.random() * types.length)],
      date,
      price: Math.floor(Math.random() * 20) + 5,
      description: `Sample ${types[Math.floor(Math.random() * types.length)]} transaction`,
      createdAt: date,
      updatedAt: date,
    });
  }
  
  return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
} 