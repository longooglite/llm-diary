import { useState, useCallback } from 'react'
import styles from './page.module.css'

export const Home = () => {
  const [submissionDate, setSubmissionDate] = useState(new Date().toISOString().split('T')[0])
  const [submissionText, setSubmissionText] = useState('')
  const [submissionMeta, setSubmissionMeta] = useState('')
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSubmissionText(e.target.value)
  }, [])
  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSubmissionDate(e.target.value)
  }, [])
  const handleMetaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSubmissionMeta(e.target.value)
  }, [])
  const prepPayload = useCallback(() => {
    return {
      date: submissionDate,
      text: submissionText,
      meta: submissionMeta,
    }
  }, [submissionDate, submissionText, submissionMeta])
  const handleSubmit = useCallback(async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    const payload = prepPayload()
    console.log('Submitting diary entry:', payload)
    // Add submission logic here (e.g., API call)
  }, [prepPayload])
  return (
    <div className={styles.page}>
      <h1>Diary</h1>
      <form
        id="diary-input-form"
        onSubmit={handleSubmit}
      >
        <label
          htmlFor="diary-input-text"
        >
          Entry:
          <input
            name="diary-input-text"
            id="diary-input-text"
            type="text"
            onChange={handleTextChange}
            value={submissionText}
          />
        </label>
        <label
          htmlFor="diary-input-date"
        >
          Date:
          <input
            name="diary-input-date"
            id="diary-input-date"
            type="date"
            onChange={handleDateChange}
            value={submissionDate}
          />
        </label>
        <label
          htmlFor="diary-input-meta"
        >
          Meta Instructions:
          <textarea
            name="diary-input-meta"
            id="diary-input-meta"
            placeholder="Meta instructions"
            onChange={handleMetaChange}
            value={submissionMeta}
          />
        </label>
      </form>
    </div>
  )
}
