import RoleForm from '@/components/dashboard/RoleForm';
import { use } from 'react';
import DashboardLayout from '../../dashboard/layout';

export default function EditRolePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Editar Rol</h1>
          <p className="text-gray-600 mt-1">Actualiza la información del rol</p>
        </div>
        
        <RoleForm roleId={id} />
      </div>
    </DashboardLayout>
  );
}