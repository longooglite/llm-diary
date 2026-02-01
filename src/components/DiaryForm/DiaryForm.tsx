'use client'

import { useState, useCallback } from 'react'
import LabeledInput from '../LabeledInput/LabeledInput'
import styles from './DiaryForm.module.scss'

export const DiaryForm = () => {
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
      <form
        id="diary-input-form"
        onSubmit={handleSubmit}
        className={styles.diaryForm}
      >
        <LabeledInput
          id="diary-input-text"
          inputProps={{
            onChange: handleTextChange,
            value: submissionText
          }}
        >
          Entry:
        </LabeledInput>
        <LabeledInput
          id="diary-input-date"
          inputProps={{
            type: 'date',
            onChange: handleDateChange,
            value: submissionDate
          }}
        >
          Date:
        </LabeledInput>
        <LabeledInput
          id="diary-input-meta"
          customInputElement={
            <textarea
              name="diary-input-meta"
              id="diary-input-meta"
              placeholder="Meta instructions"
              onChange={handleMetaChange}
              value={submissionMeta}
            />
          }
        >
          Meta Instructions:
        </LabeledInput>
        <button type="submit">Submit</button>
      </form>
  )
}

export default DiaryForm