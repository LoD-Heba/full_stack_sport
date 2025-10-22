// frontend/app/(dashboard)/users/[id]/page.tsx
"use client";
import { use } from 'react';
import DashboardLayout from '../../layout';
import UserForm from '@/components/dashboard/UserForm';

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Editar Usuario</h1>
          <p className="text-gray-600 mt-1">Actualiza la información del usuario</p>
        </div>
        
        <UserForm userId={id} />
      </div>
    </DashboardLayout>
  );
}