import React from 'react'
import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null
  const sizes = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl', xl: 'max-w-6xl' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className={`relative bg-eqms-card border border-eqms-border rounded-xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] overflow-hidden`}>
        <div className="flex items-center justify-between p-4 border-b border-eqms-border">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-eqms-input rounded-lg transition-colors">
            <X size={18} className="text-slate-400" />
          </button>
        </div>
        <div className="overflow-y-auto p-4 max-h-[calc(90vh-60px)]">
          {children}
        </div>
      </div>
    </div>
  )
}
