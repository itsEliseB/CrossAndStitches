import { describe, it, expect, vi } from 'vitest'
import { nextTick } from 'vue'
import { setupTestHooks } from './setup'
import { TRANSPARENT } from '@/utils/dmcColors'
import { createMouseEvent } from '../../helpers/testUtils'

describe('CreateDesign - Drawing Tools', () => {
  const { getWrapper } = setupTestHooks()

  describe('Tool Switching', () => {
    it('switches to draw tool when clicking draw button', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const drawBtn = wrapper.findAll('.setting-group .btn').find(btn => btn.text().includes('Draw'))

      await drawBtn.trigger('click')
      expect(vm.tool).toBe('draw')
    })

    it('switches to erase tool when clicking erase button', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const eraseBtn = wrapper.findAll('.setting-group .btn').find(btn => btn.text().includes('Erase'))

      await eraseBtn.trigger('click')
      expect(vm.tool).toBe('erase')
    })

    it('switches to bucket tool when clicking bucket button', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const bucketBtn = wrapper.findAll('.setting-group .btn').find(btn => btn.text().includes('Fill'))

      await bucketBtn.trigger('click')
      expect(vm.tool).toBe('bucket')
    })

    it('switches to eyedropper tool when clicking eyedropper button', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const eyedropperBtn = wrapper.findAll('.setting-group .btn').find(btn => btn.text().includes('Eyedropper'))

      await eyedropperBtn.trigger('click')
      expect(vm.tool).toBe('eyedropper')
    })

    it('highlights active tool button', async () => {
      const wrapper = getWrapper()
      const drawBtn = wrapper.findAll('.setting-group .btn').find(btn => btn.text().includes('Draw'))

      await drawBtn.trigger('click')
      expect(drawBtn.classes()).toContain('active')
    })
  })

  describe('Drawing Operations', () => {
    it('draws on canvas when clicking with draw tool', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const canvas = wrapper.find('canvas')

      vm.tool = 'draw'
      vm.currentColor = '#FF0000'

      await canvas.trigger('mousedown', { clientX: 10, clientY: 10 })

      // Grid should be updated (exact cell depends on getBoundingClientRect mock)
      expect(vm.grid[0][0]).toBe('#FF0000')
    })

    it('erases cells when clicking with erase tool', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const canvas = wrapper.find('canvas')

      // First draw something
      vm.grid[0][0] = '#FF0000'

      // Then erase it
      vm.tool = 'erase'
      await canvas.trigger('mousedown', { clientX: 10, clientY: 10 })

      expect(vm.grid[0][0]).toBe(TRANSPARENT)
    })

    it('sets isDrawing to true on mousedown', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const canvas = wrapper.find('canvas')

      await canvas.trigger('mousedown', { clientX: 10, clientY: 10 })

      expect(vm.isDrawing).toBe(true)
    })

    it('sets isDrawing to false on mouseup', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const canvas = wrapper.find('canvas')

      vm.isDrawing = true
      await canvas.trigger('mouseup')

      expect(vm.isDrawing).toBe(false)
    })

    it('draws with currently selected color', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const canvas = wrapper.find('canvas')

      vm.tool = 'draw'
      vm.currentColor = '#AABBCC'

      await canvas.trigger('mousedown', { clientX: 10, clientY: 10 })

      expect(vm.grid[0][0]).toBe('#AABBCC')
    })
  })

  describe('Brush Size', () => {
    it('initializes with brush size 1', () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      expect(vm.brushSize).toBe(1)
    })

    it('allows changing brush size', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const brushBtn3 = wrapper.findAll('.btn-brush-size').find(btn => btn.text() === '3x3')

      await brushBtn3.trigger('click')
      expect(vm.brushSize).toBe(3)
    })

    it('draws with larger brush size', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const canvas = wrapper.find('canvas')

      vm.tool = 'draw'
      vm.brushSize = 2
      vm.currentColor = '#FF0000'

      // Draw at position (1, 1) with 2x2 brush
      await canvas.trigger('mousedown', { clientX: 22, clientY: 22 })

      // With brushSize=2, clicking at (1,1) should draw a 2x2 area centered around it
      // Check that cells were drawn (the exact pattern depends on brush logic)
      const hasDrawnCells = vm.grid.flat().some(cell => cell === '#FF0000')
      expect(hasDrawnCells).toBe(true)
    })
  })

  describe('Color Selection', () => {
    it('changes current color when selecting from palette', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const paletteColors = wrapper.findAll('.palette-color')

      // Click a color (skip first which is transparent)
      await paletteColors[1].trigger('click')

      expect(vm.currentColor).not.toBe(TRANSPARENT)
    })

    it('allows selecting transparent color', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const paletteColors = wrapper.findAll('.palette-color')

      await paletteColors[0].trigger('click')

      expect(vm.currentColor).toBe(TRANSPARENT)
    })

    it('updates color via color input', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const colorInput = wrapper.find('input[type="color"]')

      await colorInput.setValue('#ABCDEF')

      expect(vm.currentColor).toBe('#abcdef')
    })
  })

  describe('Eyedropper Tool', () => {
    it('picks color from clicked cell', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const canvas = wrapper.find('canvas')

      // Set up a cell with a color
      vm.grid[0][0] = '#123456'

      // Switch to eyedropper
      vm.tool = 'eyedropper'

      // Click the cell
      await canvas.trigger('mousedown', { clientX: 10, clientY: 10 })

      expect(vm.currentColor).toBe('#123456')
    })

    it('switches to draw tool after picking color', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const canvas = wrapper.find('canvas')

      vm.grid[0][0] = '#FF0000'
      vm.tool = 'eyedropper'

      await canvas.trigger('mousedown', { clientX: 10, clientY: 10 })

      expect(vm.tool).toBe('draw')
    })
  })

  describe('Bucket Fill', () => {
    it('fills single cell when using bucket on isolated cell', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const canvas = wrapper.find('canvas')

      vm.tool = 'bucket'
      vm.currentColor = '#FF0000'

      await canvas.trigger('click', { clientX: 10, clientY: 10 })

      expect(vm.grid[0][0]).toBe('#FF0000')
    })

    it('fills connected region of same color', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const canvas = wrapper.find('canvas')

      // Create a small test grid (all transparent by default)
      vm.tool = 'bucket'
      vm.currentColor = '#FF0000'

      await canvas.trigger('click', { clientX: 10, clientY: 10 })

      // Should fill entire grid (all transparent)
      for (let y = 0; y < vm.gridHeight; y++) {
        for (let x = 0; x < vm.gridWidth; x++) {
          expect(vm.grid[y][x]).toBe('#FF0000')
        }
      }
    })

    it('does not fill across different colors', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const canvas = wrapper.find('canvas')

      // Create a horizontal barrier at row 1
      for (let x = 0; x < vm.gridWidth; x++) {
        vm.grid[1][x] = '#0000FF'
      }

      vm.tool = 'bucket'
      vm.currentColor = '#FF0000'

      // Click above the barrier at row 0
      await canvas.trigger('click', { clientX: 10, clientY: 10 })

      // Cells above barrier should be filled
      expect(vm.grid[0][0]).toBe('#FF0000')

      // Barrier should remain blue
      expect(vm.grid[1][0]).toBe('#0000FF')

      // Cells below barrier should remain transparent
      expect(vm.grid[2][0]).toBe(TRANSPARENT)
    })

    it('handles clicking on cell with same color as replacement', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const canvas = wrapper.find('canvas')

      vm.grid[0][0] = '#FF0000'
      vm.tool = 'bucket'
      vm.currentColor = '#FF0000'

      const gridBefore = JSON.parse(JSON.stringify(vm.grid))

      await canvas.trigger('click', { clientX: 10, clientY: 10 })

      // Grid should remain unchanged (optimization)
      expect(JSON.stringify(vm.grid)).toBe(JSON.stringify(gridBefore))
    })
  })
})
