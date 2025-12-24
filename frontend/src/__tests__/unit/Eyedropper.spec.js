import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import Designer from '@/views/Designer.vue'
import { TRANSPARENT } from '@/utils/dmcColors'

// Mock the API client
vi.mock('@/api/client', () => ({
  designsAPI: {
    create: vi.fn()
  }
}))

describe('Eyedropper Tool', () => {
  let wrapper
  let router

  beforeEach(async () => {
    // Create a real router instance for testing
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/designs', component: { template: '<div>Designs</div>' } }
      ]
    })

    wrapper = mount(Designer, {
      global: {
        plugins: [router]
      }
    })

    await nextTick()
  })

  afterEach(() => {
    wrapper?.unmount()
  })

  it('renders eyedropper button', () => {
    const buttons = wrapper.findAll('button')
    const eyedropperButton = buttons.find(btn => btn.text().includes('Eyedropper'))
    expect(eyedropperButton.exists()).toBe(true)
  })

  it('activates eyedropper tool when clicked', async () => {
    const vm = wrapper.vm
    const buttons = wrapper.findAll('button')
    const eyedropperButton = buttons.find(btn => btn.text().includes('Eyedropper'))

    await eyedropperButton.trigger('click')
    await nextTick()

    expect(vm.tool).toBe('eyedropper')
    expect(eyedropperButton.classes()).toContain('active')
  })

  it('picks color from clicked cell and switches to draw tool', async () => {
    const vm = wrapper.vm
    const canvas = wrapper.find('canvas')

    // First, draw a red cell
    vm.tool = 'draw'
    vm.currentColor = '#FF0000'
    await canvas.trigger('mousedown', { clientX: 10, clientY: 10 })
    await canvas.trigger('mouseup')
    await nextTick()

    expect(vm.grid[0][0]).toBe('#FF0000')

    // Change current color to blue
    vm.currentColor = '#0000FF'

    // Switch to eyedropper
    vm.tool = 'eyedropper'

    // Pick color from the red cell
    await canvas.trigger('mousedown', { clientX: 10, clientY: 10 })
    await nextTick()

    // Should have picked the red color
    expect(vm.currentColor).toBe('#FF0000')
    // Should have switched back to draw tool
    expect(vm.tool).toBe('draw')
  })

  it('does not pick transparent color', async () => {
    const vm = wrapper.vm
    const canvas = wrapper.find('canvas')

    // Set current color to red
    vm.currentColor = '#FF0000'

    // Switch to eyedropper
    vm.tool = 'eyedropper'

    // Try to pick from transparent cell
    await canvas.trigger('mousedown', { clientX: 10, clientY: 10 })
    await nextTick()

    // Color should remain unchanged (red)
    expect(vm.currentColor).toBe('#FF0000')
    // Should still switch to draw tool
    expect(vm.tool).toBe('draw')
  })

  it('does not capture state when using eyedropper', async () => {
    const vm = wrapper.vm
    const canvas = wrapper.find('canvas')

    // Get initial history length
    const initialHistoryLength = vm.history.length

    // Switch to eyedropper
    vm.tool = 'eyedropper'

    // Click on a cell
    await canvas.trigger('mousedown', { clientX: 10, clientY: 10 })
    await canvas.trigger('mouseup')
    await nextTick()

    // History should not have changed
    expect(vm.history.length).toBe(initialHistoryLength)
  })

  it('picks different colors correctly', async () => {
    const vm = wrapper.vm
    const canvas = wrapper.find('canvas')

    // Draw a red cell at (0, 0)
    vm.tool = 'draw'
    vm.currentColor = '#FF0000'
    await canvas.trigger('mousedown', { clientX: 10, clientY: 10 })
    await canvas.trigger('mouseup')
    await nextTick()

    // Draw a blue cell at (1, 0)
    vm.currentColor = '#0000FF'
    await canvas.trigger('mousedown', { clientX: 25, clientY: 10 })
    await canvas.trigger('mouseup')
    await nextTick()

    // Pick red color
    vm.tool = 'eyedropper'
    await canvas.trigger('mousedown', { clientX: 10, clientY: 10 })
    await nextTick()

    expect(vm.currentColor).toBe('#FF0000')

    // Pick blue color
    vm.tool = 'eyedropper'
    await canvas.trigger('mousedown', { clientX: 25, clientY: 10 })
    await nextTick()

    expect(vm.currentColor).toBe('#0000FF')
  })
})
