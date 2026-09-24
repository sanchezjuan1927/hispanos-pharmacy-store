import { NextResponse } from 'next/server';
import { gate } from './lib/gate.js';

// Whole store is private until launch. To open the storefront to customers,
// narrow the matcher to '/admin/:path*' (the orders panel also has its own Supabase login).
export async function proxy(request) {
  return (await gate(request, { title: 'Hispanos Pharmacy · Tienda' })) ?? NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
