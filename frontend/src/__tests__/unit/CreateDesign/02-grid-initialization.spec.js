import { describe, it, expect, vi } from 'vitest'
import { setupTestHooks } from './setup'
import { TRANSPARENT } from '@/utils/dmcColors'

describe('CreateDesign - Grid Initialization', () => {
  const { getWrapper } = setupTestHooks()

  it('initializes with default grid size 30x30', () => {
    const wrapper = getWrapper()
    const gridInfo = wrapper.find('.grid-info')
    expect(gridInfo.text()).toBe('30×30')
  })

  it('initializes grid with all transparent cells', () => {
    const wrapper = getWrapper()
    const vm = wrapper.vm
    expect(vm.grid.length).toBe(30)
    expect(vm.grid[0].length).toBe(30)

    // Check all cells are transparent
    for (let y = 0; y < 30; y++) {
      for (let x = 0; x < 30; x++) {
        expect(vm.grid[y][x]).toBe(TRANSPARENT)
      }
    }
  })

  it('initializes canvas context', () => {
    const wrapper = getWrapper()
    const canvas = wrapper.find('canvas').element
    expect(canvas.getContext).toHaveBeenCalledWith('2d')
  })

  it('sets default color to DMC 321 Red', () => {
    const wrapper = getWrapper()
    const vm = wrapper.vm
    expect(vm.currentColor).toBe('#C72B3B')
  })

  it('sets default tool to draw', () => {
    const wrapper = getWrapper()
    const vm = wrapper.vm
    expect(vm.tool).toBe('draw')
  })

  it('initializes history with initial state', () => {
    const wrapper = getWrapper()
    const vm = wrapper.vm
    expect(vm.history.length).toBeGreaterThanOrEqual(1) // Initial state is captured
    expect(vm.historyIndex).toBeGreaterThanOrEqual(0)
  })

  it('initializes with empty title', () => {
    const wrapper = getWrapper()
    const vm = wrapper.vm
    expect(vm.title).toBe('')
  })

  it('initializes with empty description', () => {
    const wrapper = getWrapper()
    const vm = wrapper.vm
    expect(vm.description).toBe('')
  })

  it('initializes saving state to false', () => {
    const wrapper = getWrapper()
    const vm = wrapper.vm
    expect(vm.saving).toBe(false)
  })

  it('initializes with no save error', () => {
    const wrapper = getWrapper()
    const vm = wrapper.vm
    expect(vm.saveError).toBe(null)
  })

  it('initializes with isDrawing false', () => {
    const wrapper = getWrapper()
    const vm = wrapper.vm
    expect(vm.isDrawing).toBe(false)
  })

  it('sets canvas dimensions based on grid size', () => {
    const wrapper = getWrapper()
    const canvas = wrapper.find('canvas').element
    const vm = wrapper.vm
    const expectedWidth = vm.gridWidth * vm.cellSize
    const expectedHeight = vm.gridHeight * vm.cellSize
    expect(canvas.width).toBe(expectedWidth)
    expect(canvas.height).toBe(expectedHeight)
  })

  it('initializes grid width and height refs', () => {
    const wrapper = getWrapper()
    const vm = wrapper.vm
    expect(vm.gridWidth).toBe(30)
    expect(vm.gridHeight).toBe(30)
  })

  it('initializes cellSize to 15', () => {
    const wrapper = getWrapper()
    const vm = wrapper.vm
    expect(vm.cellSize).toBe(15)
  })

  it('initializes brushSize to 1', () => {
    const wrapper = getWrapper()
    const vm = wrapper.vm
    expect(vm.brushSize).toBe(1)
  })
})
