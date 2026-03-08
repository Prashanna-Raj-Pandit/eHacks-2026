import { describe, test, expect, beforeEach } from 'vitest'

describe('getFileUrl utility', () => {
  beforeEach(() => {
    import.meta.env.VITE_API_URL = 'http://localhost:3001'
  })

  test('constructs correct file URL', async () => {
    const { getFileUrl } = await import('../utils/url')
    const url = getFileUrl('test-file.pdf')
    expect(url).toContain('test-file.pdf')
    expect(url).toContain('/public/uploads/')
  })

  test('handles filenames with spaces', async () => {
    const { getFileUrl } = await import('../utils/url')
    const url = getFileUrl('my resume.pdf')
    expect(url).toContain('my resume.pdf')
  })
})