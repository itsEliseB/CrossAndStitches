import { describe, it, expect } from 'vitest'
import {
  findClosestDMCColor,
  mapToDMCColors,
  TRANSPARENT,
  allDMCColors
} from '@/utils/dmcColors'

describe('Color Quantization', () => {
  describe('findClosestDMCColor()', () => {
    it('returns exact match when color exists in DMC palette', () => {
      const dmcRed = '#C72B3B' // DMC 321 Red
      const result = findClosestDMCColor(dmcRed)
      expect(result).toBe(dmcRed)
    })

    it('finds closest color for arbitrary hex color', () => {
      // Pure red should map to a red DMC color
      const pureRed = '#FF0000'
      const result = findClosestDMCColor(pureRed)

      // Result should be a valid DMC color
      const isDMCColor = allDMCColors.some(c => c.hex === result)
      expect(isDMCColor).toBe(true)

      // Should be some shade of red (R > G and R > B)
      const rgb = hexToRgb(result)
      expect(rgb.r).toBeGreaterThan(rgb.g)
      expect(rgb.r).toBeGreaterThan(rgb.b)
    })

    it('finds closest color for pure blue', () => {
      const pureBlue = '#0000FF'
      const result = findClosestDMCColor(pureBlue)

      // Result should be a valid DMC color
      const isDMCColor = allDMCColors.some(c => c.hex === result)
      expect(isDMCColor).toBe(true)

      // Should be some shade of blue (B > R and B > G)
      const rgb = hexToRgb(result)
      expect(rgb.b).toBeGreaterThan(rgb.r)
      expect(rgb.b).toBeGreaterThan(rgb.g)
    })

    it('finds closest color for pure green', () => {
      const pureGreen = '#00FF00'
      const result = findClosestDMCColor(pureGreen)

      // Result should be a valid DMC color
      const isDMCColor = allDMCColors.some(c => c.hex === result)
      expect(isDMCColor).toBe(true)

      // Should be some shade of green (G > R and G > B)
      const rgb = hexToRgb(result)
      expect(rgb.g).toBeGreaterThan(rgb.r)
      expect(rgb.g).toBeGreaterThan(rgb.b)
    })

    it('handles hex color without # prefix', () => {
      const result = findClosestDMCColor('FF0000')

      // Should still return a valid DMC color
      const isDMCColor = allDMCColors.some(c => c.hex === result)
      expect(isDMCColor).toBe(true)
    })

    it('returns TRANSPARENT for transparent color', () => {
      expect(findClosestDMCColor(TRANSPARENT)).toBe(TRANSPARENT)
    })

    it('returns TRANSPARENT for null', () => {
      expect(findClosestDMCColor(null)).toBe(TRANSPARENT)
    })

    it('returns TRANSPARENT for undefined', () => {
      expect(findClosestDMCColor(undefined)).toBe(TRANSPARENT)
    })

    it('returns TRANSPARENT for empty string', () => {
      expect(findClosestDMCColor('')).toBe(TRANSPARENT)
    })

    it('finds closest color for white', () => {
      const white = '#FFFFFF'
      const result = findClosestDMCColor(white)

      // Result should be a valid DMC color
      const isDMCColor = allDMCColors.some(c => c.hex === result)
      expect(isDMCColor).toBe(true)

      // Should be a very light color (all RGB values high)
      const rgb = hexToRgb(result)
      expect(rgb.r).toBeGreaterThan(200)
      expect(rgb.g).toBeGreaterThan(200)
      expect(rgb.b).toBeGreaterThan(200)
    })

    it('finds closest color for black', () => {
      const black = '#000000'
      const result = findClosestDMCColor(black)

      // Result should be a valid DMC color
      const isDMCColor = allDMCColors.some(c => c.hex === result)
      expect(isDMCColor).toBe(true)

      // Should be a very dark color (all RGB values low)
      const rgb = hexToRgb(result)
      expect(rgb.r).toBeLessThan(100)
      expect(rgb.g).toBeLessThan(100)
      expect(rgb.b).toBeLessThan(100)
    })

    it('returns consistent results for same color', () => {
      const color = '#FF5733'
      const result1 = findClosestDMCColor(color)
      const result2 = findClosestDMCColor(color)

      expect(result1).toBe(result2)
    })

    it('different input colors may map to same DMC color', () => {
      // Two very similar reds
      const red1 = '#FF0000'
      const red2 = '#FE0000'

      const result1 = findClosestDMCColor(red1)
      const result2 = findClosestDMCColor(red2)

      // May or may not be the same, but both should be valid DMC colors
      expect(allDMCColors.some(c => c.hex === result1)).toBe(true)
      expect(allDMCColors.some(c => c.hex === result2)).toBe(true)
    })
  })

  describe('mapToDMCColors()', () => {
    it('maps array of colors to DMC colors', () => {
      const colors = ['#FF0000', '#00FF00', '#0000FF']
      const result = mapToDMCColors(colors)

      expect(result.length).toBe(3)
      result.forEach(color => {
        const isDMCColor = allDMCColors.some(c => c.hex === color)
        expect(isDMCColor).toBe(true)
      })
    })

    it('handles empty array', () => {
      const result = mapToDMCColors([])
      expect(result).toEqual([])
    })

    it('handles array with transparent colors', () => {
      const colors = ['#FF0000', TRANSPARENT, '#0000FF']
      const result = mapToDMCColors(colors)

      expect(result.length).toBe(3)
      expect(result[1]).toBe(TRANSPARENT)
      expect(allDMCColors.some(c => c.hex === result[0])).toBe(true)
      expect(allDMCColors.some(c => c.hex === result[2])).toBe(true)
    })

    it('handles array with duplicate colors', () => {
      const colors = ['#FF0000', '#FF0000', '#FF0000']
      const result = mapToDMCColors(colors)

      expect(result.length).toBe(3)
      // All should map to the same DMC color
      expect(result[0]).toBe(result[1])
      expect(result[1]).toBe(result[2])
    })
  })
})

// Helper function for tests
function hexToRgb(hex) {
  hex = hex.replace(/^#/, '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return { r, g, b }
}
