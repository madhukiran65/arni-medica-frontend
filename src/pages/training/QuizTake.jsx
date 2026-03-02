import React, { useState, useEffect } from 'react'
import {
  Clock, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, Send
} from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import { trainingAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const QuestionTypeComponentMap = {
  'MULTIPLE_CHOICE': MultipleChoiceQuestion,
  'TRUE_FALSE': TrueFalseQuestion,
  'MULTI_SELECT': MultiSelectQuestion,
  'SHORT_ANSWER': ShortAnswerQuestion,
}

function MultipleChoiceQuestion({ question, answer, onChange }) {
  return (
    <div className="space-y-3">
      {question.answers.map(option => (
        <label key={option.id} className="flex items-start gap-3 p-3 rounded-lg border border-eqms-border hover:bg-slate-800/50 cursor-pointer transition">
          <input
            type="radio"
            name={`question-${question.id}`}
            value={option.id}
            checked={answer && answer[0] === option.id}
            onChange={() => onChange([option.id])}
            className="w-4 h-4 mt-1"
          />
          <span>{option.answer_text}</span>
        </label>
      ))}
    </div>
  )
}

function TrueFalseQuestion({ question, answer, onChange }) {
  return (
    <div className="flex gap-4">
      {[{ id: 'true', text: 'True' }, { id: 'false', text: 'False' }].map(option => (
        <label key={option.id} className="flex items-center gap-2 p-3 px-6 rounded-lg border border-eqms-border hover:bg-slate-800/50 cursor-pointer transition flex-1">
          <input
            type="radio"
            name={`question-${question.id}`}
            value={option.id}
            checked={answer && answer[0] === option.id}
            onChange={() => onChange([option.id])}
            className="w-4 h-4"
          />
          <span className="font-medium">{option.text}</span>
        </label>
      ))}
    </div>
  )
}

function MultiSelectQuestion({ question, answer, onChange }) {
  return (
    <div className="space-y-3">
      {question.answers.map(option => (
        <label key={option.id} className="flex items-start gap-3 p-3 rounded-lg border border-eqms-border hover:bg-slate-800/50 cursor-pointer transition">
          <input
            type="checkbox"
            checked={(answer || []).includes(option.id)}
            onChange={(e) => {
              if (e.target.checked) {
                onChange([...(answer || []), option.id])
              } else {
                onChange((answer || []).filter(id => id !== option.id))
              }
            }}
            className="w-4 h-4 mt-1"
          />
          <span>{option.answer_text}</span>
        </label>
      ))}
    </div>
  )
}

function ShortAnswerQuestion({ question, answer, onChange }) {
  return (
    <textarea
      value={answer || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter your answer..."
      className="input-field h-32"
    />
  )
}

export default function QuizTake() {
  const navigate = useNavigate()
  const { quizId } = useParams()
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [quiz, setQuiz] = useState(null)
  const [attemptId, setAttemptId] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeRemaining, setTimeRemaining] = useState(null)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    startQuiz()
  }, [quizId])

  // Timer effect
  useEffect(() => {
    if (!timeRemaining || quizCompleted) return

    const timer = setTimeout(() => {
      if (timeRemaining <= 1) {
        handleSubmit()
      } else {
        setTimeRemaining(timeRemaining - 1)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [timeRemaining, quizCompleted])

  const startQuiz = async () => {
    try {
      const res = await trainingAPI.startAttempt(quizId)
      setQuiz(res.data.quiz)
      setAttemptId(res.data.attempt_id)
      if (res.data.time_limit_minutes) {
        setTimeRemaining(res.data.time_limit_minutes * 60)
      }
      setLoading(false)
    } catch (err) {
      setError('Failed to start quiz: ' + (err.response?.data?.detail || err.message))
      setLoading(false)
    }
  }

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handleSubmit = async () => {
    if (!window.confirm('Are you sure you want to submit the quiz?')) {
      return
    }

    try {
      setSubmitting(true)
      const res = await trainingAPI.submitAttempt(quizId, {
        attempt_id: attemptId,
        answers,
      })
      setResult(res.data)
      setQuizCompleted(true)
      setTimeRemaining(null)
    } catch (err) {
      setError('Failed to submit quiz: ' + (err.response?.data?.detail || err.message))
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) return <LoadingSpinner />

  if (quizCompleted && result) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="card p-8 max-w-2xl w-full">
          <div className="text-center mb-8">
            {result.passed ? (
              <>
                <div className="mx-auto w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle size={32} className="text-green-400" />
                </div>
                <h1 className="text-3xl font-bold text-green-300 mb-2">Quiz Passed!</h1>
                <p className="text-slate-300">Congratulations on completing the quiz.</p>
              </>
            ) : (
              <>
                <div className="mx-auto w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle size={32} className="text-red-400" />
                </div>
                <h1 className="text-3xl font-bold text-red-300 mb-2">Quiz Did Not Pass</h1>
                <p className="text-slate-300">Please review and try again.</p>
              </>
            )}
          </div>

          <div className="bg-slate-800/50 border border-eqms-border p-6 rounded-lg mb-8">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-slate-400 text-sm mb-1">Your Score</p>
                <p className="text-3xl font-bold">{result.score}%</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Passing Score</p>
                <p className="text-3xl font-bold text-yellow-300">{result.passing_score}%</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Difference</p>
                <p className={`text-3xl font-bold ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
                  {(result.score - result.passing_score).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {result.questions_with_answers && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Review Your Answers</h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {result.questions_with_answers.map((question, idx) => {
                  const userAnswer = result.answers[question.id] || answers[question.id]
                  const isCorrect = question.answers.some(a => a.is_correct && userAnswer && (
                    Array.isArray(userAnswer) ? userAnswer.includes(a.id) : userAnswer === a.id
                  ))

                  return (
                    <div key={idx} className="bg-slate-800/50 p-4 rounded-lg border border-eqms-border">
                      <div className="flex items-start gap-3 mb-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold ${
                          isCorrect ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                        }`}>
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{question.question_text}</p>
                          {question.explanation && (
                            <p className="text-sm text-slate-400 mt-2">{question.explanation}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/training')}
              className="btn-secondary flex-1"
            >
              Back to Training
            </button>
            {!result.passed && (
              <button
                onClick={() => {
                  setQuizCompleted(false)
                  setResult(null)
                  setAnswers({})
                  setCurrentQuestionIndex(0)
                  startQuiz()
                }}
                className="btn-primary flex-1"
              >
                Retake Quiz
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return <div className="p-8 text-center">No questions available</div>
  }

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const QuestionComponent = QuestionTypeComponentMap[currentQuestion.question_type]
  const currentAnswer = answers[currentQuestion.id]
  const isAnswered = currentAnswer !== undefined && currentAnswer !== ''
  const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0)

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8">
      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{quiz.title}</h1>
          {quiz.description && <p className="text-slate-300">{quiz.description}</p>}
        </div>

        {/* Progress Bar */}
        <div className="card p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </span>
            {timeRemaining && (
              <div className={`flex items-center gap-2 ${timeRemaining < 60 ? 'text-red-400' : 'text-slate-300'}`}>
                <Clock size={16} />
                <span className="font-mono font-semibold">{formatTime(timeRemaining)}</span>
              </div>
            )}
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
            />
          </div>

          {/* Question Indicators */}
          <div className="mt-4 flex gap-2 flex-wrap">
            {quiz.questions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`w-8 h-8 rounded text-xs font-semibold transition ${
                  idx === currentQuestionIndex
                    ? 'bg-blue-600 text-white'
                    : answers[q.id] !== undefined
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
                title={`Question ${idx + 1}${answers[q.id] !== undefined ? ' (answered)' : ''}`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Question Content */}
        <div className="card p-8 mb-6">
          <div className="mb-6">
            <h2 className="text-xl md:text-2xl font-semibold mb-2">{currentQuestion.question_text}</h2>
            <p className="text-sm text-slate-400">
              {currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''} | Total: {totalPoints} points
            </p>
          </div>

          <div className="mb-8">
            {QuestionComponent && (
              <QuestionComponent
                question={currentQuestion}
                answer={currentAnswer}
                onChange={(answer) => handleAnswerChange(currentQuestion.id, answer)}
              />
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={18} /> Previous
          </button>

          <div className="flex gap-3">
            {currentQuestionIndex < quiz.questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="btn-secondary flex items-center gap-2"
              >
                Next <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-primary flex items-center gap-2"
              >
                {submitting ? <LoadingSpinner /> : <Send size={18} />}
                Submit Quiz
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
