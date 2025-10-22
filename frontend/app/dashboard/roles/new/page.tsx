"use client";
import DashboardLayout from '../../layout';
import RoleForm from '@/components/dashboard/RoleForm';

export default function NewRolePage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Nuevo Rol</h1>
          <p className="text-gray-600 mt-1">Completa el formulario para crear un nuevo rol</p>
        </div>
        
        <RoleForm />
      </div>
    </DashboardLayout>
  );
}