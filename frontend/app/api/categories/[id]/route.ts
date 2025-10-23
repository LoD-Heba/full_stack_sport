// frontend/app/api/categories/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// GET /api/categories/[id] - Obtener una categoría por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${API_URL}/categories/${params.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.message || 'Error al obtener categoría' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error en GET /api/categories/${params.id}:`, error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PATCH /api/categories/[id] - Actualizar una categoría
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const response = await fetch(`${API_URL}/categories/${params.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.message || 'Error al actualizar categoría' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error en PATCH /api/categories/${params.id}:`, error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] - Eliminar una categoría
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${API_URL}/categories/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.message || 'Error al eliminar categoría' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error en DELETE /api/categories/${params.id}:`, error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}