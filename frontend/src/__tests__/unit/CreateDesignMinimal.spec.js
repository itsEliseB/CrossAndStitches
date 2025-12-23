import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import CreateDesign from '@/views/CreateDesign.vue'

vi.mock('@/api/client', () => ({
  designsAPI: {
    create: vi.fn()
  }
}))

describe('CreateDesign Minimal', () => {
  let wrapper

  beforeEach(async () => {
    wrapper = mount(CreateDesign)
    await nextTick()
  })

  it('should mount', () => {
    expect(wrapper.exists()).toBe(true)
  })
})
