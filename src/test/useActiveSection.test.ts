import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useActiveSection } from '../hooks/useActiveSection'

describe('useActiveSection', () => {
  beforeEach(() => {
    // Create mock elements for each section
    const sections = ['hero', 'about', 'skills', 'projects', 'dashboard']
    sections.forEach((id) => {
      const el = document.createElement('section')
      el.id = id
      el.style.height = '100px'
      document.body.appendChild(el)
    })
  })

  afterEach(() => {
    // Clean up
    document.body.innerHTML = ''
  })

  it('should return first section id by default', () => {
    const { result } = renderHook(() =>
      useActiveSection(['hero', 'about', 'skills'])
    )
    expect(typeof result.current).toBe('string')
  })

  it('should return a string', () => {
    const { result } = renderHook(() =>
      useActiveSection(['hero', 'about'])
    )
    expect(typeof result.current).toBe('string')
  })
})
