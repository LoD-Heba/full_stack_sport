// frontend/app/api/products/route.ts

import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// GET /api/products - Obtener todos los productos
export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${API_URL}/products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.message || 'Error al obtener productos' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en GET /api/products:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/products - Crear un nuevo producto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.message || 'Error al crear producto' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error en POST /api/products:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}