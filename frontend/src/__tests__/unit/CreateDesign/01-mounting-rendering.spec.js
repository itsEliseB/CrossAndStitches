import { describe, it, expect } from 'vitest'
import { setupTestHooks } from './setup'
import { TRANSPARENT, allDMCColors } from '@/utils/dmcColors'

describe('CreateDesign - Component Mounting & Rendering', () => {
  const { getWrapper } = setupTestHooks()

  it('mounts successfully', () => {
    const wrapper = getWrapper()
    expect(wrapper.exists()).toBe(true)
  })

  it('renders the page title', () => {
    const wrapper = getWrapper()
    expect(wrapper.find('h1').text()).toBe('Create New Design')
  })

  it('renders the canvas element', () => {
    const wrapper = getWrapper()
    const canvas = wrapper.find('canvas')
    expect(canvas.exists()).toBe(true)
  })

  it('renders settings panel', () => {
    const wrapper = getWrapper()
    const settingsPanel = wrapper.find('.settings-panel')
    expect(settingsPanel.exists()).toBe(true)
  })

  it('renders grid controls', () => {
    const wrapper = getWrapper()
    const gridControls = wrapper.find('.grid-controls')
    expect(gridControls.exists()).toBe(true)
  })

  it('renders color palette', () => {
    const wrapper = getWrapper()
    const palette = wrapper.find('.palette')
    expect(palette.exists()).toBe(true)
  })

  it('renders save panel', () => {
    const wrapper = getWrapper()
    const savePanel = wrapper.find('.save-panel')
    expect(savePanel.exists()).toBe(true)
  })

  it('renders all tool buttons', () => {
    const wrapper = getWrapper()
    const tools = wrapper.findAll('.setting-group .btn')
    const toolTexts = tools.map(btn => btn.text())
    expect(toolTexts.some(text => text.includes('Draw'))).toBe(true)
    expect(toolTexts.some(text => text.includes('Erase'))).toBe(true)
    expect(toolTexts.some(text => text.includes('Fill'))).toBe(true)
    expect(toolTexts.some(text => text.includes('Eyedropper'))).toBe(true)
  })

  it('renders undo/redo buttons', () => {
    const wrapper = getWrapper()
    const buttons = wrapper.findAll('button')
    const buttonTexts = buttons.map(btn => btn.text())
    expect(buttonTexts.some(text => text.includes('Undo'))).toBe(true)
    expect(buttonTexts.some(text => text.includes('Redo'))).toBe(true)
  })

  it('renders all DMC colors in palette', () => {
    const wrapper = getWrapper()
    const paletteColors = wrapper.findAll('.palette-color')
    // 434 DMC colors + 1 TRANSPARENT (allDMCColors has 434 colors)
    expect(paletteColors.length).toBe(allDMCColors.length + 1)
  })
})
