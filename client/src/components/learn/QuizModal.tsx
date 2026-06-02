import { useState } from 'react'
import { X } from 'lucide-react'
import type { QuizQuestion } from '@/types/course.types'

interface QuizModalProps {
  isOpen: boolean
  onClose: () => void
  quiz: QuizQuestion[]
  onSubmit: (answers: { questionIndex: number; selectedOption: number }[]) => void
  isSubmitting?: boolean
  quizResults?: {
    score: number
    passed: boolean
    results?: {
      questionIndex: number
      selectedOption: number
      correctAnswer: number
      isCorrect: boolean
    }[]
  } | null
}

export default function QuizModal({ isOpen, onClose, quiz, onSubmit, isSubmitting, quizResults }: QuizModalProps) {
  const [answers, setAnswers] = useState<Record<number, number>>({})

  if (!isOpen) return null

  const handleOptionChange = (questionIndex: number, optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formattedAnswers = Object.entries(answers).map(([qIdx, optIdx]) => ({
      questionIndex: Number(qIdx),
      selectedOption: optIdx,
    }))
    onSubmit(formattedAnswers)
  }

  const allAnswered = quiz.length > 0 && Object.keys(answers).length === quiz.length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {quizResults ? (
              <span className="flex items-center gap-2">
                Kết quả: {quizResults.score}% 
                {quizResults.passed ? (
                  <span className="text-sm px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-md">Đạt</span>
                ) : (
                  <span className="text-sm px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-md">Chưa đạt</span>
                )}
              </span>
            ) : (
              'Bài kiểm tra'
            )}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form id="quiz-form" onSubmit={handleSubmit} className="space-y-8">
            {quiz.map((q, qIndex) => (
              <div key={qIndex} className="space-y-4">
                <h3 className="font-medium text-slate-900 dark:text-white">
                  {qIndex + 1}. {q.question}
                </h3>
                <div className="space-y-2 pl-4">
                  {q.options.map((opt, optIndex) => {
                    const isSelected = answers[qIndex] === optIndex
                    let optionClassName = "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors"
                    
                    if (quizResults?.results) {
                      const result = quizResults.results.find(r => r.questionIndex === qIndex)
                      if (result) {
                        if (optIndex === result.correctAnswer) {
                          // This is the correct answer
                          optionClassName += " border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-medium"
                        } else if (isSelected && !result.isCorrect) {
                          // This is what the user selected, and it's wrong
                          optionClassName += " border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                        } else {
                          optionClassName += " border-slate-200 dark:border-slate-800 opacity-60"
                        }
                      }
                    } else {
                      optionClassName += isSelected 
                        ? " border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                        : " border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }

                    return (
                      <label key={optIndex} className={optionClassName}>
                        <input
                          type="radio"
                          name={`question-${qIndex}`}
                          value={optIndex}
                          checked={isSelected}
                          onChange={() => handleOptionChange(qIndex, optIndex)}
                          disabled={!!quizResults}
                          className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-600 dark:border-slate-600 dark:bg-slate-700 disabled:opacity-50"
                        />
                        <span className={`text-sm ${quizResults ? '' : 'text-slate-700 dark:text-slate-300'}`}>{opt}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            ))}
          </form>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
          {quizResults ? (
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Đóng
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                form="quiz-form"
                disabled={!allAnswered || isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Đang nộp bài...' : 'Nộp bài'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
