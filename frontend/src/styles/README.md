# Design System

A comprehensive design system for Cross & Stitches application, providing consistent styling across all components.

## 📁 Structure

```
styles/
├── index.css        # Main entry point (import this in your app)
├── variables.css    # CSS custom properties (colors, spacing, etc.)
├── components.css   # Reusable component styles
├── utilities.css    # Utility classes
└── README.md        # This file
```

## 🎨 Usage

### Import in your application

```javascript
// In main.js or App.vue
import '@/styles/index.css'
```

### Using CSS Variables

```css
.my-component {
  color: var(--color-primary);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}
```

### Using Component Classes

```vue
<template>
  <button class="btn btn-primary">Click me</button>
  <div class="card">
    <h3 class="card-title">Card Title</h3>
    <p class="card-body">Card content</p>
  </div>
</template>
```

### Using Utility Classes

```vue
<template>
  <div class="flex items-center gap-md">
    <span class="text-lg font-semibold">Title</span>
    <span class="badge badge-primary">New</span>
  </div>
</template>
```

## 🎨 Color System

### Primary Colors
- `--color-primary` - Main brand color (#667eea)
- `--color-primary-hover` - Darker variant for hover states
- `--color-primary-light` - Lighter variant
- `--color-primary-dark` - Darker variant

### Semantic Colors
- `--color-success` - Success states (#10b981)
- `--color-error` - Error states (#ef4444)
- `--color-warning` - Warning states (#f59e0b)
- `--color-info` - Info states (#3b82f6)

### Neutral Colors
- `--color-gray-50` to `--color-gray-900` - Full gray scale

## 📏 Spacing Scale

```css
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 12px
--spacing-lg: 16px
--spacing-xl: 24px
--spacing-2xl: 32px
--spacing-3xl: 48px
--spacing-4xl: 64px
```

## 🔤 Typography

### Font Families
- `--font-family-base` - System font stack
- `--font-family-mono` - Monospace font stack

### Font Sizes
- `--font-size-xs` to `--font-size-4xl` (12px to 36px)

### Font Weights
- `--font-weight-normal` (400)
- `--font-weight-medium` (500)
- `--font-weight-semibold` (600)
- `--font-weight-bold` (700)

## 📦 Components

### Buttons

```vue
<!-- Basic button -->
<button class="btn">Button</button>

<!-- Primary button -->
<button class="btn btn-primary">Primary</button>

<!-- Button sizes -->
<button class="btn btn-small">Small</button>
<button class="btn btn-large">Large</button>

<!-- Icon button -->
<button class="btn btn-icon">
  <Icon />
</button>
```

### Cards

```vue
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Card Title</h3>
  </div>
  <div class="card-body">
    Content goes here
  </div>
</div>
```

### Alerts

```vue
<div class="alert alert-success">Success message</div>
<div class="alert alert-error">Error message</div>
<div class="alert alert-warning">Warning message</div>
<div class="alert alert-info">Info message</div>
```

### Forms

```vue
<div class="form-group">
  <label class="form-label">Label</label>
  <input type="text" class="input" />
  <span class="form-help">Help text</span>
</div>
```

### Badges

```vue
<span class="badge">Default</span>
<span class="badge badge-primary">Primary</span>
<span class="badge badge-success">Success</span>
```

## 🛠️ Utilities

### Layout
- `flex`, `inline-flex`, `grid`
- `flex-row`, `flex-col`
- `items-center`, `items-start`, `items-end`
- `justify-center`, `justify-between`, etc.
- `gap-xs`, `gap-sm`, `gap-md`, `gap-lg`, `gap-xl`

### Spacing
- `m-0`, `m-auto`
- `mt-sm`, `mb-md`, etc.
- `p-0`, `p-sm`, `p-md`, `p-lg`, `p-xl`

### Typography
- `text-xs` to `text-2xl`
- `font-normal`, `font-medium`, `font-semibold`, `font-bold`
- `text-left`, `text-center`, `text-right`
- `text-primary`, `text-gray-500`, etc.

### Shadows
- `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl`

### Borders
- `border`, `border-t`, `border-b`
- `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-full`

## 💡 Best Practices

1. **Use CSS variables** for colors, spacing, and other design tokens
2. **Prefer utility classes** for simple one-off styling
3. **Use component classes** for repeated patterns
4. **Maintain consistency** by sticking to the design system values
5. **Extend, don't override** - add new tokens instead of hardcoding values

## 🔄 Migration Guide

To migrate existing components to the design system:

1. Replace hardcoded colors with CSS variables:
   ```css
   /* Before */
   background: #667eea;

   /* After */
   background: var(--color-primary);
   ```

2. Use spacing variables:
   ```css
   /* Before */
   padding: 16px;

   /* After */
   padding: var(--spacing-lg);
   ```

3. Apply component classes:
   ```vue
   <!-- Before -->
   <button style="padding: 0.5rem 1rem; background: blue;">

   <!-- After -->
   <button class="btn btn-primary">
   ```

## 🎯 Examples

See the components in `/src/components/Designer/` for examples of the design system in action.
