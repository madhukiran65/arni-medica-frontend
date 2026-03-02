import React, { useState, useEffect } from 'react'
import {
  Plus, Trash2, ChevronUp, ChevronDown, Eye, EyeOff, Save,
  AlertCircle, CheckCircle, X, Edit2
} from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import { trainingAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'

const QUESTION_TYPES = [
  { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice' },
  { value: 'TRUE_FALSE', label: 'True/False' },
  { value: 'MULTI_SELECT', label: 'Multi-Select' },
  { value: 'SHORT_ANSWER', label: 'Short Answer' },
]

export default function QuizBuilder() {
  const navigate = useNavigate()
  const { quizId } = useParams()
  
  const [loading, setLoading] = useState(!!quizId)
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(false)
  const [error, setError] = useState(null)
  
  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    passing_score: 80,
    time_limit_minutes: null,
    max_attempts: 3,
    randomize_questions: false,
    show_correct_answers: true,
    is_active: true,
    questions: [],
  })

  const [editingQuestion, setEditingQuestion] = useState(null)
  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    question_type: 'MULTIPLE_CHOICE',
    points: 1,
    explanation: '',
    answers: [],
  })

  // Load existing quiz if editing
  useEffect(() => {
    if (quizId) {
      loadQuiz()
    }
    setLoading(false)
  }, [quizId])

  const loadQuiz = async () => {
    try {
      const res = await trainingAPI.getQuiz(quizId)
      setQuiz(res.data)
    } catch (err) {
      setError('Failed to load quiz: ' + (err.response?.data?.detail || err.message))
    }
  }

  const handleQuizFieldChange = (field, value) => {
    setQuiz(prev => ({ ...prev, [field]: value }))
  }

  const openAddQuestion = () => {
    setEditingQuestion(null)
    setNewQuestion({
      question_text: '',
      question_type: 'MULTIPLE_CHOICE',
      points: 1,
      explanation: '',
      answers: [],
    })
    setShowQuestionModal(true)
  }

  const openEditQuestion = (index) => {
    setEditingQuestion(index)
    setNewQuestion({ ...quiz.questions[index] })
    setShowQuestionModal(true)
  }

  const saveQuestion = () => {
    if (!newQuestion.question_text.trim()) {
      alert('Please enter a question')
      return
    }

    if (newQuestion.question_type !== 'SHORT_ANSWER') {
      if (newQuestion.answers.length === 0) {
        alert('Please add at least one answer option')
        return
      }
      if (!newQuestion.answers.some(a => a.is_correct)) {
        alert('Please mark at least one correct answer')
        return
      }
    }

    if (editingQuestion !== null) {
      // Update existing question
      const updated = [...quiz.questions]
      updated[editingQuestion] = { ...newQuestion }
      setQuiz(prev => ({ ...prev, questions: updated }))
    } else {
      // Add new question
      const questionWithOrder = {
        ...newQuestion,
        order: quiz.questions.length + 1,
      }
      setQuiz(prev => ({
        ...prev,
        questions: [...prev.questions, questionWithOrder],
      }))
    }
    setShowQuestionModal(false)
  }

  const deleteQuestion = (index) => {
    if (window.confirm('Delete this question?')) {
      setQuiz(prev => ({
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index)
          .map((q, i) => ({ ...q, order: i + 1 })),
      }))
    }
  }

  const moveQuestion = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= quiz.questions.length) return

    const updated = [...quiz.questions]
    ;[updated[index], updated[newIndex]] = [updated[newIndex], updated[index]]
    updated.forEach((q, i) => q.order = i + 1)
    setQuiz(prev => ({ ...prev, questions: updated }))
  }

  const handleSaveQuiz = async () => {
    try {
      setSaving(true)
      setError(null)

      if (!quiz.title.trim()) {
        setError('Please enter a quiz title')
        return
      }

      if (quiz.questions.length === 0) {
        setError('Please add at least one question')
        return
      }

      // For now, we'll save the basic quiz info and add questions separately
      // In a full implementation, you might want to batch operations
      if (quizId) {
        await trainingAPI.updateQuiz(quizId, {
          title: quiz.title,
          description: quiz.description,
          passing_score: quiz.passing_score,
          time_limit_minutes: quiz.time_limit_minutes,
          max_attempts: quiz.max_attempts,
          randomize_questions: quiz.randomize_questions,
          show_correct_answers: quiz.show_correct_answers,
          is_active: quiz.is_active,
        })
      } else {
        const res = await trainingAPI.createQuiz({
          title: quiz.title,
          description: quiz.description,
          passing_score: quiz.passing_score,
          time_limit_minutes: quiz.time_limit_minutes,
          max_attempts: quiz.max_attempts,
          randomize_questions: quiz.randomize_questions,
          show_correct_answers: quiz.show_correct_answers,
          is_active: quiz.is_active,
        })
        // Save quiz ID for new quiz
        setQuiz(prev => ({ ...prev, id: res.data.id }))
      }

      // TODO: Save questions via separate API calls
      alert('Quiz saved successfully!')
      navigate('/training')
    } catch (err) {
      setError('Failed to save quiz: ' + (err.response?.data?.detail || err.message))
    } finally {
      setSaving(false)
    }
  }

  const getTotalPoints = () => {
    return quiz.questions.reduce((sum, q) => sum + (q.points || 0), 0)
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {quizId ? 'Edit Quiz' : 'Create New Quiz'}
          </h1>
          <p className="text-slate-400">Build a quiz with multiple question types</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPreview(!preview)}
            className="btn-secondary flex items-center gap-2"
          >
            {preview ? <EyeOff size={18} /> : <Eye size={18} />}
            {preview ? 'Edit' : 'Preview'}
          </button>
          <button
            onClick={handleSaveQuiz}
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            {saving ? <LoadingSpinner /> : <Save size={18} />}
            Save Quiz
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-red-300">Error</h3>
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="card p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Quiz Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Quiz Title *</label>
                <input
                  type="text"
                  placeholder="e.g., Safety Procedures Quiz"
                  value={quiz.title}
                  onChange={(e) => handleQuizFieldChange('title', e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  placeholder="Optional description of the quiz..."
                  value={quiz.description}
                  onChange={(e) => handleQuizFieldChange('description', e.target.value)}
                  className="input-field h-24"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Passing Score (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={quiz.passing_score}
                    onChange={(e) => handleQuizFieldChange('passing_score', parseInt(e.target.value))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Max Attempts</label>
                  <input
                    type="number"
                    min="1"
                    value={quiz.max_attempts}
                    onChange={(e) => handleQuizFieldChange('max_attempts', parseInt(e.target.value))}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Time Limit (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Leave blank for unlimited"
                    value={quiz.time_limit_minutes || ''}
                    onChange={(e) => handleQuizFieldChange('time_limit_minutes', e.target.value ? parseInt(e.target.value) : null)}
                    className="input-field"
                  />
                </div>
                <div className="pt-6 flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={quiz.randomize_questions}
                      onChange={(e) => handleQuizFieldChange('randomize_questions', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Randomize Questions</span>
                  </label>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={quiz.show_correct_answers}
                  onChange={(e) => handleQuizFieldChange('show_correct_answers', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">Show Correct Answers After Completion</span>
              </label>
            </div>
          </div>

          {/* Questions Section */}
          <div className="card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Questions ({quiz.questions.length})</h2>
              <button
                onClick={openAddQuestion}
                className="btn-primary flex items-center gap-2"
              >
                <Plus size={18} /> Add Question
              </button>
            </div>

            {quiz.questions.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <p>No questions added yet</p>
                <p className="text-sm mt-1">Click "Add Question" to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {quiz.questions.map((question, idx) => (
                  <div key={idx} className="bg-slate-800/50 border border-eqms-border p-4 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold">Question {idx + 1}</h3>
                        <p className="text-sm text-slate-300 mt-1">{question.question_text}</p>
                        <div className="flex gap-4 mt-2 text-xs text-slate-400">
                          <span>{QUESTION_TYPES.find(t => t.value === question.question_type)?.label}</span>
                          <span>{question.points} point{question.points !== 1 ? 's' : ''}</span>
                          {question.answers && <span>{question.answers.length} options</span>}
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        {idx > 0 && (
                          <button
                            onClick={() => moveQuestion(idx, 'up')}
                            className="p-1.5 rounded hover:bg-slate-700 transition"
                            title="Move up"
                          >
                            <ChevronUp size={16} />
                          </button>
                        )}
                        {idx < quiz.questions.length - 1 && (
                          <button
                            onClick={() => moveQuestion(idx, 'down')}
                            className="p-1.5 rounded hover:bg-slate-700 transition"
                            title="Move down"
                          >
                            <ChevronDown size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => openEditQuestion(idx)}
                          className="p-1.5 rounded hover:bg-slate-700 transition"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => deleteQuestion(idx)}
                          className="p-1.5 rounded hover:bg-red-900/20 transition text-red-400"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h3 className="font-semibold mb-4">Quiz Summary</h3>

            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Questions:</span>
                <span className="font-semibold">{quiz.questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Points:</span>
                <span className="font-semibold">{getTotalPoints()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Passing Score:</span>
                <span className="font-semibold">{quiz.passing_score}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Max Attempts:</span>
                <span className="font-semibold">{quiz.max_attempts}</span>
              </div>
              {quiz.time_limit_minutes && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Time Limit:</span>
                  <span className="font-semibold">{quiz.time_limit_minutes} min</span>
                </div>
              )}
            </div>

            <div className="border-t border-eqms-border pt-4 space-y-2 text-xs">
              {quiz.title && (
                <div className="flex items-center gap-2 text-green-300">
                  <CheckCircle size={14} />
                  <span>Title entered</span>
                </div>
              )}
              {quiz.questions.length > 0 && (
                <div className="flex items-center gap-2 text-green-300">
                  <CheckCircle size={14} />
                  <span>{quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''}</span>
                </div>
              )}
              {!quiz.title && (
                <div className="flex items-center gap-2 text-yellow-300">
                  <AlertCircle size={14} />
                  <span>Enter a title</span>
                </div>
              )}
              {quiz.questions.length === 0 && (
                <div className="flex items-center gap-2 text-yellow-300">
                  <AlertCircle size={14} />
                  <span>Add at least one question</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Question Modal */}
      <Modal
        isOpen={showQuestionModal}
        onClose={() => setShowQuestionModal(false)}
        title={editingQuestion !== null ? 'Edit Question' : 'Add Question'}
      >
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium mb-2">Question Text *</label>
            <textarea
              value={newQuestion.question_text}
              onChange={(e) => setNewQuestion(prev => ({ ...prev, question_text: e.target.value }))}
              className="input-field h-20"
              placeholder="Enter the question..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Question Type</label>
              <select
                value={newQuestion.question_type}
                onChange={(e) => setNewQuestion(prev => ({
                  ...prev,
                  question_type: e.target.value,
                  answers: e.target.value === 'SHORT_ANSWER' ? [] : prev.answers,
                }))}
                className="input-field"
              >
                {QUESTION_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Points</label>
              <input
                type="number"
                min="1"
                value={newQuestion.points}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, points: parseInt(e.target.value) || 1 }))}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Explanation (optional)</label>
            <textarea
              value={newQuestion.explanation}
              onChange={(e) => setNewQuestion(prev => ({ ...prev, explanation: e.target.value }))}
              className="input-field h-16"
              placeholder="Shown to users after answering..."
            />
          </div>

          {newQuestion.question_type !== 'SHORT_ANSWER' && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">Answer Options *</label>
                <button
                  onClick={() => setNewQuestion(prev => ({
                    ...prev,
                    answers: [...prev.answers, { answer_text: '', is_correct: false, order: prev.answers.length }],
                  }))}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  + Add Option
                </button>
              </div>

              <div className="space-y-2">
                {newQuestion.answers.map((answer, idx) => (
                  <div key={idx} className="flex gap-2 items-end">
                    <input
                      type="text"
                      value={answer.answer_text}
                      onChange={(e) => {
                        const updated = [...newQuestion.answers]
                        updated[idx].answer_text = e.target.value
                        setNewQuestion(prev => ({ ...prev, answers: updated }))
                      }}
                      placeholder="Enter answer option..."
                      className="input-field flex-1"
                    />
                    <label className="flex items-center gap-2 cursor-pointer flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={answer.is_correct}
                        onChange={(e) => {
                          const updated = [...newQuestion.answers]
                          if (newQuestion.question_type === 'MULTIPLE_CHOICE' || newQuestion.question_type === 'TRUE_FALSE') {
                            // Only one correct answer for single-select
                            updated.forEach(a => a.is_correct = false)
                          }
                          updated[idx].is_correct = e.target.checked
                          setNewQuestion(prev => ({ ...prev, answers: updated }))
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-xs">Correct</span>
                    </label>
                    <button
                      onClick={() => setNewQuestion(prev => ({
                        ...prev,
                        answers: prev.answers.filter((_, i) => i !== idx),
                      }))}
                      className="p-1 hover:text-red-400"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={saveQuestion}
            className="btn-primary flex-1"
          >
            {editingQuestion !== null ? 'Update' : 'Add'} Question
          </button>
          <button
            onClick={() => setShowQuestionModal(false)}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  )
}
