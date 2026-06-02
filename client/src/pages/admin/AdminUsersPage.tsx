import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUsers, updateUserRole } from '@/services/user.service'
import type { IUser } from '@/services/user.service'
import { DataTable } from '@/components/ui/DataTable'
import { RoleBadge } from '@/components/admin/RoleBadge'
import toast from 'react-hot-toast'

export default function AdminUsersPage() {
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page],
    queryFn: () => getUsers({ page, limit: 10 })
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'user' | 'editor' | 'admin' }) => updateUserRole(userId, role),
    onSuccess: () => {
      toast.success('User role updated')
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: () => {
      toast.error('Failed to update user role')
    }
  })

  const handleRoleChange = (userId: string, newRole: string) => {
    updateRoleMutation.mutate({ userId, role: newRole as 'user' | 'editor' | 'admin' })
  }

  const columns = [
    {
      header: 'Name',
      cell: (item: IUser) => <span className="font-medium">{item.name}</span>
    },
    {
      header: 'Email',
      accessorKey: 'email'
    },
    {
      header: 'Role',
      cell: (item: IUser) => <RoleBadge role={item.role} />
    },
    {
      header: 'Joined',
      cell: (item: IUser) => new Date(item.createdAt).toLocaleDateString()
    },
    {
      header: 'Actions',
      cell: (item: IUser) => (
        <select
          value={item.role}
          onChange={(e) => handleRoleChange(item._id, e.target.value)}
          disabled={updateRoleMutation.isPending}
          className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-md px-2 py-1 text-sm text-[var(--color-on-surface)]"
        >
          <option value="user">User</option>
          <option value="editor">Editor</option>
          <option value="moderator">Moderator</option>
        </select>
      )
    }
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-display-sm font-bold text-[var(--color-on-surface)]">Users Management</h1>
          <p className="text-body-lg text-[var(--color-on-surface-variant)] mt-2">
            View and manage all registered users.
          </p>
        </div>
      </div>

      <div className="elevation-1 rounded-xl p-6">
        <DataTable
          data={data?.data || []}
          columns={columns}
          isLoading={isLoading}
          pagination={{
            page,
            totalPages: data?.pagination.pages || 1,
            onPageChange: setPage
          }}
        />
      </div>
    </div>
  )
}
