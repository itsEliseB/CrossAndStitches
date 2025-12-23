import { vi } from 'vitest'

/**
 * Creates a mock router for testing
 */
export function createMockRouter(options = {}) {
  return {
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    ...options
  }
}

/**
 * Creates a mock route for testing
 */
export function createMockRoute(options = {}) {
  return {
    params: {},
    query: {},
    path: '/',
    ...options
  }
}

/**
 * Creates a mock canvas context with tracking
 */
export function createMockCanvasContext() {
  const calls = {
    fillRect: [],
    strokeRect: [],
    fillStyle: [],
    strokeStyle: []
  }

  return {
    context: {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      fillRect: vi.fn((...args) => calls.fillRect.push(args)),
      strokeRect: vi.fn((...args) => calls.strokeRect.push(args)),
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn()
    },
    calls
  }
}

/**
 * Helper to wait for Vue's nextTick and promises
 */
export async function flushPromises() {
  return new Promise(resolve => setTimeout(resolve, 0))
}

/**
 * Creates a mouse event for testing canvas interactions
 */
export function createMouseEvent(type, options = {}) {
  const { clientX = 0, clientY = 0, ...otherOptions } = options
  return new MouseEvent(type, {
    clientX,
    clientY,
    bubbles: true,
    cancelable: true,
    ...otherOptions
  })
}

/**
 * Creates a keyboard event for testing shortcuts
 */
export function createKeyboardEvent(key, modifiers = {}) {
  return new KeyboardEvent('keydown', {
    key,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    bubbles: true,
    cancelable: true,
    ...modifiers
  })
}
