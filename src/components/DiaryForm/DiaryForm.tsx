'use client'

import { useState, useCallback } from 'react'
import { recordEvent } from '@/lib/eventLedger'
import { useAuth } from 'react-oidc-context'
import styles from './DiaryForm.module.scss'

export const DiaryForm = () => {
  const auth = useAuth()
  const [submissionText, setSubmissionText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setSubmissionText(e.target.value)
    },
    [],
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!submissionText.trim()) return

      setIsSubmitting(true)
      setFeedback(null)

      try {
        await recordEvent(submissionText, {}, auth.user?.access_token)
        setSubmissionText('')
        setFeedback('Fact recorded in ledger.')
        setTimeout(() => setFeedback(null), 3000)
      } catch (err) {
        console.error('Failed to submit entry:', err)
        setFeedback('Error recording fact.')
      } finally {
        setIsSubmitting(false)
      }
    },
    [submissionText],
  )

  return (
    <div className={styles.formWrapper}>
      <form
        id="diary-input-form"
        onSubmit={handleSubmit}
        className={styles.diaryForm}
      >
        <div className={styles.inputContainer}>
          <textarea
            className={styles.mainInput}
            placeholder="Record a choice, expense, or moment..."
            onChange={handleTextChange}
            value={submissionText}
            disabled={isSubmitting}
            autoFocus
          />
        </div>
        <div className={styles.formActions}>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmitting || !submissionText.trim()}
          >
            {isSubmitting ? 'RECORDING...' : 'COMMIT TO LEDGER'}
          </button>
          {feedback && <span className={styles.feedback}>{feedback}</span>}
        </div>
      </form>
      <div className={styles.helperText}>
        <p>Examples: "Worked 4h on frontend", "$45 for groceries", "Decided to use SCSS modules"</p>
      </div>
    </div>
  )
}

export default DiaryForm

