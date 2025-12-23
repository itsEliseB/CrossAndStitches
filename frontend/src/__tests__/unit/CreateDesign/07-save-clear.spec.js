import { describe, it, expect, vi, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { setupTestHooks } from './setup'
import { TRANSPARENT } from '@/utils/dmcColors'
import { designsAPI } from '@/api/client'
import { flushPromises } from '../../helpers/testUtils'

describe('CreateDesign - Save & Clear', () => {
  const { getWrapper, getRouter } = setupTestHooks()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Save Form UI', () => {
    it('renders save button', () => {
      const wrapper = getWrapper()
      const saveBtn = wrapper.findAll('button').find(btn => btn.text().includes('Save Design'))
      expect(saveBtn.exists()).toBe(true)
    })

    it('renders title input', () => {
      const wrapper = getWrapper()
      const titleInput = wrapper.find('input[type="text"]')
      expect(titleInput.exists()).toBe(true)
    })

    it('renders description textarea', () => {
      const wrapper = getWrapper()
      const descriptionTextarea = wrapper.find('textarea')
      expect(descriptionTextarea.exists()).toBe(true)
    })

    it('updates title when typing', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const titleInput = wrapper.find('input[placeholder="My Cross-Stitch Pattern"]')

      await titleInput.setValue('My Design')

      expect(vm.title).toBe('My Design')
    })

    it('updates description when typing', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const descriptionTextarea = wrapper.find('textarea')

      await descriptionTextarea.setValue('A beautiful pattern')

      expect(vm.description).toBe('A beautiful pattern')
    })
  })

  describe('Save Validation', () => {
    it('shows error when saving without title', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm

      vm.title = ''
      await vm.saveDesign()

      expect(vm.saveError).toBe('Please enter a title')
    })

    it('shows error when saving with only whitespace title', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm

      vm.title = '   '
      await vm.saveDesign()

      expect(vm.saveError).toBe('Please enter a title')
    })
  })

  describe('Save API Calls', () => {
    it('calls designsAPI.create when saving with valid data', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm

      designsAPI.create.mockResolvedValue({ data: { id: 1 } })

      vm.title = 'Test Design'
      vm.description = 'Test Description'

      await vm.saveDesign()

      expect(designsAPI.create).toHaveBeenCalled()
    })

    it('sends correct data structure to API', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm

      designsAPI.create.mockResolvedValue({ data: { id: 1 } })

      vm.title = 'Test Design'
      vm.description = 'Test Description'
      vm.grid[0][0] = '#FF0000'

      await vm.saveDesign()

      const callArg = designsAPI.create.mock.calls[0][0]

      expect(callArg).toHaveProperty('title', 'Test Design')
      expect(callArg).toHaveProperty('description', 'Test Description')
      expect(callArg).toHaveProperty('width', 30)
      expect(callArg).toHaveProperty('height', 30)
      expect(callArg).toHaveProperty('design_data')
    })

    it('serializes grid as JSON in design_data', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm

      designsAPI.create.mockResolvedValue({ data: { id: 1 } })

      vm.title = 'Test'
      await vm.saveDesign()

      const callArg = designsAPI.create.mock.calls[0][0]
      const designData = JSON.parse(callArg.design_data)

      expect(designData).toHaveProperty('grid')
      expect(designData).toHaveProperty('palette')
      expect(Array.isArray(designData.grid)).toBe(true)
      expect(Array.isArray(designData.palette)).toBe(true)
    })

    it('extracts unique colors for palette', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm

      designsAPI.create.mockResolvedValue({ data: { id: 1 } })

      vm.title = 'Test'
      vm.grid[0][0] = '#FF0000'
      vm.grid[0][1] = '#00FF00'
      vm.grid[0][2] = '#FF0000' // Duplicate

      await vm.saveDesign()

      const callArg = designsAPI.create.mock.calls[0][0]
      const designData = JSON.parse(callArg.design_data)

      expect(designData.palette.length).toBe(2)
      expect(designData.palette).toContain('#FF0000')
      expect(designData.palette).toContain('#00FF00')
    })

    it('excludes transparent from palette', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm

      designsAPI.create.mockResolvedValue({ data: { id: 1 } })

      vm.title = 'Test'
      vm.grid[0][0] = '#FF0000'
      vm.grid[0][1] = TRANSPARENT

      await vm.saveDesign()

      const callArg = designsAPI.create.mock.calls[0][0]
      const designData = JSON.parse(callArg.design_data)

      expect(designData.palette.length).toBe(1)
      expect(designData.palette).toContain('#FF0000')
      expect(designData.palette).not.toContain(TRANSPARENT)
    })
  })

  describe('Save State Management', () => {
    it('sets saving state to true during save', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm

      designsAPI.create.mockImplementation(() => new Promise(resolve => {
        expect(vm.saving).toBe(true)
        resolve({ data: { id: 1 } })
      }))

      vm.title = 'Test'
      await vm.saveDesign()
    })

    it('sets saving state to false after save', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm

      designsAPI.create.mockResolvedValue({ data: { id: 1 } })

      vm.title = 'Test'
      await vm.saveDesign()

      expect(vm.saving).toBe(false)
    })

    it('disables save button while saving', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm

      vm.saving = true
      await nextTick()

      const saveBtn = wrapper.findAll('button').find(btn => btn.text().includes('Saving'))
      expect(saveBtn.attributes('disabled')).toBeDefined()
    })

    it('shows "Saving..." text while saving', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm

      vm.saving = true
      await nextTick()

      const saveBtn = wrapper.findAll('button').find(btn => btn.text().includes('Saving'))
      expect(saveBtn.text()).toBe('Saving...')
    })
  })

  describe('Save Success', () => {
    it('redirects to /designs after successful save', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      const router = getRouter()
      const pushSpy = vi.spyOn(router, 'push')

      designsAPI.create.mockResolvedValue({ data: { id: 1 } })

      vm.title = 'Test'
      await vm.saveDesign()
      await flushPromises()

      expect(pushSpy).toHaveBeenCalledWith('/designs')
    })

    it('clears saveError before new save attempt', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm

      vm.saveError = 'Previous error'
      designsAPI.create.mockResolvedValue({ data: { id: 1 } })

      vm.title = 'Test'
      await vm.saveDesign()

      expect(vm.saveError).toBe(null)
    })
  })

  describe('Save Error Handling', () => {
    it('shows error message on save failure', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm

      designsAPI.create.mockRejectedValue({
        response: { data: { detail: 'Server error' } }
      })

      vm.title = 'Test'
      await vm.saveDesign()

      expect(vm.saveError).toBe('Server error')
    })

    it('shows generic error if no detail in response', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm

      designsAPI.create.mockRejectedValue(new Error('Network error'))

      vm.title = 'Test'
      await vm.saveDesign()

      expect(vm.saveError).toBe('Failed to save design')
    })

    it('displays error message in UI when save fails', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm

      designsAPI.create.mockRejectedValue({
        response: { data: { detail: 'Validation error' } }
      })

      vm.title = 'Test'
      await vm.saveDesign()
      await nextTick()

      const errorMsg = wrapper.find('.error-message')
      expect(errorMsg.exists()).toBe(true)
      expect(errorMsg.text()).toBe('Validation error')
    })
  })

  describe('Clear Grid', () => {
    it('renders clear button', () => {
      const wrapper = getWrapper()
      const clearBtn = wrapper.findAll('button').find(btn => btn.text().includes('Clear All'))
      expect(clearBtn.exists()).toBe(true)
    })

    it('shows confirmation dialog when clearing', async () => {
      const wrapper = getWrapper()
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)

      const clearBtn = wrapper.findAll('button').find(btn => btn.text().includes('Clear All'))
      await clearBtn.trigger('click')

      expect(confirmSpy).toHaveBeenCalledWith('Clear the entire grid?')
    })

    it('clears grid when confirmed', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      vi.spyOn(window, 'confirm').mockReturnValue(true)

      // Add some content
      vm.grid[0][0] = '#FF0000'
      vm.grid[5][5] = '#00FF00'

      vm.clearGrid()
      await nextTick()

      // All cells should be transparent
      expect(vm.grid[0][0]).toBe(TRANSPARENT)
      expect(vm.grid[5][5]).toBe(TRANSPARENT)
    })

    it('does not clear grid when cancelled', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      vi.spyOn(window, 'confirm').mockReturnValue(false)

      // Add some content
      vm.grid[0][0] = '#FF0000'

      vm.clearGrid()
      await nextTick()

      // Content should remain
      expect(vm.grid[0][0]).toBe('#FF0000')
    })

    it('captures state before clearing when confirmed', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      vi.spyOn(window, 'confirm').mockReturnValue(true)

      const historyLengthBefore = vm.history.length

      vm.clearGrid()
      await nextTick()

      expect(vm.history.length).toBe(historyLengthBefore + 1)
    })

    it('supports undo after clearing', async () => {
      const wrapper = getWrapper()
      const vm = wrapper.vm
      vi.spyOn(window, 'confirm').mockReturnValue(true)

      // Add content and capture state
      vm.grid[0][0] = '#FF0000'
      vm.captureState() // Manually capture state to ensure it's in history
      await nextTick()

      // Clear
      vm.clearGrid()
      await nextTick()

      expect(vm.grid[0][0]).toBe(TRANSPARENT)

      // Undo
      vm.undo()
      await nextTick()

      // Should restore the colored cell
      const hasRedCell = vm.grid.flat().some(cell => cell === '#FF0000')
      expect(hasRedCell).toBe(true)
    })
  })
})
