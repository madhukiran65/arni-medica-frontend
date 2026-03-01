import React, { useState, useEffect } from 'react'
import { Plus, Search, Shield, Building2, Users, Lock } from 'lucide-react'
import { usersAPI } from '../../api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'

export default function Admin() {
  const [tab, setTab] = useState('users')
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateUser, setShowCreateUser] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [uRes, rRes, dRes] = await Promise.allSettled([
        usersAPI.profiles?.list?.(),
        usersAPI.roles?.list?.(),
        usersAPI.departments?.list?.(),
      ])
      if (uRes.status === 'fulfilled' && uRes.value) {
        setUsers(uRes.value.data?.results || uRes.value.data || [])
      }
      if (rRes.status === 'fulfilled' && rRes.value) {
        setRoles(rRes.value.data?.results || rRes.value.data || [])
      }
      if (dRes.status === 'fulfilled' && dRes.value) {
        setDepartments(dRes.value.data?.results || dRes.value.data || [])
      }
    } catch (err) { 
      console.error('Failed to load admin data:', err) 
    } finally { 
      setLoading(false) 
    }
  }

  const handleRegister = async (formData) => {
    try {
      await usersAPI.profiles?.register?.(formData)
      setShowCreateUser(false)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Registration failed')
    }
  }

  if (loading) return <LoadingSpinner message="Loading administration..." />

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Administration</h1>
        <p className="text-slate-400">User management, roles, departments, and system configuration</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-eqms-border pb-3 overflow-x-auto">
        {[
          { id: 'users', icon: Users, label: 'Users' },
          { id: 'roles', icon: Shield, label: 'Roles' },
          { id: 'departments', icon: Building2, label: 'Departments' }
        ].map(t => (
          <button 
            key={t.id} 
            onClick={() => setTab(t.id)} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
              tab === t.id 
                ? 'bg-blue-500/10 text-blue-400' 
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {tab === 'users' && (
        <div>
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-lg font-bold">User Directory</h2>
            <button 
              onClick={() => setShowCreateUser(true)} 
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={16} /> Register User
            </button>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-eqms-border bg-slate-800/50">
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Username</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Employee ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Department</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-eqms-border hover:bg-slate-800/50 transition">
                      <td className="py-3 px-4 font-medium">{u.first_name} {u.last_name}</td>
                      <td className="py-3 px-4 font-mono text-blue-400">{u.username}</td>
                      <td className="py-3 px-4 text-slate-400">{u.email}</td>
                      <td className="py-3 px-4 text-slate-400">{u.employee_id}</td>
                      <td className="py-3 px-4 text-slate-400">{u.department?.name || '—'}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                          u.is_active 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Roles Tab */}
      {tab === 'roles' && (
        <div>
          <h2 className="text-lg font-bold mb-4">Role Management</h2>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-eqms-border bg-slate-800/50">
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Role</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Description</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Permissions</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((r) => (
                    <tr key={r.id} className="border-b border-eqms-border hover:bg-slate-800/50 transition">
                      <td className="py-3 px-4 font-medium flex items-center gap-2">
                        <Shield size={14} className="text-blue-400" />
                        {r.name}
                      </td>
                      <td className="py-3 px-4 text-slate-400">{r.description || '—'}</td>
                      <td className="py-3 px-4 text-slate-400 text-xs">
                        {Object.entries(r)
                          .filter(([k, v]) => k.startsWith('can_') && v)
                          .map(([k]) => k.replace('can_', '').replace(/_/g, ' ').toUpperCase())
                          .join(', ') || 'None'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Departments Tab */}
      {tab === 'departments' && (
        <div>
          <h2 className="text-lg font-bold mb-4">Department Directory</h2>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-eqms-border bg-slate-800/50">
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Department</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Description</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((d) => (
                    <tr key={d.id} className="border-b border-eqms-border hover:bg-slate-800/50 transition">
                      <td className="py-3 px-4 font-medium flex items-center gap-2">
                        <Building2 size={14} className="text-purple-400" />
                        {d.name}
                      </td>
                      <td className="py-3 px-4 text-slate-400">{d.description || '—'}</td>
                      <td className="py-3 px-4 text-slate-400">{d.created_at?.slice(0,10) || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Register User Modal */}
      <Modal isOpen={showCreateUser} onClose={() => setShowCreateUser(false)} title="Register New User" size="lg">
        <RegisterUserForm onSubmit={handleRegister} onCancel={() => setShowCreateUser(false)} />
      </Modal>
    </div>
  )
}

function RegisterUserForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({ 
    first_name: '', 
    last_name: '', 
    username: '', 
    email: '', 
    employee_id: '', 
    password: '' 
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <form 
      onSubmit={e => { e.preventDefault(); onSubmit(form) }} 
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">First Name</label>
          <input 
            value={form.first_name} 
            onChange={e => set('first_name', e.target.value)} 
            className="input-field" 
            required 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Last Name</label>
          <input 
            value={form.last_name} 
            onChange={e => set('last_name', e.target.value)} 
            className="input-field" 
            required 
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
        <input 
          value={form.username} 
          onChange={e => set('username', e.target.value)} 
          className="input-field" 
          required 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
        <input 
          value={form.email} 
          onChange={e => set('email', e.target.value)} 
          type="email" 
          className="input-field" 
          required 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Employee ID</label>
        <input 
          value={form.employee_id} 
          onChange={e => set('employee_id', e.target.value)} 
          className="input-field" 
          placeholder="EMP-001" 
          required 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
        <input 
          value={form.password} 
          onChange={e => set('password', e.target.value)} 
          type="password" 
          className="input-field" 
          required 
          minLength={8} 
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" className="btn-primary flex items-center gap-2">
          <Lock size={16} /> Register User
        </button>
      </div>
    </form>
  )
}
