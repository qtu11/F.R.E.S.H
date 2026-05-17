import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(['All', 'Bakery', 'Fast Food', 'Vegetables', 'Fruits', 'Frozen', 'Beverages', 'Dairy', 'Meals', 'Snacks']);
}
