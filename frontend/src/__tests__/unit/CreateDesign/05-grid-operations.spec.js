import { describe, it, expect } from 'vitest'
import { nextTick } from 'vue'
import { setupTestHooks } from './setup'
import { TRANSPARENT } from '@/utils/dmcColors'

describe('CreateDesign - Grid Operations', () => {
  const { getWrapper } = setupTestHooks()

  describe('Grid Resizing', () => {
    it('resizes grid when clicking resize button', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm

      vm.gridWidth = 40
      vm.gridHeight = 50

      const resizeBtn = wrapper.findAll('button').find(btn => btn.text().includes('Resize'))
      await resizeBtn.trigger('click')

      expect(vm.grid.length).toBe(50)
      expect(vm.grid[0].length).toBe(40)
    })

    it('centers existing content when resizing larger', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm

      // Draw in center of current grid
      vm.grid[15][15] = '#FF0000'

      // Resize to larger
      vm.gridWidth = 50
      vm.gridHeight = 50
      vm.resizeGrid()
      await nextTick()

      // Content should be centered (moved by offset)
      const expectedY = 15 + Math.floor((50 - 30) / 2)
      const expectedX = 15 + Math.floor((50 - 30) / 2)

      expect(vm.grid[expectedY][expectedX]).toBe('#FF0000')
    })

    it('updates canvas dimensions after grid resize', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const canvas = wrapper.find('canvas').element

      vm.gridWidth = 40
      vm.gridHeight = 50
      vm.resizeGrid()
      await nextTick()

      expect(canvas.width).toBe(40 * 15)
      expect(canvas.height).toBe(50 * 15)
    })
  })

  describe('Add Rows', () => {
    it('adds row to top', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const initialHeight = vm.gridHeight

      vm.grid[0][0] = '#FF0000'

      vm.addRowTop()
      await nextTick()

      expect(vm.gridHeight).toBe(initialHeight + 1)
      expect(vm.grid.length).toBe(initialHeight + 1)

      // New row should be transparent
      expect(vm.grid[0][0]).toBe(TRANSPARENT)

      // Old content shifted down
      expect(vm.grid[1][0]).toBe('#FF0000')
    })

    it('adds row to bottom', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const initialHeight = vm.gridHeight

      vm.grid[29][0] = '#FF0000'

      vm.addRowBottom()
      await nextTick()

      expect(vm.gridHeight).toBe(initialHeight + 1)
      expect(vm.grid.length).toBe(initialHeight + 1)

      // New row should be transparent
      expect(vm.grid[30][0]).toBe(TRANSPARENT)

      // Old content unchanged
      expect(vm.grid[29][0]).toBe('#FF0000')
    })
  })

  describe('Add Columns', () => {
    it('adds column to left', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const initialWidth = vm.gridWidth

      vm.grid[0][0] = '#FF0000'

      vm.addColumnLeft()
      await nextTick()

      expect(vm.gridWidth).toBe(initialWidth + 1)
      expect(vm.grid[0].length).toBe(initialWidth + 1)

      // New column should be transparent
      expect(vm.grid[0][0]).toBe(TRANSPARENT)

      // Old content shifted right
      expect(vm.grid[0][1]).toBe('#FF0000')
    })

    it('adds column to right', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const initialWidth = vm.gridWidth

      vm.grid[0][29] = '#FF0000'

      vm.addColumnRight()
      await nextTick()

      expect(vm.gridWidth).toBe(initialWidth + 1)
      expect(vm.grid[0].length).toBe(initialWidth + 1)

      // New column should be transparent
      expect(vm.grid[0][30]).toBe(TRANSPARENT)

      // Old content unchanged
      expect(vm.grid[0][29]).toBe('#FF0000')
    })
  })

  describe('Remove Rows', () => {
    it('removes row from top', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const initialHeight = vm.gridHeight

      vm.grid[0][0] = '#FF0000'
      vm.grid[1][0] = '#00FF00'

      vm.removeRowTop()
      await nextTick()

      expect(vm.gridHeight).toBe(initialHeight - 1)
      expect(vm.grid.length).toBe(initialHeight - 1)

      // First row removed, second row is now first
      expect(vm.grid[0][0]).toBe('#00FF00')
    })

    it('removes row from bottom', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const initialHeight = vm.gridHeight

      vm.grid[29][0] = '#FF0000'
      vm.grid[28][0] = '#00FF00'

      vm.removeRowBottom()
      await nextTick()

      expect(vm.gridHeight).toBe(initialHeight - 1)
      expect(vm.grid.length).toBe(initialHeight - 1)

      // Last row removed
      expect(vm.grid[28][0]).toBe('#00FF00')
      expect(vm.grid.length).toBe(29)
    })

    it('does not remove row if height <= 5', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm

      // Shrink to minimum
      while (vm.gridHeight > 5) {
        vm.removeRowTop()
      }

      expect(vm.gridHeight).toBe(5)

      // Try to remove further
      vm.removeRowTop()
      await nextTick()

      expect(vm.gridHeight).toBe(5)
    })
  })

  describe('Remove Columns', () => {
    it('removes column from left', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const initialWidth = vm.gridWidth

      vm.grid[0][0] = '#FF0000'
      vm.grid[0][1] = '#00FF00'

      vm.removeColumnLeft()
      await nextTick()

      expect(vm.gridWidth).toBe(initialWidth - 1)
      expect(vm.grid[0].length).toBe(initialWidth - 1)

      // First column removed, second column is now first
      expect(vm.grid[0][0]).toBe('#00FF00')
    })

    it('removes column from right', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const initialWidth = vm.gridWidth

      vm.grid[0][29] = '#FF0000'
      vm.grid[0][28] = '#00FF00'

      vm.removeColumnRight()
      await nextTick()

      expect(vm.gridWidth).toBe(initialWidth - 1)
      expect(vm.grid[0].length).toBe(initialWidth - 1)

      // Last column removed
      expect(vm.grid[0][28]).toBe('#00FF00')
      expect(vm.grid[0].length).toBe(29)
    })

    it('does not remove column if width <= 5', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm

      // Shrink to minimum
      while (vm.gridWidth > 5) {
        vm.removeColumnLeft()
      }

      expect(vm.gridWidth).toBe(5)

      // Try to remove further
      vm.removeColumnLeft()
      await nextTick()

      expect(vm.gridWidth).toBe(5)
    })
  })

  describe('Grid Info Display', () => {
    it('updates grid info display after modifications', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm

      vm.addRowTop()
      await nextTick()

      const gridInfo = wrapper.find('.grid-info')
      expect(gridInfo.text()).toBe('31×30')

      vm.addColumnRight()
      await nextTick()

      expect(gridInfo.text()).toBe('31×31')
    })
  })

  describe('Disable Buttons at Minimum Size', () => {
    it('disables remove buttons when at minimum size', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm

      // Shrink to minimum
      while (vm.gridHeight > 5) {
        vm.removeRowTop()
      }
      while (vm.gridWidth > 5) {
        vm.removeColumnLeft()
      }

      await nextTick()

      const removeButtons = wrapper.findAll('.btn-remove')
      removeButtons.forEach(btn => {
        expect(btn.attributes('disabled')).toBeDefined()
      })
    })
  })

  describe('Undo Support for Grid Operations', () => {
    it('supports undo after adding row', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const initialHeight = vm.gridHeight

      vm.addRowTop()
      await nextTick()

      expect(vm.gridHeight).toBe(initialHeight + 1)

      vm.undo()
      await nextTick()

      expect(vm.gridHeight).toBe(initialHeight)
    })

    it('supports undo after removing column', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const initialWidth = vm.gridWidth

      vm.removeColumnLeft()
      await nextTick()

      expect(vm.gridWidth).toBe(initialWidth - 1)

      vm.undo()
      await nextTick()

      expect(vm.gridWidth).toBe(initialWidth)
    })
  })

  describe('Content Preservation', () => {
    it('preserves content when adding then removing row', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm

      vm.grid[0][0] = '#FF0000'

      vm.addRowTop()
      await nextTick()

      // Content shifted down
      expect(vm.grid[1][0]).toBe('#FF0000')

      vm.removeRowTop()
      await nextTick()

      // Content back to original position
      expect(vm.grid[0][0]).toBe('#FF0000')
    })

    it('handles adding multiple rows in sequence', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const initialHeight = vm.gridHeight

      for (let i = 0; i < 5; i++) {
        vm.addRowBottom()
      }

      await nextTick()

      expect(vm.gridHeight).toBe(initialHeight + 5)
    })

    it('handles adding multiple columns in sequence', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const initialWidth = vm.gridWidth

      for (let i = 0; i < 5; i++) {
        vm.addColumnRight()
      }

      await nextTick()

      expect(vm.gridWidth).toBe(initialWidth + 5)
    })
  })
})
