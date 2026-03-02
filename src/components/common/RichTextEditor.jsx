import React, { useCallback, useMemo, useState, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import Highlight from '@tiptap/extension-highlight'
import FontFamily from '@tiptap/extension-font-family'
import Color from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import sanitizeHtml from 'sanitize-html'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  CheckSquare,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Table as TableIcon,
  Highlighter,
  Undo2,
  Redo2,
  Image as ImageIcon,
  Minus,
  Type,
  ChevronDown,
} from 'lucide-react'
import '../../styles/tiptap.css'

const FONTS = [
  { label: 'Calibri', value: 'Calibri' },
  { label: 'Arial', value: 'Arial' },
  { label: 'Times New Roman', value: '"Times New Roman"' },
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Verdana', value: 'Verdana' },
  { label: 'Courier New', value: '"Courier New"' },
]

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 36, 48, 72]

const COLORS = [
  '#1a1a1a', '#ffffff', '#ff0000', '#00b050', '#0070c0', '#ffc000',
  '#92d050', '#00b0f0', '#7030a0', '#ff6600', '#00b4d8', '#90ee90',
]

const RichTextEditor = React.forwardRef(({
  value = '',
  onChange,
  placeholder = 'Start typing...',
  onSave,
  readOnly = false,
  initialContent,
}, ref) => {
  const [activeTab, setActiveTab] = useState('home')
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [pageCount, setPageCount] = useState(1)
  const [fontFamily, setFontFamily] = useState('Calibri')
  const [fontSize, setFontSize] = useState(11)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Link.configure({
        openOnClick: false,
      }),
      Highlight.configure({
        multicolor: true,
      }),
      FontFamily.configure({
        types: ['textStyle'],
      }),
      Color.configure({
        types: ['textStyle'],
      }),
      TextStyle.configure({
        types: ['textStyle'],
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      HorizontalRule,
    ],
    content: initialContent || value,
    onUpdate: ({ editor }) => {
      if (onChange) {
        const html = editor.getHTML()
        const sanitized = sanitizeHtml(html, {
          allowedTags: ['p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'a', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'mark', 'span', 'hr'],
          allowedAttributes: {
            a: ['href', 'target'],
            mark: ['data-color'],
            table: [],
            thead: [],
            tbody: [],
            tr: [],
            th: ['colspan', 'rowspan'],
            td: ['colspan', 'rowspan'],
            span: ['style'],
          },
        })
        onChange(sanitized)
      }

      // Update word/char count
      const text = editor.getText()
      const words = text.trim().split(/\s+/).filter(w => w.length > 0).length
      const chars = text.length
      setWordCount(text.trim() ? words : 0)
      setCharCount(chars)
    },
    editable: !readOnly,
  })

  React.useImperativeHandle(ref, () => ({
    getEditor: () => editor,
    getHTML: () => editor?.getHTML() || '',
    setHTML: (html) => editor?.commands.setContent(html),
    focus: () => editor?.view.focus(),
  }))

  if (!editor) {
    return <div className="animate-pulse bg-slate-300 rounded-lg h-96" />
  }

  // Toolbar handlers
  const handleToggleBold = useCallback(() => editor.chain().focus().toggleBold().run(), [editor])
  const handleToggleItalic = useCallback(() => editor.chain().focus().toggleItalic().run(), [editor])
  const handleToggleUnderline = useCallback(() => editor.chain().focus().toggleUnderline().run(), [editor])
  const handleToggleStrike = useCallback(() => editor.chain().focus().toggleStrike().run(), [editor])
  const handleSetH1 = useCallback(() => editor.chain().focus().toggleHeading({ level: 1 }).run(), [editor])
  const handleSetH2 = useCallback(() => editor.chain().focus().toggleHeading({ level: 2 }).run(), [editor])
  const handleSetH3 = useCallback(() => editor.chain().focus().toggleHeading({ level: 3 }).run(), [editor])
  const handleToggleBullet = useCallback(() => editor.chain().focus().toggleBulletList().run(), [editor])
  const handleToggleOrdered = useCallback(() => editor.chain().focus().toggleOrderedList().run(), [editor])
  const handleAlignLeft = useCallback(() => editor.chain().focus().setTextAlign('left').run(), [editor])
  const handleAlignCenter = useCallback(() => editor.chain().focus().setTextAlign('center').run(), [editor])
  const handleAlignRight = useCallback(() => editor.chain().focus().setTextAlign('right').run(), [editor])
  const handleAlignJustify = useCallback(() => editor.chain().focus().setTextAlign('justify').run(), [editor])
  
  const handleSetFontFamily = useCallback((font) => {
    setFontFamily(font)
    editor.chain().focus().setFontFamily(font).run()
  }, [editor])

  const handleSetFontSize = useCallback((size) => {
    setFontSize(size)
    editor.chain().focus().setMark('textStyle', { fontSize: `${size}pt` }).run()
  }, [editor])

  const handleSetColor = useCallback((color) => {
    editor.chain().focus().setColor(color).run()
  }, [editor])

  const handleSetHighlight = useCallback((color) => {
    editor.chain().focus().toggleHighlight({ color }).run()
  }, [editor])

  const handleAddLink = useCallback(() => {
    const url = window.prompt('Enter URL:')
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
  }, [editor])

  const handleInsertTable = useCallback(() => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }, [editor])

  const handleInsertImage = useCallback(() => {
    const url = window.prompt('Enter image URL:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  const handleInsertHorizontalRule = useCallback(() => {
    editor.chain().focus().setHorizontalRule().run()
  }, [editor])

  const handleUndo = useCallback(() => editor.chain().focus().undo().run(), [editor])
  const handleRedo = useCallback(() => editor.chain().focus().redo().run(), [editor])

  const RibbonButton = ({ onClick, isActive, icon: Icon, label, title, disabled = false }) => (
    <button
      onClick={onClick}
      title={title}
      type="button"
      disabled={disabled || readOnly}
      className={`p-2 rounded transition-colors text-xs flex flex-col items-center gap-1 ${
        isActive
          ? 'bg-blue-500 text-white'
          : 'text-slate-700 hover:bg-slate-300'
      } ${(disabled || readOnly) ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {Icon && <Icon size={16} />}
      {label && <span className="text-xs">{label}</span>}
    </button>
  )

  const Dropdown = ({ label, value, onChange, options, title }) => (
    <div className="flex flex-col items-start gap-1">
      <label className="text-xs font-semibold text-slate-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        title={title}
        disabled={readOnly}
        className="px-2 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900 hover:border-blue-400 focus:outline-none focus:border-blue-500"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )

  const ColorPicker = ({ label, onColor, title }) => (
    <div className="flex flex-col items-start gap-1">
      <label className="text-xs font-semibold text-slate-700">{label}</label>
      <div className="flex gap-1 flex-wrap">
        {COLORS.map((color) => (
          <button
            key={color}
            onClick={() => onColor(color)}
            title={title}
            type="button"
            disabled={readOnly}
            className="w-6 h-6 rounded border-2 border-slate-300 hover:border-slate-600 transition-colors"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Ribbon Tabs */}
      <div className="flex bg-white border-b border-slate-300 px-4">
        {['home', 'insert', 'layout'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-semibold text-sm transition-colors border-b-2 ${
              activeTab === tab
                ? 'text-blue-600 border-blue-600'
                : 'text-slate-700 border-transparent hover:bg-slate-100'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Ribbon Toolbar */}
      <div className="bg-slate-100 border-b border-slate-300 p-3">
        {activeTab === 'home' && (
          <div className="flex gap-6 flex-wrap">
            {/* Font Family & Size */}
            <div className="flex gap-3">
              <Dropdown
                label="Font"
                value={fontFamily}
                onChange={handleSetFontFamily}
                options={FONTS}
                title="Font Family"
              />
              <Dropdown
                label="Size"
                value={fontSize}
                onChange={handleSetFontSize}
                options={FONT_SIZES.map(s => ({ label: s.toString(), value: s }))}
                title="Font Size"
              />
            </div>

            {/* Text Formatting */}
            <div className="flex flex-col items-start gap-1">
              <label className="text-xs font-semibold text-slate-700">Text</label>
              <div className="flex gap-1">
                <RibbonButton
                  onClick={handleToggleBold}
                  isActive={editor.isActive('bold')}
                  icon={Bold}
                  title="Bold (Ctrl+B)"
                />
                <RibbonButton
                  onClick={handleToggleItalic}
                  isActive={editor.isActive('italic')}
                  icon={Italic}
                  title="Italic (Ctrl+I)"
                />
                <RibbonButton
                  onClick={handleToggleUnderline}
                  isActive={editor.isActive('underline')}
                  icon={UnderlineIcon}
                  title="Underline (Ctrl+U)"
                />
                <RibbonButton
                  onClick={handleToggleStrike}
                  isActive={editor.isActive('strike')}
                  icon={Strikethrough}
                  title="Strikethrough"
                />
              </div>
            </div>

            {/* Colors */}
            <div className="flex gap-4">
              <ColorPicker
                label="Text Color"
                onColor={handleSetColor}
                title="Text Color"
              />
              <ColorPicker
                label="Highlight"
                onColor={handleSetHighlight}
                title="Highlight Color"
              />
            </div>

            {/* Alignment */}
            <div className="flex flex-col items-start gap-1">
              <label className="text-xs font-semibold text-slate-700">Alignment</label>
              <div className="flex gap-1">
                <RibbonButton
                  onClick={handleAlignLeft}
                  isActive={editor.isActive({ textAlign: 'left' })}
                  icon={AlignLeft}
                  title="Align Left"
                />
                <RibbonButton
                  onClick={handleAlignCenter}
                  isActive={editor.isActive({ textAlign: 'center' })}
                  icon={AlignCenter}
                  title="Align Center"
                />
                <RibbonButton
                  onClick={handleAlignRight}
                  isActive={editor.isActive({ textAlign: 'right' })}
                  icon={AlignRight}
                  title="Align Right"
                />
                <RibbonButton
                  onClick={handleAlignJustify}
                  isActive={editor.isActive({ textAlign: 'justify' })}
                  icon={AlignJustify}
                  title="Justify"
                />
              </div>
            </div>

            {/* Styles */}
            <div className="flex flex-col items-start gap-1">
              <label className="text-xs font-semibold text-slate-700">Styles</label>
              <div className="flex gap-1">
                <RibbonButton
                  onClick={handleSetH1}
                  isActive={editor.isActive('heading', { level: 1 })}
                  label="H1"
                  title="Heading 1"
                />
                <RibbonButton
                  onClick={handleSetH2}
                  isActive={editor.isActive('heading', { level: 2 })}
                  label="H2"
                  title="Heading 2"
                />
                <RibbonButton
                  onClick={handleSetH3}
                  isActive={editor.isActive('heading', { level: 3 })}
                  label="H3"
                  title="Heading 3"
                />
              </div>
            </div>

            {/* Lists */}
            <div className="flex flex-col items-start gap-1">
              <label className="text-xs font-semibold text-slate-700">Lists</label>
              <div className="flex gap-1">
                <RibbonButton
                  onClick={handleToggleBullet}
                  isActive={editor.isActive('bulletList')}
                  icon={List}
                  title="Bullet List"
                />
                <RibbonButton
                  onClick={handleToggleOrdered}
                  isActive={editor.isActive('orderedList')}
                  icon={ListOrdered}
                  title="Ordered List"
                />
              </div>
            </div>

            {/* History */}
            <div className="flex flex-col items-start gap-1">
              <label className="text-xs font-semibold text-slate-700">Edit</label>
              <div className="flex gap-1">
                <RibbonButton
                  onClick={handleUndo}
                  icon={Undo2}
                  title="Undo"
                />
                <RibbonButton
                  onClick={handleRedo}
                  icon={Redo2}
                  title="Redo"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'insert' && (
          <div className="flex gap-6">
            <div className="flex flex-col items-start gap-1">
              <label className="text-xs font-semibold text-slate-700">Elements</label>
              <div className="flex gap-1">
                <RibbonButton
                  onClick={handleAddLink}
                  isActive={editor.isActive('link')}
                  icon={LinkIcon}
                  title="Insert Link"
                />
                <RibbonButton
                  onClick={handleInsertImage}
                  icon={ImageIcon}
                  title="Insert Image"
                />
                <RibbonButton
                  onClick={handleInsertTable}
                  icon={TableIcon}
                  title="Insert Table"
                />
                <RibbonButton
                  onClick={handleInsertHorizontalRule}
                  icon={Minus}
                  title="Insert Horizontal Rule"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'layout' && (
          <div className="flex gap-6">
            <div className="flex flex-col items-start gap-1">
              <label className="text-xs font-semibold text-slate-700">Page Setup</label>
              <div className="flex gap-2">
                <div className="px-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-700">
                  Margins: 1 inch
                </div>
                <div className="px-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-700">
                  Size: Letter (8.5" × 11")
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ruler */}
      <div className="h-6 bg-slate-100 border-b border-slate-300 flex items-center px-[96px] relative overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 816 24" preserveAspectRatio="none">
          {/* Draw ruler marks */}
          {[...Array(69)].map((_, i) => {
            const isInch = i % 8 === 0
            const y = isInch ? 8 : 12
            return (
              <g key={i}>
                <line x1={i * 12} y1={24 - y} x2={i * 12} y2={24} stroke="#999" strokeWidth="0.5" />
                {isInch && (
                  <text x={i * 12 + 2} y={18} fontSize="10" fill="#333">
                    {i / 8}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Editor Page Layout */}
      <div className="flex-1 bg-slate-200 overflow-auto p-6">
        <div className="mx-auto bg-white" style={{ maxWidth: '816px', minHeight: '1056px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div className="px-[96px] py-[96px] h-full">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-slate-100 border-t border-slate-300 px-4 py-2 flex justify-between items-center text-xs text-slate-700">
        <div className="flex gap-4">
          <span>Page {pageCount} of {pageCount}</span>
          <span>Words: {wordCount}</span>
          <span>Characters: {charCount}</span>
        </div>
        <div className="flex gap-4">
          {readOnly && <span className="text-slate-500">Read-only</span>}
          <span>Zoom: 100%</span>
        </div>
      </div>
    </div>
  )
})

RichTextEditor.displayName = 'RichTextEditor'

export default RichTextEditor
