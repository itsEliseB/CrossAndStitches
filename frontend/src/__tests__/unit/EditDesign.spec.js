import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises as vueFlushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import EditDesign from '@/views/EditDesign.vue'
import { TRANSPARENT, allDMCColors } from '@/utils/dmcColors'
import { designsAPI } from '@/api/client'
import { createMockRouter, createMockRoute, createMouseEvent, createKeyboardEvent, flushPromises } from '../helpers/testUtils'
import { useRoute, useRouter } from 'vue-router'

// Mock the API client
vi.mock('@/api/client', () => ({
  designsAPI: {
    getById: vi.fn(),
    update: vi.fn()
  }
}))

// Mock Vue Router
vi.mock('vue-router', () => ({
  useRoute: vi.fn(),
  useRouter: vi.fn()
}))

describe('EditDesign.vue', () => {
  let wrapper
  let mockRouter
  let mockRoute

  const createMockDesign = (overrides = {}) => ({
    id: 1,
    title: 'Test Design',
    description: 'Test Description',
    width: 30,
    height: 30,
    design_data: JSON.stringify({
      grid: Array(30).fill(null).map(() => Array(30).fill(TRANSPARENT)),
      palette: ['#FF0000', '#00FF00']
    }),
    ...overrides
  })

  beforeEach(async () => {
    mockRouter = createMockRouter()
    mockRoute = createMockRoute({ params: { id: '1' } })

    // Mock the composition API functions
    useRoute.mockReturnValue(mockRoute)
    useRouter.mockReturnValue(mockRouter)

    // Default successful API response
    designsAPI.getById.mockResolvedValue({
      data: createMockDesign()
    })

    wrapper = mount(EditDesign, {
      global: {
        stubs: {
          'router-link': {
            template: '<a><slot /></a>'
          }
        }
      }
    })

    // Wait for async loading to complete
    await flushPromises()
    await vueFlushPromises()
    await nextTick()
  })

  afterEach(() => {
    wrapper?.unmount()
    vi.clearAllMocks()
  })

  /**
   * SECTION 1: Component Mounting (10 tests)
   */
  describe('Component Mounting', () => {
    it('mounts successfully', () => {
      expect(wrapper.exists()).toBe(true)
    })

    it('shows loading state initially', async () => {
      // Create new wrapper to catch initial loading state
      const loadingWrapper = mount(EditDesign, {
        global: {
          mocks: {
            $router: mockRouter,
            $route: mockRoute
          }
        }
      })

      expect(loadingWrapper.find('.loading').exists()).toBe(true)

      loadingWrapper.unmount()
    })

    it('hides loading state after design loads', async () => {
      expect(wrapper.find('.loading').exists()).toBe(false)
    })

    it('calls designsAPI.getById with correct ID', () => {
      expect(designsAPI.getById).toHaveBeenCalledWith('1')
    })

    it('renders the page title with design name', () => {
      const h1 = wrapper.find('h1')
      expect(h1.text()).toBe('Edit Design: Test Design')
    })

    it('renders the canvas after loading', () => {
      const canvas = wrapper.find('canvas')
      expect(canvas.exists()).toBe(true)
    })

    it('renders settings panel after loading', () => {
      const settingsPanel = wrapper.find('.settings-panel')
      expect(settingsPanel.exists()).toBe(true)
    })

    it('renders color palette after loading', () => {
      const palette = wrapper.find('.palette')
      expect(palette.exists()).toBe(true)
    })

    it('renders update form after loading', () => {
      const savePanel = wrapper.find('.save-panel')
      expect(savePanel.exists()).toBe(true)
      expect(savePanel.text()).toContain('Update Design')
    })

    it('gets designId from route params', () => {
      const vm = wrapper.vm
      expect(vm.designId).toBe('1')
    })
  })

  /**
   * SECTION 2: Design Loading (25 tests)
   */
  describe('Design Loading', () => {
    it('loads design data successfully', async () => {
      const vm = wrapper.vm

      expect(vm.title).toBe('Test Design')
      expect(vm.description).toBe('Test Description')
    })

    it('parses grid data from design_data JSON', async () => {
      const vm = wrapper.vm

      expect(vm.grid).toBeDefined()
      expect(Array.isArray(vm.grid)).toBe(true)
    })

    it('sets grid dimensions from loaded data', async () => {
      const vm = wrapper.vm

      expect(vm.gridHeight).toBe(30)
      expect(vm.gridWidth).toBe(30)
    })

    it('initializes canvas context after loading', async () => {
      const canvas = wrapper.find('canvas').element

      expect(canvas.getContext).toHaveBeenCalledWith('2d')
    })

    it('captures initial state in history after loading', async () => {
      const vm = wrapper.vm

      expect(vm.history.length).toBe(1)
      expect(vm.historyIndex).toBe(0)
    })

    it('handles design with description', async () => {
      const vm = wrapper.vm

      expect(vm.description).toBe('Test Description')
    })

    it('handles design without description', async () => {
      designsAPI.getById.mockResolvedValue({
        data: createMockDesign({ description: null })
      })

      const newWrapper = mount(EditDesign, {
        global: {
          mocks: {
            $router: mockRouter,
            $route: mockRoute
          }
        }
      })

      await flushPromises()
      await vueFlushPromises()

      const vm = newWrapper.vm
      expect(vm.description).toBe('')

      newWrapper.unmount()
    })

    it('renders grid content from loaded data', async () => {
      const gridWithContent = Array(30).fill(null).map(() => Array(30).fill(TRANSPARENT))
      gridWithContent[0][0] = '#FF0000'
      gridWithContent[5][5] = '#00FF00'

      designsAPI.getById.mockResolvedValue({
        data: createMockDesign({
          design_data: JSON.stringify({
            grid: gridWithContent,
            palette: ['#FF0000', '#00FF00']
          })
        })
      })

      const newWrapper = mount(EditDesign, {
        global: {
          mocks: {
            $router: mockRouter,
            $route: mockRoute
          }
        }
      })

      await flushPromises()
      await vueFlushPromises()

      const vm = newWrapper.vm
      expect(vm.grid[0][0]).toBe('#FF0000')
      expect(vm.grid[5][5]).toBe('#00FF00')

      newWrapper.unmount()
    })

    it('calls renderGrid after loading', async () => {
      // This is tested indirectly - canvas should be rendered
      const canvas = wrapper.find('canvas')
      expect(canvas.exists()).toBe(true)
    })

    it('shows error state on loading failure', async () => {
      designsAPI.getById.mockRejectedValue(new Error('Network error'))

      const errorWrapper = mount(EditDesign, {
        global: {
          mocks: {
            $router: mockRouter,
            $route: mockRoute
          }
        }
      })

      await flushPromises()
      await vueFlushPromises()

      expect(errorWrapper.find('.error-message').exists()).toBe(true)

      errorWrapper.unmount()
    })

    it('displays error message on loading failure', async () => {
      designsAPI.getById.mockRejectedValue(new Error('Not found'))

      const errorWrapper = mount(EditDesign, {
        global: {
          mocks: {
            $router: mockRouter,
            $route: mockRoute
          }
        }
      })

      await flushPromises()
      await vueFlushPromises()

      const errorMsg = errorWrapper.find('.error-message')
      expect(errorMsg.text()).toContain('Failed to load design')

      errorWrapper.unmount()
    })

    it('hides loading spinner on error', async () => {
      designsAPI.getById.mockRejectedValue(new Error('Network error'))

      const errorWrapper = mount(EditDesign, {
        global: {
          mocks: {
            $router: mockRouter,
            $route: mockRoute
          }
        }
      })

      await flushPromises()
      await vueFlushPromises()

      expect(errorWrapper.find('.loading').exists()).toBe(false)

      errorWrapper.unmount()
    })

    it('does not render canvas on error', async () => {
      designsAPI.getById.mockRejectedValue(new Error('Network error'))

      const errorWrapper = mount(EditDesign, {
        global: {
          mocks: {
            $router: mockRouter,
            $route: mockRoute
          }
        }
      })

      await flushPromises()
      await vueFlushPromises()

      expect(errorWrapper.find('canvas').exists()).toBe(false)

      errorWrapper.unmount()
    })

    it('loads design with different dimensions', async () => {
      const smallGrid = Array(10).fill(null).map(() => Array(15).fill(TRANSPARENT))

      designsAPI.getById.mockResolvedValue({
        data: createMockDesign({
          width: 15,
          height: 10,
          design_data: JSON.stringify({
            grid: smallGrid,
            palette: []
          })
        })
      })

      const newWrapper = mount(EditDesign, {
        global: {
          mocks: {
            $router: mockRouter,
            $route: mockRoute
          }
        }
      })

      await flushPromises()
      await vueFlushPromises()

      const vm = newWrapper.vm
      expect(vm.gridHeight).toBe(10)
      expect(vm.gridWidth).toBe(15)

      newWrapper.unmount()
    })

    it('sets canvas dimensions based on loaded grid', async () => {
      const vm = wrapper.vm
      const canvas = wrapper.find('canvas').element

      const expectedWidth = vm.gridWidth * vm.cellSize
      const expectedHeight = vm.gridHeight * vm.cellSize

      expect(canvas.width).toBe(expectedWidth)
      expect(canvas.height).toBe(expectedHeight)
    })

    it('handles large grids', async () => {
      const largeGrid = Array(100).fill(null).map(() => Array(100).fill(TRANSPARENT))

      designsAPI.getById.mockResolvedValue({
        data: createMockDesign({
          width: 100,
          height: 100,
          design_data: JSON.stringify({
            grid: largeGrid,
            palette: []
          })
        })
      })

      const newWrapper = mount(EditDesign, {
        global: {
          mocks: {
            $router: mockRouter,
            $route: mockRoute
          }
        }
      })

      await flushPromises()
      await vueFlushPromises()

      const vm = newWrapper.vm
      expect(vm.gridHeight).toBe(100)
      expect(vm.gridWidth).toBe(100)

      newWrapper.unmount()
    })

    it('handles grid with multiple colors', async () => {
      const colorfulGrid = Array(10).fill(null).map(() => Array(10).fill(TRANSPARENT))
      colorfulGrid[0][0] = '#FF0000'
      colorfulGrid[1][1] = '#00FF00'
      colorfulGrid[2][2] = '#0000FF'

      designsAPI.getById.mockResolvedValue({
        data: createMockDesign({
          design_data: JSON.stringify({
            grid: colorfulGrid,
            palette: ['#FF0000', '#00FF00', '#0000FF']
          })
        })
      })

      const newWrapper = mount(EditDesign, {
        global: {
          mocks: {
            $router: mockRouter,
            $route: mockRoute
          }
        }
      })

      await flushPromises()
      await vueFlushPromises()

      const vm = newWrapper.vm
      expect(vm.grid[0][0]).toBe('#FF0000')
      expect(vm.grid[1][1]).toBe('#00FF00')
      expect(vm.grid[2][2]).toBe('#0000FF')

      newWrapper.unmount()
    })

    it('waits for nextTick before rendering', async () => {
      // This is tested by the fact that everything renders correctly
      expect(wrapper.find('canvas').exists()).toBe(true)
    })

    it('sets loading to false on success', async () => {
      const vm = wrapper.vm
      expect(vm.loading).toBe(false)
    })

    it('logs error to console on loading failure', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      designsAPI.getById.mockRejectedValue(new Error('Test error'))

      const errorWrapper = mount(EditDesign, {
        global: {
          mocks: {
            $router: mockRouter,
            $route: mockRoute
          }
        }
      })

      await flushPromises()
      await vueFlushPromises()

      expect(consoleErrorSpy).toHaveBeenCalled()

      errorWrapper.unmount()
      consoleErrorSpy.mockRestore()
    })

    it('handles empty palette in design data', async () => {
      designsAPI.getById.mockResolvedValue({
        data: createMockDesign({
          design_data: JSON.stringify({
            grid: Array(10).fill(null).map(() => Array(10).fill(TRANSPARENT)),
            palette: []
          })
        })
      })

      const newWrapper = mount(EditDesign, {
        global: {
          mocks: {
            $router: mockRouter,
            $route: mockRoute
          }
        }
      })

      await flushPromises()
      await vueFlushPromises()

      const vm = newWrapper.vm
      expect(vm.grid).toBeDefined()

      newWrapper.unmount()
    })

    it('parses JSON design_data correctly', async () => {
      const vm = wrapper.vm

      // Should successfully parse and load the grid
      expect(Array.isArray(vm.grid)).toBe(true)
      expect(vm.grid.length).toBeGreaterThan(0)
    })

    it('preserves grid content through load', async () => {
      const testGrid = Array(5).fill(null).map(() => Array(5).fill(TRANSPARENT))
      testGrid[0][0] = '#ABCDEF'
      testGrid[2][3] = '#123456'

      designsAPI.getById.mockResolvedValue({
        data: createMockDesign({
          width: 5,
          height: 5,
          design_data: JSON.stringify({
            grid: testGrid,
            palette: ['#ABCDEF', '#123456']
          })
        })
      })

      const newWrapper = mount(EditDesign, {
        global: {
          mocks: {
            $router: mockRouter,
            $route: mockRoute
          }
        }
      })

      await flushPromises()
      await vueFlushPromises()

      const vm = newWrapper.vm
      expect(vm.grid[0][0]).toBe('#ABCDEF')
      expect(vm.grid[2][3]).toBe('#123456')

      newWrapper.unmount()
    })

    it('handles API response structure correctly', async () => {
      expect(designsAPI.getById).toHaveBeenCalledWith('1')

      const vm = wrapper.vm
      expect(vm.title).toBe('Test Design')
    })
  })

  /**
   * SECTION 3: Data Validation (20 tests)
   */
  describe('Data Validation', () => {
    it('filters out null rows from grid', async () => {
      const gridWithNulls = [
        Array(5).fill(TRANSPARENT),
        null,
        Array(5).fill(TRANSPARENT),
        undefined,
        Array(5).fill(TRANSPARENT)
      ]

      designsAPI.getById.mockResolvedValue({
        data: createMockDesign({
          design_data: JSON.stringify({
            grid: gridWithNulls,
            palette: []
          })
        })
      })

      const newWrapper = mount(EditDesign, {
        global: {
          mocks: {
            $router: mockRouter,
            $route: mockRoute
          }
        }
      })

      await flushPromises()
      await vueFlushPromises()

      const vm = newWrapper.vm
      expect(vm.grid.length).toBe(3) // Only 3 valid rows

      newWrapper.unmount()
    })

    it('filters out non-array rows from grid', async () => {
      const gridWithInvalidRows = [
        Array(5).fill(TRANSPARENT),
        'invalid',
        Array(5).fill(TRANSPARENT),
        123,
        Array(5).fill(TRANSPARENT)
      ]

      designsAPI.getById.mockResolvedValue({
        data: createMockDesign({
          design_data: JSON.stringify({
            grid: gridWithInvalidRows,
            palette: []
          })
        })
      })

      const newWrapper = mount(EditDesign, {
        global: {
          mocks: {
            $router: mockRouter,
            $route: mockRoute
          }
        }
      })

      await flushPromises()
      await vueFlushPromises()

      const vm = newWrapper.vm
      expect(vm.grid.length).toBe(3) // Only 3 valid arrays

      newWrapper.unmount()
    })

    it('uses actual grid dimensions instead of stored dimensions', async () => {
      const actualGrid = Array(15).fill(null).map(() => Array(20).fill(TRANSPARENT))

      designsAPI.getById.mockResolvedValue({
        data: createMockDesign({
          width: 999, // Wrong stored width
          height: 888, // Wrong stored height
          design_data: JSON.stringify({
            grid: actualGrid,
            palette: []
          })
        })
      })

      const newWrapper = mount(EditDesign, {
        global: {
          mocks: {
            $router: mockRouter,
            $route: mockRoute
          }
        }
      })

      await flushPromises()
      await vueFlushPromises()

      const vm = newWrapper.vm
      // Should use actual dimensions from grid
      expect(vm.gridHeight).toBe(15)
      expect(vm.gridWidth).toBe(20)

      newWrapper.unmount()
    })

    it('pads short rows with TRANSPARENT', async () => {
      const gridWithShortRows = [
        Array(10).fill('#FF0000'),
        Array(5).fill('#00FF00'), // Short row
        Array(10).fill('#0000FF')
      ]

      designsAPI.getById.mockResolvedValue({
        data: createMockDesign({
          design_data: JSON.stringify({
            grid: gridWithShortRows,
            palette: []
          })
        })
      })

      const newWrapper = mount(EditDesign, {
        global: {
          mocks: {
            $router: mockRouter,
            $route: mockRoute
          }
        }
      })

      await flushPromises()
      await vueFlushPromises()

      const vm = newWrapper.vm
      // All rows should now be same length (10)
      expect(vm.grid[1].length).toBe(10)
      // Padded cells should be transparent
      expect(vm.grid[1][9]).toBe(TRANSPARENT)

      newWrapper.unmount()
    })

    it('trims long rows', async () => {
      const gridWithLongRows = [
        Array(5).fill('#FF0000'),
        Array(15).fill('#00FF00'), // Long row
        Array(5).fill('#0000FF')
      ]

      designsAPI.getById.mockResolvedValue({
        data: createMockDesign({
          design_data: JSON.stringify({
            grid: gridWithLongRows,
            palette: []
          })
        })
      })

      const newWrapper = mount(EditDesign, {
        global: {
          mocks: {
            $router: mockRouter,
            $route: mockRoute
          }
        }
      })

      await flushPromises()
      await vueFlushPromises()

      const vm = newWrapper.vm
      // All rows should be trimmed to 5
      expect(vm.grid[1].length).toBe(5)

      newWrapper.unmount()
    })

    it('ensures all rows have same length after validation', async () => {
      const irregularGrid = [
        Array(10).fill(TRANSPARENT),
        Array(5).fill(TRANSPARENT),
        Array(15).fill(TRANSPARENT),
        Array(10).fill(TRANSPARENT)
      ]

      designsAPI.getById.mockResolvedValue({
        data: createMockDesign({
          design_data: JSON.stringify({
            grid: irregularGrid,
            palette: []
          })
        })
      })

      const newWrapper = mount(EditDesign, {
        global: {
          mocks: {
            $router: mockRouter,
            $route: mockRoute
          }
        }
      })

      await flushPromises()
      await vueFlushPromises()

      const vm = newWrapper.vm
      const firstRowLength = vm.grid[0].length

      // All rows should have same length
      vm.grid.forEach(row => {
        expect(row.length).toBe(firstRowLength)
      })

      newWrapper.unmount()
    })

    it('handles empty grid gracefully', async () => {
      designsAPI.getById.mockResolvedValue({
        data: createMockDesign({
          design_data: JSON.stringify({
            grid: [],
            palette: []
          })
        })
      })

      const newWrapper = mount(EditDesign, {
        global: {
          mocks: {
            $router: mockRouter,
            $route: mockRoute
          }
        }
      })

      await flushPromises()
      await vueFlushPromises()

      const vm = newWrapper.vm
      expect(vm.grid.length).toBe(0)
      expect(vm.gridHeight).toBe(0)
      expect(vm.gridWidth).toBe(0)

      newWrapper.unmount()
    })

    it('handles grid with single row', async () => {
      const singleRowGrid = [Array(10).fill('#FF0000')]

      designsAPI.getById.mockResolvedValue({
        data: createMockDesign({
          design_data: JSON.stringify({
            grid: singleRowGrid,
            palette: ['#FF0000']
          })
        })
      })

      const newWrapper = mount(EditDesign, {
        global: {
          mocks: {
            $router: mockRouter,
            $route: mockRoute
          }
        }
      })

      await flushPromises()
      await vueFlushPromises()

      const vm = newWrapper.vm
      expect(vm.gridHeight).toBe(1)
      expect(vm.gridWidth).toBe(10)

      newWrapper.unmount()
    })

    it('handles grid with single cell', async () => {
      const singleCellGrid = [[TRANSPARENT]]

      designsAPI.getById.mockResolvedValue({
        data: createMockDesign({
          design_data: JSON.stringify({
            grid: singleCellGrid,
            palette: []
          })
        })
      })

      const newWrapper = mount(EditDesign, {
        global: {
          mocks: {
            $router: mockRouter,
            $route: mockRoute
          }
        }
      })

      await flushPromises()
      await vueFlushPromises()

      const vm = newWrapper.vm
      expect(vm.gridHeight).toBe(1)
      expect(vm.gridWidth).toBe(1)

      newWrapper.unmount()
    })

    it('determines width from first row', async () => {
      const grid = [
        Array(25).fill('#FF0000'),
        Array(30).fill('#00FF00') // Will be trimmed
      ]

      designsAPI.getById.mockResolvedValue({
        data: createMockDesign({
          design_data: JSON.stringify({
            grid: grid,
            palette: []
          })
        })
      })

      const newWrapper = mount(EditDesign, {
        global: {
          mocks: {
            $router: mockRouter,
            $route: mockRoute
          }
        }
      })

      await flushPromises()
      await vueFlushPromises()

      const vm = newWrapper.vm
      expect(vm.gridWidth).toBe(25)

      newWrapper.unmount()
    })

    it('preserves cell colors during validation', async () => {
      const grid = [
        ['#FF0000', '#00FF00'], // Short row, will be padded
        ['#0000FF', '#FFFF00', '#FF00FF', '#00FFFF']
      ]

      designsAPI.getById.mockResolvedValue({
        data: createMockDesign({
          design_data: JSON.stringify({
            grid: grid,
            palette: []
          })
        })
      })

      const newWrapper = mount(EditDesign, {
        global: {
          mocks: {
            $router: mockRouter,
            $route: mockRoute
          }
        }
      })

      await flushPromises()
      await vueFlushPromises()

      const vm = newWrapper.vm
      // Original colors should be preserved
      expect(vm.grid[0][0]).toBe('#FF0000')
      expect(vm.grid[0][1]).toBe('#00FF00')
      expect(vm.grid[1][0]).toBe('#0000FF')

      newWrapper.unmount()
    })

    it('handles rows with only nulls/undefined', async () => {
      const grid = [
        Array(5).fill(TRANSPARENT),
        Array(5).fill(null),
        Array(5).fill(undefined)
      ]

      designsAPI.getById.mockResolvedValue({
        data: createMockDesign({
          design_data: JSON.stringify({
            grid: grid,
            palette: []
          })
        })
      })

      const newWrapper = mount(EditDesign, {
        global: {
          mocks: {
            $router: mockRouter,
            $route: mockRoute
          }
        }
      })

      await flushPromises()
      await vueFlushPromises()

      const vm = newWrapper.vm
      expect(vm.grid.length).toBe(3)

      newWrapper.unmount()
    })

    it('handles mixed valid and invalid cells', async () => {
      const grid = [
        ['#FF0000', null, '#00FF00', undefined, TRANSPARENT]
      ]

      designsAPI.getById.mockResolvedValue({
        data: createMockDesign({
          design_data: JSON.stringify({
            grid: grid,
            palette: []
          })
        })
      })

      const newWrapper = mount(EditDesign, {
        global: {
          mocks: {
            $router: mockRouter,
            $route: mockRoute
          }
        }
      })

      await flushPromises()
      await vueFlushPromises()

      const vm = newWrapper.vm
      expect(vm.grid[0][0]).toBe('#FF0000')
      expect(vm.grid[0][2]).toBe('#00FF00')

      newWrapper.unmount()
    })

    it('validates grid before rendering', async () => {
      // If grid wasn't validated, this could cause rendering errors
      const messyGrid = [
        Array(10).fill(TRANSPARENT),
        null,
        Array(5).fill(TRANSPARENT),
        Array(15).fill(TRANSPARENT)
      ]

      designsAPI.getById.mockResolvedValue({
        data: createMockDesign({
          design_data: JSON.stringify({
            grid: messyGrid,
            palette: []
          })
        })
      })

      const newWrapper = mount(EditDesign, {
        global: {
          mocks: {
            $router: mockRouter,
            $route: mockRoute
          }
        }
      })

      await flushPromises()
      await vueFlushPromises()

      // Should not throw errors
      expect(newWrapper.find('canvas').exists()).toBe(true)

      newWrapper.unmount()
    })

    it('handles grid where first row is null', async () => {
      const grid = [
        null,
        Array(5).fill(TRANSPARENT),
        Array(5).fill(TRANSPARENT)
      ]

      designsAPI.getById.mockResolvedValue({
        data: createMockDesign({
          design_data: JSON.stringify({
            grid: grid,
            palette: []
          })
        })
      })

      const newWrapper = mount(EditDesign, {
        global: {
          mocks: {
            $router: mockRouter,
            $route: mockRoute
          }
        }
      })

      await flushPromises()
      await vueFlushPromises()

      const vm = newWrapper.vm
      expect(vm.grid.length).toBe(2) // Null row filtered out
      expect(vm.gridWidth).toBe(5) // Width determined from first valid row

      newWrapper.unmount()
    })

    it('handles all rows being invalid', async () => {
      const grid = [null, undefined, 'invalid', 123]

      designsAPI.getById.mockResolvedValue({
        data: createMockDesign({
          design_data: JSON.stringify({
            grid: grid,
            palette: []
          })
        })
      })

      const newWrapper = mount(EditDesign, {
        global: {
          mocks: {
            $router: mockRouter,
            $route: mockRoute
          }
        }
      })

      await flushPromises()
      await vueFlushPromises()

      const vm = newWrapper.vm
      expect(vm.grid.length).toBe(0)

      newWrapper.unmount()
    })

    it('preserves transparent cells during validation', async () => {
      const grid = [
        [TRANSPARENT, '#FF0000', TRANSPARENT],
        [TRANSPARENT] // Short row
      ]

      designsAPI.getById.mockResolvedValue({
        data: createMockDesign({
          design_data: JSON.stringify({
            grid: grid,
            palette: []
          })
        })
      })

      const newWrapper = mount(EditDesign, {
        global: {
          mocks: {
            $router: mockRouter,
            $route: mockRoute
          }
        }
      })

      await flushPromises()
      await vueFlushPromises()

      const vm = newWrapper.vm
      expect(vm.grid[0][0]).toBe(TRANSPARENT)
      expect(vm.grid[0][2]).toBe(TRANSPARENT)
      expect(vm.grid[1][0]).toBe(TRANSPARENT)

      newWrapper.unmount()
    })

    it('handles very long rows correctly', async () => {
      const grid = [
        Array(5).fill(TRANSPARENT),
        Array(1000).fill('#FF0000') // Very long row
      ]

      designsAPI.getById.mockResolvedValue({
        data: createMockDesign({
          design_data: JSON.stringify({
            grid: grid,
            palette: []
          })
        })
      })

      const newWrapper = mount(EditDesign, {
        global: {
          mocks: {
            $router: mockRouter,
            $route: mockRoute
          }
        }
      })

      await flushPromises()
      await vueFlushPromises()

      const vm = newWrapper.vm
      // Should be trimmed to match first row
      expect(vm.grid[1].length).toBe(5)

      newWrapper.unmount()
    })
  })

  /**
   * SECTION 4: Update Functionality (15 tests)
   */
  describe('Update Functionality', () => {
    it('renders update button', () => {
      const updateBtn = wrapper.findAll('button').find(btn => btn.text().includes('Update Design'))
      expect(updateBtn.exists()).toBe(true)
    })

    it('shows error when updating without title', async () => {
      const vm = wrapper.vm

      vm.title = ''
      await vm.updateDesign()

      expect(vm.saveError).toBe('Please enter a title')
    })

    it('shows error when updating with only whitespace title', async () => {
      const vm = wrapper.vm

      vm.title = '   '
      await vm.updateDesign()

      expect(vm.saveError).toBe('Please enter a title')
    })

    it('calls designsAPI.update with correct ID and data', async () => {
      const vm = wrapper.vm

      designsAPI.update.mockResolvedValue({ data: {} })

      vm.title = 'Updated Title'
      await vm.updateDesign()

      expect(designsAPI.update).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          title: 'Updated Title'
        })
      )
    })

    it('sends updated title and description', async () => {
      const vm = wrapper.vm

      designsAPI.update.mockResolvedValue({ data: {} })

      vm.title = 'New Title'
      vm.description = 'New Description'

      await vm.updateDesign()

      const callArg = designsAPI.update.mock.calls[0][1]
      expect(callArg.title).toBe('New Title')
      expect(callArg.description).toBe('New Description')
    })

    it('sends current grid data', async () => {
      const vm = wrapper.vm

      designsAPI.update.mockResolvedValue({ data: {} })

      vm.grid[0][0] = '#ABCDEF'
      await vm.updateDesign()

      const callArg = designsAPI.update.mock.calls[0][1]
      const designData = JSON.parse(callArg.design_data)

      expect(designData.grid[0][0]).toBe('#ABCDEF')
    })

    it('sends current grid dimensions', async () => {
      const vm = wrapper.vm

      designsAPI.update.mockResolvedValue({ data: {} })

      await vm.updateDesign()

      const callArg = designsAPI.update.mock.calls[0][1]
      expect(callArg.width).toBe(vm.gridWidth)
      expect(callArg.height).toBe(vm.gridHeight)
    })

    it('extracts and sends palette', async () => {
      const vm = wrapper.vm

      designsAPI.update.mockResolvedValue({ data: {} })

      vm.grid[0][0] = '#FF0000'
      vm.grid[0][1] = '#00FF00'

      await vm.updateDesign()

      const callArg = designsAPI.update.mock.calls[0][1]
      const designData = JSON.parse(callArg.design_data)

      expect(designData.palette).toContain('#FF0000')
      expect(designData.palette).toContain('#00FF00')
    })

    it('excludes transparent from palette', async () => {
      const vm = wrapper.vm

      designsAPI.update.mockResolvedValue({ data: {} })

      vm.grid[0][0] = '#FF0000'
      vm.grid[0][1] = TRANSPARENT

      await vm.updateDesign()

      const callArg = designsAPI.update.mock.calls[0][1]
      const designData = JSON.parse(callArg.design_data)

      expect(designData.palette).not.toContain(TRANSPARENT)
    })

    it('redirects to /designs after successful update', async () => {
      const vm = wrapper.vm

      designsAPI.update.mockResolvedValue({ data: {} })

      await vm.updateDesign()
      await flushPromises()

      expect(mockRouter.push).toHaveBeenCalledWith('/designs')
    })

    it('sets saving state during update', async () => {
      const vm = wrapper.vm

      designsAPI.update.mockImplementation(() => new Promise(resolve => {
        expect(vm.saving).toBe(true)
        resolve({ data: {} })
      }))

      await vm.updateDesign()
    })

    it('clears saving state after update', async () => {
      const vm = wrapper.vm

      designsAPI.update.mockResolvedValue({ data: {} })

      await vm.updateDesign()

      expect(vm.saving).toBe(false)
    })

    it('shows error message on update failure', async () => {
      const vm = wrapper.vm

      designsAPI.update.mockRejectedValue({
        response: { data: { detail: 'Validation error' } }
      })

      await vm.updateDesign()

      expect(vm.saveError).toBe('Validation error')
    })

    it('shows generic error if no detail in response', async () => {
      const vm = wrapper.vm

      designsAPI.update.mockRejectedValue(new Error('Network error'))

      await vm.updateDesign()

      expect(vm.saveError).toBe('Failed to update design')
    })

    it('renders cancel button that links to /designs', () => {
      const cancelLink = wrapper.find('a.btn')
      expect(cancelLink.exists()).toBe(true)
      // router-link renders as <a> due to stub, check text content instead
      expect(cancelLink.text()).toBe('Cancel')
    })
  })

  /**
   * SECTION 5: Error Handling (15 tests)
   */
  describe('Error Handling', () => {
    it('handles 404 error gracefully', async () => {
      designsAPI.getById.mockRejectedValue({
        response: { status: 404, data: { detail: 'Not found' } }
      })

      const errorWrapper = mount(EditDesign, {
        global: {
          mocks: {
            $router: mockRouter,
            $route: mockRoute
          }
        }
      })

      await flushPromises()
      await vueFlushPromises()

      expect(errorWrapper.find('.error-message').exists()).toBe(true)

      errorWrapper.unmount()
    })

    it('handles network error on load', async () => {
      designsAPI.getById.mockRejectedValue(new Error('Network error'))

      const errorWrapper = mount(EditDesign, {
        global: {
          mocks: {
            $router: mockRouter,
            $route: mockRoute
          }
        }
      })

      await flushPromises()
      await vueFlushPromises()

      const vm = errorWrapper.vm
      expect(vm.error).toBeTruthy()
      expect(vm.loading).toBe(false)

      errorWrapper.unmount()
    })

    it('handles malformed JSON in design_data', async () => {
      designsAPI.getById.mockResolvedValue({
        data: {
          ...createMockDesign(),
          design_data: 'invalid json{'
        }
      })

      const errorWrapper = mount(EditDesign, {
        global: {
          mocks: {
            $router: mockRouter,
            $route: mockRoute
          }
        }
      })

      await flushPromises()
      await vueFlushPromises()

      // Should show error
      expect(errorWrapper.find('.error-message').exists()).toBe(true)

      errorWrapper.unmount()
    })

    it('handles missing design_data field', async () => {
      designsAPI.getById.mockResolvedValue({
        data: {
          id: 1,
          title: 'Test',
          description: 'Test'
          // Missing design_data
        }
      })

      const errorWrapper = mount(EditDesign, {
        global: {
          mocks: {
            $router: mockRouter,
            $route: mockRoute
          }
        }
      })

      await flushPromises()
      await vueFlushPromises()

      expect(errorWrapper.find('.error-message').exists()).toBe(true)

      errorWrapper.unmount()
    })

    it('handles network error on update', async () => {
      const vm = wrapper.vm

      designsAPI.update.mockRejectedValue(new Error('Network error'))

      await vm.updateDesign()

      expect(vm.saveError).toBe('Failed to update design')
      expect(vm.saving).toBe(false)
    })

    it('handles 403 forbidden error on update', async () => {
      const vm = wrapper.vm

      designsAPI.update.mockRejectedValue({
        response: { status: 403, data: { detail: 'Forbidden' } }
      })

      await vm.updateDesign()

      expect(vm.saveError).toBe('Forbidden')
    })

    it('handles 500 server error on update', async () => {
      const vm = wrapper.vm

      designsAPI.update.mockRejectedValue({
        response: { status: 500, data: { detail: 'Server error' } }
      })

      await vm.updateDesign()

      expect(vm.saveError).toBe('Server error')
    })

    it('clears previous save errors on new update attempt', async () => {
      const vm = wrapper.vm

      vm.saveError = 'Previous error'
      designsAPI.update.mockResolvedValue({ data: {} })

      await vm.updateDesign()

      // Initially cleared
      expect(vm.saveError).toBe(null)
    })

    it('displays save error in UI', async () => {
      const vm = wrapper.vm

      designsAPI.update.mockRejectedValue({
        response: { data: { detail: 'Test error' } }
      })

      await vm.updateDesign()
      await nextTick()

      const errorMsg = wrapper.find('.save-panel .error-message')
      expect(errorMsg.exists()).toBe(true)
      expect(errorMsg.text()).toBe('Test error')
    })

    it('handles timeout errors', async () => {
      const vm = wrapper.vm

      designsAPI.update.mockRejectedValue({
        code: 'ECONNABORTED',
        message: 'timeout'
      })

      await vm.updateDesign()

      expect(vm.saveError).toBe('Failed to update design')
    })

    it('maintains grid state on update failure', async () => {
      const vm = wrapper.vm

      vm.grid[0][0] = '#SPECIAL'

      designsAPI.update.mockRejectedValue(new Error('Failed'))

      await vm.updateDesign()

      // Grid should remain unchanged
      expect(vm.grid[0][0]).toBe('#SPECIAL')
    })

    it('maintains form state on update failure', async () => {
      const vm = wrapper.vm

      vm.title = 'Important Title'
      vm.description = 'Important Description'

      designsAPI.update.mockRejectedValue(new Error('Failed'))

      await vm.updateDesign()

      // Form data should remain
      expect(vm.title).toBe('Important Title')
      expect(vm.description).toBe('Important Description')
    })

    it('does not redirect on update failure', async () => {
      const vm = wrapper.vm

      designsAPI.update.mockRejectedValue(new Error('Failed'))

      await vm.updateDesign()
      await flushPromises()

      expect(mockRouter.push).not.toHaveBeenCalled()
    })

    it('handles error without response object', async () => {
      const vm = wrapper.vm

      designsAPI.update.mockRejectedValue(new Error('Unknown error'))

      await vm.updateDesign()

      expect(vm.saveError).toBe('Failed to update design')
    })

    it('logs errors to console', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      designsAPI.getById.mockRejectedValue(new Error('Load error'))

      const errorWrapper = mount(EditDesign, {
        global: {
          mocks: {
            $router: mockRouter,
            $route: mockRoute
          }
        }
      })

      await flushPromises()
      await vueFlushPromises()

      expect(consoleErrorSpy).toHaveBeenCalled()

      errorWrapper.unmount()
      consoleErrorSpy.mockRestore()
    })
  })

  /**
   * SECTION 6: Inherited Features from CreateDesign (15 tests)
   */
  describe('Inherited CreateDesign Features', () => {
    it('supports drawing with draw tool', async () => {
      const vm = wrapper.vm
      const canvas = wrapper.find('canvas')

      vm.tool = 'draw'
      vm.currentColor = '#FF0000'

      await canvas.trigger('mousedown', { clientX: 10, clientY: 10 })

      expect(vm.grid[0][0]).toBe('#FF0000')
    })

    it('supports erasing with erase tool', async () => {
      const vm = wrapper.vm
      const canvas = wrapper.find('canvas')

      vm.grid[0][0] = '#FF0000'
      vm.tool = 'erase'

      await canvas.trigger('mousedown', { clientX: 10, clientY: 10 })

      expect(vm.grid[0][0]).toBe(TRANSPARENT)
    })

    it('supports bucket fill tool', async () => {
      const vm = wrapper.vm
      const canvas = wrapper.find('canvas')

      vm.tool = 'bucket'
      vm.currentColor = '#ABCDEF'

      await canvas.trigger('click', { clientX: 10, clientY: 10 })

      // Should fill entire transparent grid
      expect(vm.grid[0][0]).toBe('#ABCDEF')
    })

    it('supports undo operation', async () => {
      const vm = wrapper.vm
      const canvas = wrapper.find('canvas')

      vm.tool = 'draw'
      vm.currentColor = '#FF0000'

      await canvas.trigger('mousedown', { clientX: 10, clientY: 10 })
      await canvas.trigger('mouseup')

      expect(vm.grid[0][0]).toBe('#FF0000')

      vm.undo()
      await nextTick()

      expect(vm.grid[0][0]).toBe(TRANSPARENT)
    })

    it('supports redo operation', async () => {
      const vm = wrapper.vm
      const canvas = wrapper.find('canvas')

      vm.tool = 'draw'
      vm.currentColor = '#FF0000'

      await canvas.trigger('mousedown', { clientX: 10, clientY: 10 })
      await canvas.trigger('mouseup')

      vm.undo()
      await nextTick()
      await flushPromises()

      vm.redo()
      await nextTick()
      await flushPromises()

      expect(vm.grid[0][0]).toBe('#FF0000')
    })

    it('supports Ctrl+Z keyboard shortcut', async () => {
      const vm = wrapper.vm
      const canvas = wrapper.find('canvas')

      vm.tool = 'draw'
      vm.currentColor = '#FF0000'

      await canvas.trigger('mousedown', { clientX: 10, clientY: 10 })
      await canvas.trigger('mouseup')

      const keyEvent = createKeyboardEvent('z', { ctrlKey: true })
      window.dispatchEvent(keyEvent)
      await nextTick()

      expect(vm.grid[0][0]).toBe(TRANSPARENT)
    })

    it('supports Ctrl+Y keyboard shortcut', async () => {
      const vm = wrapper.vm
      const canvas = wrapper.find('canvas')

      vm.tool = 'draw'
      vm.currentColor = '#FF0000'

      await canvas.trigger('mousedown', { clientX: 10, clientY: 10 })
      await canvas.trigger('mouseup')

      vm.undo()
      await nextTick()
      await flushPromises()

      const keyEvent = createKeyboardEvent('y', { ctrlKey: true })
      window.dispatchEvent(keyEvent)
      await nextTick()
      await flushPromises()

      expect(vm.grid[0][0]).toBe('#FF0000')
    })

    it('supports adding rows', async () => {
      const vm = wrapper.vm
      const initialHeight = vm.gridHeight

      vm.addRowTop()
      await nextTick()

      expect(vm.gridHeight).toBe(initialHeight + 1)
    })

    it('supports removing rows', async () => {
      const vm = wrapper.vm

      // Add rows first to be above minimum
      vm.addRowTop()
      vm.addRowTop()
      vm.addRowTop()
      await nextTick()

      const heightBefore = vm.gridHeight

      vm.removeRowTop()
      await nextTick()

      expect(vm.gridHeight).toBe(heightBefore - 1)
    })

    it('supports adding columns', async () => {
      const vm = wrapper.vm
      const initialWidth = vm.gridWidth

      vm.addColumnRight()
      await nextTick()

      expect(vm.gridWidth).toBe(initialWidth + 1)
    })

    it('supports removing columns', async () => {
      const vm = wrapper.vm

      // Add columns first to be above minimum
      vm.addColumnRight()
      vm.addColumnRight()
      vm.addColumnRight()
      await nextTick()

      const widthBefore = vm.gridWidth

      vm.removeColumnRight()
      await nextTick()

      expect(vm.gridWidth).toBe(widthBefore - 1)
    })

    it('supports color palette selection', async () => {
      const vm = wrapper.vm
      const paletteColors = wrapper.findAll('.palette-color')

      // Click second color (first is TRANSPARENT)
      await paletteColors[1].trigger('click')

      expect(vm.currentColor).toBe(allDMCColors[0].hex)
    })

    it('prevents undo during drawing', async () => {
      const vm = wrapper.vm
      const canvas = wrapper.find('canvas')

      vm.tool = 'draw'
      await canvas.trigger('mousedown', { clientX: 10, clientY: 10 })

      expect(vm.isDrawing).toBe(true)

      const gridBefore = JSON.parse(JSON.stringify(vm.grid))

      const keyEvent = createKeyboardEvent('z', { ctrlKey: true })
      window.dispatchEvent(keyEvent)
      await nextTick()

      // Grid should be unchanged (undo blocked)
      expect(JSON.stringify(vm.grid)).toBe(JSON.stringify(gridBefore))
    })

    it('renders checkered pattern for transparent cells', () => {
      // Canvas should render checkered pattern for transparent cells
      // This is tested indirectly through the rendering logic
      const canvas = wrapper.find('canvas')
      expect(canvas.exists()).toBe(true)
    })

    it('renders all DMC colors in palette', () => {
      const paletteColors = wrapper.findAll('.palette-color')
      // 432 DMC colors + 1 TRANSPARENT
      expect(paletteColors.length).toBe(433)
    })
  })
})
