export const DOCUMENT_TYPES = [
  'Resume',
  'Cover Letter', 
'Certificate',
  'Portfolio',
  'Other',
] as const

export type DocumentType = typeof DOCUMENT_TYPES[number]