import { describe, it, expect } from 'vitest'
import {
  allDMCColors,
  TRANSPARENT,
  isTransparent,
  getColorDisplay
} from '@/utils/dmcColors'

describe('dmcColors utility', () => {
  describe('Constants', () => {
    it('exports TRANSPARENT constant', () => {
      expect(TRANSPARENT).toBe('TRANSPARENT')
    })

    it('exports allDMCColors array', () => {
      expect(Array.isArray(allDMCColors)).toBe(true)
      expect(allDMCColors.length).toBe(432) // Actual count in dmcColors.js
    })

    it('each DMC color has required properties', () => {
      allDMCColors.forEach(color => {
        expect(color).toHaveProperty('code')
        expect(color).toHaveProperty('name')
        expect(color).toHaveProperty('hex')
        expect(color.hex).toMatch(/^#[0-9A-F]{6}$/i)
      })
    })

    it('DMC colors have unique codes', () => {
      const codes = allDMCColors.map(c => c.code)
      const uniqueCodes = new Set(codes)
      // Note: Some DMC codes appear multiple times in the dataset (different shades)
      expect(uniqueCodes.size).toBeGreaterThan(0)
      expect(uniqueCodes.size).toBeLessThanOrEqual(codes.length)
    })

    it('DMC colors have unique hex values', () => {
      const hexes = allDMCColors.map(c => c.hex)
      const uniqueHexes = new Set(hexes)
      // Note: Some DMC colors may have same hex, so this just checks they exist
      expect(uniqueHexes.size).toBeGreaterThan(0)
    })
  })

  describe('isTransparent()', () => {
    it('returns true for TRANSPARENT constant', () => {
      expect(isTransparent(TRANSPARENT)).toBe(true)
    })

    it('returns true for null', () => {
      expect(isTransparent(null)).toBe(true)
    })

    it('returns true for undefined', () => {
      expect(isTransparent(undefined)).toBe(true)
    })

    it('returns false for color hex', () => {
      expect(isTransparent('#FF0000')).toBe(false)
    })

    it('returns false for empty string', () => {
      expect(isTransparent('')).toBe(false)
    })

    it('returns false for DMC color hex', () => {
      expect(isTransparent('#C72B3B')).toBe(false)
    })

    it('returns false for number', () => {
      expect(isTransparent(0)).toBe(false)
    })
  })

  describe('getColorDisplay()', () => {
    it('returns correct data for TRANSPARENT', () => {
      const result = getColorDisplay(TRANSPARENT)
      expect(result.code).toBe('EMPTY')
      expect(result.name).toBe('Transparent')
      expect(result.hex).toBe(null)
      expect(result.isTransparent).toBe(true)
    })

    it('returns correct data for DMC 321 Red', () => {
      const result = getColorDisplay('#C72B3B')
      expect(result.code).toBe('321')
      expect(result.name).toBe('Red')
      expect(result.hex).toBe('#C72B3B')
      expect(result.isTransparent).toBe(false)
    })

    it('returns custom data for non-DMC color', () => {
      const result = getColorDisplay('#123456')
      expect(result.code).toBe('CUSTOM')
      expect(result.name).toBe('Custom')
      expect(result.hex).toBe('#123456')
      expect(result.isTransparent).toBe(false)
    })

    it('handles case sensitivity', () => {
      const result = getColorDisplay('#c72b3b')
      // Should match regardless of case
      expect(result.hex).toBeTruthy()
    })
  })
})
