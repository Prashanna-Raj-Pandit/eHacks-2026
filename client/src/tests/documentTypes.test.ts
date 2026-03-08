import { describe, test, expect } from 'vitest'
import { DOCUMENT_TYPES } from '../constants/document-types'

describe('DOCUMENT_TYPES constant', () => {
  test('contains expected types', () => {
    expect(DOCUMENT_TYPES).toContain('Resume')
    expect(DOCUMENT_TYPES).toContain('Cover Letter')
    expect(DOCUMENT_TYPES).toContain('Certificate')
    expect(DOCUMENT_TYPES).toContain('Portfolio')
    expect(DOCUMENT_TYPES).toContain('Other')
  })

  test('has 5 document types', () => {
    expect(DOCUMENT_TYPES).toHaveLength(5)
  })

  test('is readonly tuple', () => {
    expect(Array.isArray(DOCUMENT_TYPES)).toBe(true)
  })
})