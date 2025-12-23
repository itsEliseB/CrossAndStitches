import { vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import CreateDesign from '@/views/CreateDesign.vue'

// Mock the API client
vi.mock('@/api/client', () => ({
  designsAPI: {
    create: vi.fn()
  }
}))

// Mock canvas get Context
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 1,
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn()
}))

// Mock getBoundingClientRect
HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn(() => ({
  left: 0,
  top: 0,
  right: 450,
  bottom: 450,
  width: 450,
  height: 450,
  x: 0,
  y: 0
}))

/**
 * Setup function to create a mounted wrapper with mocks
 */
export function createWrapper(options = {}) {
  // Create a real router instance for testing
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } },
      { path: '/designs', component: { template: '<div>Designs</div>' } }
    ]
  })

  const wrapper = mount(CreateDesign, {
    global: {
      plugins: [router]
    },
    ...options
  })

  return { wrapper, router }
}

/**
 * Setup beforeEach and afterEach hooks
 */
export function setupTestHooks() {
  let wrapper
  let router

  beforeEach(async () => {
    const result = createWrapper()
    wrapper = result.wrapper
    router = result.router
    await nextTick()
  })

  afterEach(() => {
    wrapper?.unmount()
    vi.clearAllMocks()
  })

  return {
    getWrapper: () => wrapper,
    getRouter: () => router
  }
}
