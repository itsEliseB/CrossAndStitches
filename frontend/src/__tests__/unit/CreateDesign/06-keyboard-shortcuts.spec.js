import { describe, it, expect, vi } from 'vitest'
import { nextTick } from 'vue'
import { setupTestHooks } from './setup'
import { TRANSPARENT } from '@/utils/dmcColors'
import { createKeyboardEvent } from '../../helpers/testUtils'

describe('CreateDesign - Keyboard Shortcuts', () => {
  const { getWrapper } = setupTestHooks()

  describe('Undo Shortcuts', () => {
    it('triggers undo on Ctrl+Z', async () => {
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

      // Trigger Ctrl+Z
      const keyEvent = createKeyboardEvent('z', { ctrlKey: true })
      window.dispatchEvent(keyEvent)
      await nextTick()

      expect(vm.grid[0][0]).toBe(TRANSPARENT)
    })

    it('triggers undo on Cmd+Z (Mac)', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const canvas = wrapper.find('canvas')

      // Make a change
      vm.tool = 'draw'
      vm.currentColor = '#FF0000'
      await canvas.trigger('mousedown', { clientX: 10, clientY: 10 })
      await canvas.trigger('mouseup')
      await nextTick()

      // Trigger Cmd+Z
      const keyEvent = createKeyboardEvent('z', { metaKey: true })
      window.dispatchEvent(keyEvent)
      await nextTick()

      expect(vm.grid[0][0]).toBe(TRANSPARENT)
    })

    it('prevents default browser behavior for Ctrl+Z', () => {
      const wrapper = getWrapper()
      const keyEvent = createKeyboardEvent('z', { ctrlKey: true })
      const preventDefaultSpy = vi.spyOn(keyEvent, 'preventDefault')

      window.dispatchEvent(keyEvent)

      expect(preventDefaultSpy).toHaveBeenCalled()
    })

    it('does not trigger undo when isDrawing is true', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const canvas = wrapper.find('canvas')

      // Start drawing
      vm.tool = 'draw'
      await canvas.trigger('mousedown', { clientX: 10, clientY: 10 })

      expect(vm.isDrawing).toBe(true)

      const gridBefore = JSON.parse(JSON.stringify(vm.grid))

      // Try to undo
      const keyEvent = createKeyboardEvent('z', { ctrlKey: true })
      window.dispatchEvent(keyEvent)
      await nextTick()

      // Grid should be unchanged
      expect(JSON.stringify(vm.grid)).toBe(JSON.stringify(gridBefore))
    })
  })

  describe('Redo Shortcuts', () => {
    it('triggers redo on Ctrl+Y', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const canvas = wrapper.find('canvas')

      // Make a change and undo
      vm.tool = 'draw'
      vm.currentColor = '#FF0000'
      await canvas.trigger('mousedown', { clientX: 10, clientY: 10 })
      await canvas.trigger('mouseup')
      await nextTick()

      vm.undo()
      await nextTick()

      // Trigger Ctrl+Y
      const keyEvent = createKeyboardEvent('y', { ctrlKey: true })
      window.dispatchEvent(keyEvent)
      await nextTick()

      expect(vm.grid[0][0]).toBe('#FF0000')
    })

    it('triggers redo on Ctrl+Shift+Z', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const canvas = wrapper.find('canvas')

      // Make a change and undo
      vm.tool = 'draw'
      vm.currentColor = '#FF0000'
      await canvas.trigger('mousedown', { clientX: 10, clientY: 10 })
      await canvas.trigger('mouseup')
      await nextTick()

      vm.undo()
      await nextTick()

      // Trigger Ctrl+Shift+Z
      const keyEvent = createKeyboardEvent('z', { ctrlKey: true, shiftKey: true })
      window.dispatchEvent(keyEvent)
      await nextTick()

      expect(vm.grid[0][0]).toBe('#FF0000')
    })

    it('triggers redo on Cmd+Shift+Z (Mac)', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const canvas = wrapper.find('canvas')

      // Make a change and undo
      vm.tool = 'draw'
      vm.currentColor = '#FF0000'
      await canvas.trigger('mousedown', { clientX: 10, clientY: 10 })
      await canvas.trigger('mouseup')
      await nextTick()

      vm.undo()
      await nextTick()

      // Trigger Cmd+Shift+Z
      const keyEvent = createKeyboardEvent('z', { metaKey: true, shiftKey: true })
      window.dispatchEvent(keyEvent)
      await nextTick()

      expect(vm.grid[0][0]).toBe('#FF0000')
    })

    it('prevents default browser behavior for Ctrl+Y', () => {
      const wrapper = getWrapper()
      const keyEvent = createKeyboardEvent('y', { ctrlKey: true })
      const preventDefaultSpy = vi.spyOn(keyEvent, 'preventDefault')

      window.dispatchEvent(keyEvent)

      expect(preventDefaultSpy).toHaveBeenCalled()
    })

    it('does not trigger redo when isDrawing is true', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const canvas = wrapper.find('canvas')

      // Make a change, undo, then start drawing
      vm.tool = 'draw'
      await canvas.trigger('mousedown', { clientX: 10, clientY: 10 })
      await canvas.trigger('mouseup')
      await nextTick()

      vm.undo()
      await nextTick()

      await canvas.trigger('mousedown', { clientX: 25, clientY: 10 })

      expect(vm.isDrawing).toBe(true)

      const gridBefore = JSON.parse(JSON.stringify(vm.grid))

      // Try to redo
      const keyEvent = createKeyboardEvent('y', { ctrlKey: true })
      window.dispatchEvent(keyEvent)
      await nextTick()

      // Grid should be unchanged
      expect(JSON.stringify(vm.grid)).toBe(JSON.stringify(gridBefore))
    })
  })

  describe('Keyboard Shortcut Correctness', () => {
    it('ignores Ctrl+Z with additional modifiers (except Shift)', () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const undoSpy = vi.spyOn(vm, 'undo')

      // Ctrl+Shift+Z should trigger redo, not undo
      const keyEvent = createKeyboardEvent('z', { ctrlKey: true, shiftKey: true })
      window.dispatchEvent(keyEvent)

      expect(undoSpy).not.toHaveBeenCalled()
    })

    it('keyboard shortcuts work with both Ctrl and Cmd', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const canvas = wrapper.find('canvas')

      // Make a change
      vm.tool = 'draw'
      await canvas.trigger('mousedown', { clientX: 10, clientY: 10 })
      await canvas.trigger('mouseup')
      await nextTick()

      const indexBeforeUndo = vm.historyIndex

      // Undo with Cmd
      let keyEvent = createKeyboardEvent('z', { metaKey: true })
      window.dispatchEvent(keyEvent)
      await nextTick()

      expect(vm.historyIndex).toBeLessThan(indexBeforeUndo)

      const indexAfterUndo = vm.historyIndex

      // Redo with Ctrl
      keyEvent = createKeyboardEvent('y', { ctrlKey: true })
      window.dispatchEvent(keyEvent)
      await nextTick()

      expect(vm.historyIndex).toBeGreaterThan(indexAfterUndo)
    })

    it('keyboard shortcuts respect canUndo and canRedo', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm

      // Try to undo when at initial state
      expect(vm.canUndo).toBe(false)

      const keyEvent = createKeyboardEvent('z', { ctrlKey: true })
      window.dispatchEvent(keyEvent)
      await nextTick()

      // historyIndex should remain 0
      expect(vm.historyIndex).toBe(0)
    })
  })

  describe('Rapid Keyboard Usage', () => {
    it('supports rapid undo/redo via keyboard', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const canvas = wrapper.find('canvas')

      // Make 3 changes
      vm.tool = 'draw'
      for (let i = 0; i < 3; i++) {
        await canvas.trigger('mousedown', { clientX: 10 + i * 15, clientY: 10 })
        await canvas.trigger('mouseup')
        await nextTick()
      }

      const maxIndex = vm.historyIndex

      // Rapid undo 3 times
      for (let i = 0; i < 3; i++) {
        const keyEvent = createKeyboardEvent('z', { ctrlKey: true })
        window.dispatchEvent(keyEvent)
        await nextTick()
      }

      // Should have undone multiple times
      expect(vm.historyIndex).toBeLessThan(maxIndex)

      // Rapid redo 3 times
      for (let i = 0; i < 3; i++) {
        const keyEvent = createKeyboardEvent('y', { ctrlKey: true })
        window.dispatchEvent(keyEvent)
        await nextTick()
      }

      // Should have redone
      expect(vm.historyIndex).toBeGreaterThan(0)
    })
  })

  describe('Event Listener Lifecycle', () => {
    it('keyboard shortcuts work after component mounts', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const canvas = wrapper.find('canvas')

      // Make a change
      vm.tool = 'draw'
      await canvas.trigger('mousedown', { clientX: 10, clientY: 10 })
      await canvas.trigger('mouseup')
      await nextTick()

      // Keyboard shortcut should work (listener is registered)
      const keyEvent = createKeyboardEvent('z', { ctrlKey: true })
      window.dispatchEvent(keyEvent)
      await nextTick()

      // Undo should have happened
      expect(vm.grid[0][0]).toBe(TRANSPARENT)
    })

    it('component can be safely unmounted', () => {
      const wrapper = getWrapper()

      // Should not throw error
      expect(() => wrapper.unmount()).not.toThrow()
    })
  })
})
