import { useFieldArray, type Control, type UseFormRegister, type FieldErrors } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import type { LessonFormData } from './LessonModal'

interface QuizEditorProps {
  control: Control<LessonFormData>
  register: UseFormRegister<LessonFormData>
  errors: FieldErrors<LessonFormData>
}

export function QuizEditor({ control, register, errors }: QuizEditorProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'quiz',
  })

  return (
    <div className="space-y-6">
      {fields.map((field, qIndex) => (
        <div key={field.id} className="p-4 bg-[var(--color-surface-variant)]/20 border border-[var(--color-surface-variant)] rounded-xl relative">
          <button
            type="button"
            onClick={() => remove(qIndex)}
            className="absolute top-2 right-2 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
            title="Xóa câu hỏi"
          >
            <Trash2 size={16} />
          </button>

          <div className="mb-4 pr-8">
            <label className="block text-label-md text-[var(--color-on-surface)] mb-1">
              Câu hỏi {qIndex + 1}
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-surface-variant)] text-[var(--color-on-surface)] focus:border-[var(--color-primary)] focus:outline-none"
              placeholder="Nhập nội dung câu hỏi..."
              {...register(`quiz.${qIndex}.question`)}
            />
            {errors.quiz?.[qIndex]?.question && (
              <p className="text-label-sm text-[var(--color-error)] mt-1">
                {errors.quiz[qIndex]?.question?.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-label-md text-[var(--color-on-surface)]">Lựa chọn (chọn đáp án đúng)</label>
            {[0, 1, 2, 3].map((optIndex) => (
              <div key={optIndex} className="flex items-center gap-3">
                <input
                  type="radio"
                  className="w-4 h-4 accent-[var(--color-primary)] mt-1"
                  title="Đánh dấu đáp án đúng"
                  value={optIndex}
                  {...register(`quiz.${qIndex}.correctAnswer`)}
                />
                <div className="flex-1">
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-surface-variant)] text-[var(--color-on-surface)] text-sm focus:border-[var(--color-primary)] focus:outline-none"
                    placeholder={`Lựa chọn ${optIndex + 1}`}
                    {...register(`quiz.${qIndex}.options.${optIndex}`)}
                  />
                  {errors.quiz?.[qIndex]?.options?.[optIndex] && (
                    <p className="text-xs text-[var(--color-error)] mt-1">
                      {errors.quiz[qIndex]?.options?.[optIndex]?.message}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {errors.quiz?.[qIndex]?.options && Array.isArray(errors.quiz?.[qIndex]?.options) === false && (
              <p className="text-label-sm text-[var(--color-error)] mt-1">
                {(errors.quiz[qIndex]?.options as any)?.message}
              </p>
            )}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() =>
          append({
            question: '',
            options: ['', '', '', ''],
            correctAnswer: 0,
          })
        }
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-[var(--color-primary)]/50 text-[var(--color-primary)] font-medium hover:bg-[var(--color-primary)]/10 transition-colors"
      >
        <Plus size={18} />
        <span>Thêm câu hỏi</span>
      </button>
    </div>
  )
}
