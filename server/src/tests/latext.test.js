describe('LaTeX cleanup utility', () => {
  const cleanLatex = (latex) => latex
    .replace(/\\resumeSubHeadingListStart\s*\\resumeSubHeadingListEnd/g, '')
    .replace(/\\resumeItemListStart\s*\\resumeItemListEnd/g, '')
    .replace(/\\section\{[^}]+\}\s*\n\s*\n/g, '')

  test('removes empty resumeSubHeadingList', () => {
    const input = `\\resumeSubHeadingListStart\n\\resumeSubHeadingListEnd`
    const result = cleanLatex(input)
    expect(result).not.toContain('\\resumeSubHeadingListStart')
  })

  test('removes empty resumeItemList', () => {
    const input = `\\resumeItemListStart\n\\resumeItemListEnd`
    const result = cleanLatex(input)
    expect(result).not.toContain('\\resumeItemListStart')
  })

  test('keeps non-empty lists intact', () => {
    const input = `\\resumeSubHeadingListStart\n\\item Test\n\\resumeSubHeadingListEnd`
    const result = cleanLatex(input)
    expect(result).toContain('\\item Test')
  })

  test('removes empty section', () => {
    const input = `\\section{Projects}\n\n`
    const result = cleanLatex(input)
    expect(result.trim()).toBe('')
  })
})