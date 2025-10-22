// GET /api/roles/[id] - Obtener un rol por ID
import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
export async function GET_BY_ID(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${API_URL}/roles/${params.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.message || "Error al obtener rol" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error en GET /api/roles/${params.id}:`, error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PATCH /api/roles/[id] - Actualizar un rol
export async function PATCH_BY_ID(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const response = await fetch(`${API_URL}/roles/${params.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.message || "Error al actualizar rol" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error en PATCH /api/roles/${params.id}:`, error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE /api/roles/[id] - Eliminar un rol
export async function DELETE_BY_ID(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${API_URL}/roles/${params.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.message || "Error al eliminar rol" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error en DELETE /api/roles/${params.id}:`, error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
