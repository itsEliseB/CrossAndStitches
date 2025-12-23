import { describe, it, expect } from 'vitest'
import { nextTick } from 'vue'
import { setupTestHooks } from './setup'
import { TRANSPARENT } from '@/utils/dmcColors'

describe('CreateDesign - Undo/Redo System', () => {
  const { getWrapper } = setupTestHooks()

  describe('Initialization', () => {
    it('initializes with undo disabled', () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const undoBtn = wrapper.findAll('button').find(btn => btn.text().includes('Undo'))

      // At initial state, can't undo
      expect(vm.canUndo).toBe(false)
      expect(undoBtn.attributes('disabled')).toBeDefined()
    })

    it('initializes with redo disabled', () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const redoBtn = wrapper.findAll('button').find(btn => btn.text().includes('Redo'))

      expect(vm.canRedo).toBe(false)
      expect(redoBtn.attributes('disabled')).toBeDefined()
    })

    it('history stores initial state', () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm

      expect(vm.history.length).toBeGreaterThanOrEqual(1)
      expect(vm.history[0]).toHaveProperty('grid')
      expect(vm.history[0]).toHaveProperty('width')
      expect(vm.history[0]).toHaveProperty('height')
    })
  })

  describe('Undo Operations', () => {
    it('enables undo after making a change', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const canvas = wrapper.find('canvas')

      vm.tool = 'draw'
      await canvas.trigger('mousedown', { clientX: 10, clientY: 10 })
      await canvas.trigger('mouseup')
      await nextTick()

      expect(vm.canUndo).toBe(true)
    })

    it('undoes drawing action', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const canvas = wrapper.find('canvas')

      vm.tool = 'draw'
      vm.currentColor = '#FF0000'

      await canvas.trigger('mousedown', { clientX: 10, clientY: 10 })
      await canvas.trigger('mouseup')
      await nextTick()

      expect(vm.grid[0][0]).toBe('#FF0000')

      vm.undo()
      await nextTick()

      expect(vm.grid[0][0]).toBe(TRANSPARENT)
    })

    it('blocks undo during drawing', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const canvas = wrapper.find('canvas')

      vm.tool = 'draw'
      await canvas.trigger('mousedown', { clientX: 10, clientY: 10 })

      expect(vm.isDrawing).toBe(true)

      const gridBefore = JSON.parse(JSON.stringify(vm.grid))
      vm.undo()
      await nextTick()

      // Grid should not change (undo blocked)
      expect(JSON.stringify(vm.grid)).toBe(JSON.stringify(gridBefore))
    })

    it('undo restores exact grid state', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const canvas = wrapper.find('canvas')

      const originalGrid = JSON.parse(JSON.stringify(vm.grid))

      vm.tool = 'draw'
      vm.currentColor = '#FF0000'
      await canvas.trigger('mousedown', { clientX: 10, clientY: 10 })
      await canvas.trigger('mouseup')
      await nextTick()

      vm.undo()
      await nextTick()

      expect(JSON.stringify(vm.grid)).toBe(JSON.stringify(originalGrid))
    })
  })

  describe('Redo Operations', () => {
    it('enables redo after undo', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const canvas = wrapper.find('canvas')

      vm.tool = 'draw'
      await canvas.trigger('mousedown', { clientX: 10, clientY: 10 })
      await canvas.trigger('mouseup')
      await nextTick()

      vm.undo()
      await nextTick()

      expect(vm.canRedo).toBe(true)
    })

    it('redoes undone action', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const canvas = wrapper.find('canvas')

      vm.tool = 'draw'
      vm.currentColor = '#FF0000'

      await canvas.trigger('mousedown', { clientX: 10, clientY: 10 })
      await canvas.trigger('mouseup')
      await nextTick()

      vm.undo()
      await nextTick()

      vm.redo()
      await nextTick()

      expect(vm.grid[0][0]).toBe('#FF0000')
    })

    it('clears redo history when making new action after undo', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const canvas = wrapper.find('canvas')

      vm.tool = 'draw'

      // Draw, undo, then draw again
      await canvas.trigger('mousedown', { clientX: 10, clientY: 10 })
      await canvas.trigger('mouseup')
      await nextTick()

      vm.undo()
      await nextTick()

      await canvas.trigger('mousedown', { clientX: 25, clientY: 10 })
      await canvas.trigger('mouseup')
      await nextTick()

      // Redo should now be disabled
      expect(vm.canRedo).toBe(false)
    })
  })

  describe('Button Interactions', () => {
    it('clicking undo button triggers undo', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const canvas = wrapper.find('canvas')

      // Make a change
      vm.tool = 'draw'
      vm.currentColor = '#FF0000'
      await canvas.trigger('mousedown', { clientX: 10, clientY: 10 })
      await canvas.trigger('mouseup')
      await nextTick()

      expect(vm.grid[0][0]).toBe('#FF0000')

      const undoBtn = wrapper.findAll('button').find(btn => btn.text().includes('Undo'))
      await undoBtn.trigger('click')
      await nextTick()

      expect(vm.grid[0][0]).toBe(TRANSPARENT)
    })

    it('clicking redo button triggers redo', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const canvas = wrapper.find('canvas')

      // Make a change and undo it
      vm.tool = 'draw'
      vm.currentColor = '#FF0000'
      await canvas.trigger('mousedown', { clientX: 10, clientY: 10 })
      await canvas.trigger('mouseup')
      await nextTick()

      vm.undo()
      await nextTick()

      expect(vm.grid[0][0]).toBe(TRANSPARENT)

      const redoBtn = wrapper.findAll('button').find(btn => btn.text().includes('Redo'))
      await redoBtn.trigger('click')
      await nextTick()

      expect(vm.grid[0][0]).toBe('#FF0000')
    })
  })

  describe('History Management', () => {
    it('captures state before grid modifications', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const historyLengthBefore = vm.history.length

      vm.addRowTop()
      await nextTick()

      expect(vm.history.length).toBe(historyLengthBefore + 1)
    })

    it('supports undo after bucket fill', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const canvas = wrapper.find('canvas')

      vm.tool = 'bucket'
      vm.currentColor = '#ABCDEF'

      await canvas.trigger('click', { clientX: 10, clientY: 10 })
      await nextTick()

      // Grid should be filled
      expect(vm.grid[0][0]).toBe('#ABCDEF')

      vm.undo()
      await nextTick()

      // Should be back to transparent
      expect(vm.grid[0][0]).toBe(TRANSPARENT)
    })
  })
})
