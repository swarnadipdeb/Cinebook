import { useState, ChangeEvent } from 'react'

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function useFormValidation<T extends Record<string, string>>(initialValues: T) {
  const [form, setForm] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    setErrors((e2) => ({ ...e2, [name]: undefined }))
  }

  const setFieldError = (name: keyof T, error: string) => {
    setErrors((e2) => ({ ...e2, [name]: error }))
  }

  return { form, errors, handleChange, setFieldError, setForm, setErrors }
}
