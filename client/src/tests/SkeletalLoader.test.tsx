import { render } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import CVSkeleton from '../pages/CVSkeleton'

describe('CVSkeleton', () => {
  test('renders without crashing', () => {
    const { container } = render(<CVSkeleton />)
    expect(container.firstChild).toBeTruthy()
  })

  test('has animate-pulse class', () => {
    const { container } = render(<CVSkeleton />)
    expect(container.querySelector('.animate-pulse')).toBeTruthy()
  })
})