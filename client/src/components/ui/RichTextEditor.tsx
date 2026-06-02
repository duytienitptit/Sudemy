import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
} from 'lucide-react'
import { useEffect } from 'react'
import { twMerge } from 'tailwind-merge'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  error?: string
  placeholder?: string
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null
  }

  const toggleAction = (
    action: () => void,
    isActive: boolean,
    icon: React.ReactNode,
    title?: string
  ) => (
    <button
      type="button"
      onClick={action}
      title={title}
      className={twMerge(
        'p-2 rounded-md transition-colors',
        isActive
          ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
          : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-variant)]'
      )}
    >
      {icon}
    </button>
  )

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-[var(--color-surface-variant)] bg-[var(--color-surface)] rounded-t-xl">
      {toggleAction(
        () => editor.chain().focus().toggleBold().run(),
        editor.isActive('bold'),
        <Bold size={18} />,
        'In đậm'
      )}
      {toggleAction(
        () => editor.chain().focus().toggleItalic().run(),
        editor.isActive('italic'),
        <Italic size={18} />,
        'In nghiêng'
      )}
      {toggleAction(
        () => editor.chain().focus().toggleStrike().run(),
        editor.isActive('strike'),
        <Strikethrough size={18} />,
        'Gạch ngang'
      )}
      <div className="w-px h-6 bg-[var(--color-surface-variant)] self-center mx-1" />
      {toggleAction(
        () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        editor.isActive('heading', { level: 2 }),
        <Heading2 size={18} />,
        'Tiêu đề H2'
      )}
      {toggleAction(
        () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        editor.isActive('heading', { level: 3 }),
        <Heading3 size={18} />,
        'Tiêu đề H3'
      )}
      <div className="w-px h-6 bg-[var(--color-surface-variant)] self-center mx-1" />
      {toggleAction(
        () => editor.chain().focus().toggleBulletList().run(),
        editor.isActive('bulletList'),
        <List size={18} />,
        'Danh sách'
      )}
      {toggleAction(
        () => editor.chain().focus().toggleOrderedList().run(),
        editor.isActive('orderedList'),
        <ListOrdered size={18} />,
        'Danh sách có số'
      )}
      {toggleAction(
        () => editor.chain().focus().toggleBlockquote().run(),
        editor.isActive('blockquote'),
        <Quote size={18} />,
        'Trích dẫn'
      )}
      <div className="w-px h-6 bg-[var(--color-surface-variant)] self-center mx-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Hoàn tác"
        className="p-2 text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-variant)] rounded-md disabled:opacity-30 transition-colors"
      >
        <Undo size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Làm lại"
        className="p-2 text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-variant)] rounded-md disabled:opacity-30 transition-colors"
      >
        <Redo size={18} />
      </button>
    </div>
  )
}

export function RichTextEditor({
  value,
  onChange,
  error,
  placeholder = 'Nhập mô tả khóa học...',
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'rte-content focus:outline-none',
        'data-placeholder': placeholder,
      },
    },
  })

  // Sync value if it changes outside (e.g. form reset)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '')
    }
  }, [value, editor])

  return (
    <div className="w-full">
      <div
        className={twMerge(
          'border rounded-xl bg-[var(--color-surface)] overflow-hidden transition-colors focus-within:border-[var(--color-primary)]',
          error
            ? 'border-[var(--color-error)] focus-within:border-[var(--color-error)]'
            : 'border-[var(--color-surface-variant)]'
        )}
      >
        <MenuBar editor={editor} />
        <EditorContent editor={editor} className="rte-wrapper" />
      </div>
      {error && (
        <p className="text-label-sm text-[var(--color-error)] mt-1">{error}</p>
      )}
    </div>
  )
}
