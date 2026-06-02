export interface ProgressResponse {
  completedLessons: string[]
  progressPercent: number
}

export interface CompleteLessonResponse {
  completedLessons: string[] // completed lessons
  progressPercent: number
}

export interface QuizSubmissionRequest {
  answers: { questionIndex: number; selectedOption: number }[]
}

export interface QuizSubmissionResponse {
  score: number
  passed: boolean
  correctAnswers: number
  totalQuestions: number
  results?: {
    questionIndex: number
    selectedOption: number
    correctAnswer: number
    isCorrect: boolean
  }[]
}
