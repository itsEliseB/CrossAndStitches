# Design System - Quick Reference

## 🎨 Common Color Patterns

```css
/* Primary actions */
background: var(--color-primary);

/* Success states */
background: var(--color-success);

/* Error states */
background: var(--color-error);

/* Neutral backgrounds */
background: var(--color-gray-100);

/* Text colors */
color: var(--color-gray-900);  /* Primary text */
color: var(--color-gray-700);  /* Secondary text */
color: var(--color-gray-500);  /* Muted text */
```

## 📏 Common Spacing Patterns

```css
/* Component padding */
padding: var(--spacing-lg);  /* 16px - most common */

/* Gap between elements */
gap: var(--spacing-md);  /* 12px */

/* Section spacing */
margin-bottom: var(--spacing-2xl);  /* 32px */
```

## 🔘 Button Examples

```vue
<!-- Primary action -->
<button class="btn btn-primary">Save</button>

<!-- Secondary action -->
<button class="btn">Cancel</button>

<!-- Danger action -->
<button class="btn btn-error">Delete</button>

<!-- Small button -->
<button class="btn btn-small">Edit</button>

<!-- Icon only -->
<button class="btn btn-icon">
  <svg>...</svg>
</button>
```

## 📝 Form Examples

```vue
<!-- Input field -->
<div class="form-group">
  <label class="form-label">Email</label>
  <input type="email" class="input" />
</div>

<!-- Input with error -->
<div class="form-group">
  <label class="form-label">Password</label>
  <input type="password" class="input input-error" />
  <span class="form-error">Password is required</span>
</div>

<!-- Input with help text -->
<div class="form-group">
  <label class="form-label">Username</label>
  <input type="text" class="input" />
  <span class="form-help">Choose a unique username</span>
</div>
```

## 🎴 Card Examples

```vue
<!-- Basic card -->
<div class="card">
  <h3>Title</h3>
  <p>Content</p>
</div>

<!-- Card with header -->
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Card Title</h3>
  </div>
  <div class="card-body">
    <p>Card content goes here</p>
  </div>
</div>
```

## 🔔 Alert Examples

```vue
<!-- Fixed position alerts (notifications) -->
<div class="alert alert-success" style="position: fixed; top: 20px; right: 20px; z-index: 1000;">
  ✓ Saved successfully!
</div>

<div class="alert alert-error" style="position: fixed; top: 80px; right: 20px; z-index: 1000;">
  ✕ An error occurred
</div>

<!-- Inline alerts -->
<div class="alert alert-warning">
  ⚠ Warning message
</div>

<div class="alert alert-info">
  ℹ Info message
</div>
```

## 🏷️ Layout Patterns

```vue
<!-- Horizontal layout with gap -->
<div class="flex items-center gap-md">
  <span>Item 1</span>
  <span>Item 2</span>
</div>

<!-- Vertical layout -->
<div class="flex flex-col gap-lg">
  <div>Section 1</div>
  <div>Section 2</div>
</div>

<!-- Space between layout -->
<div class="flex items-center justify-between">
  <span>Left</span>
  <span>Right</span>
</div>

<!-- Centered content -->
<div class="flex items-center justify-center">
  <div>Centered content</div>
</div>
```

## 📱 Responsive Helpers

```css
/* Full width on mobile */
.w-full

/* Center with auto margins */
.m-auto

/* Overflow handling */
.overflow-auto
.overflow-hidden
```

## 🎯 Common Component Patterns

### Header with actions

```vue
<div class="flex items-center justify-between p-lg border-b">
  <h2 class="text-2xl font-semibold">Title</h2>
  <button class="btn btn-primary">Action</button>
</div>
```

### List with badges

```vue
<div class="flex items-center gap-md">
  <span class="text-base">Item name</span>
  <span class="badge badge-primary">New</span>
</div>
```

### Settings group

```vue
<div class="flex flex-col gap-sm p-lg border rounded-lg">
  <label class="text-sm font-medium">Setting name</label>
  <input type="text" class="input" />
</div>
```

### Modal/Dialog

```vue
<div class="fixed" style="inset: 0; background: rgba(0,0,0,0.5); z-index: var(--z-modal-backdrop);">
  <div class="flex items-center justify-center" style="min-height: 100vh;">
    <div class="card" style="max-width: 500px; margin: var(--spacing-lg);">
      <div class="card-header">
        <h3 class="card-title">Modal Title</h3>
      </div>
      <div class="card-body">
        <p>Modal content</p>
      </div>
      <div class="flex gap-md justify-end mt-lg">
        <button class="btn">Cancel</button>
        <button class="btn btn-primary">Confirm</button>
      </div>
    </div>
  </div>
</div>
```

## 🎨 Color Combinations

### Primary button
```css
background: var(--color-primary);
color: var(--color-white);
border-color: var(--color-primary);
```

### Success alert
```css
background: var(--color-success);
color: var(--color-white);
box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
```

### Card hover
```css
background: var(--color-white);
border: 1px solid var(--color-gray-200);
box-shadow: var(--shadow-sm);
transition: var(--transition-base);

/* On hover */
box-shadow: var(--shadow-md);
```

## 💡 Tips

1. **Start with utility classes** - They cover 80% of use cases
2. **Use CSS variables** - Never hardcode colors or spacing
3. **Consistent shadows** - Use predefined shadow variables
4. **Transitions** - Add `transition: var(--transition-base)` for smooth interactions
5. **Z-index** - Use predefined z-index variables for layering

## 🔍 Finding the right token

- **Small spacing?** → `var(--spacing-sm)` (8px)
- **Button padding?** → `var(--spacing-md)` or `var(--spacing-lg)` (12-16px)
- **Section spacing?** → `var(--spacing-xl)` or `var(--spacing-2xl)` (24-32px)
- **Rounded corners?** → `var(--radius-lg)` (8px) is most common
- **Card shadows?** → `var(--shadow-sm)` resting, `var(--shadow-md)` hover
- **Text size?** → `var(--font-size-base)` (16px) is default
