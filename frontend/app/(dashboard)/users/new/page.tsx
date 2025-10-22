// frontend/app/(dashboard)/users/new/page.tsx
"use client";
import DashboardLayout from '../../dashboard/layout';
import UserForm from '@/components/dashboard/UserForm';

export default function NewUserPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Nuevo Usuario</h1>
          <p className="text-gray-600 mt-1">Completa el formulario para crear un nuevo usuario</p>
        </div>
        
        <UserForm />
      </div>
    </DashboardLayout>
  );
}