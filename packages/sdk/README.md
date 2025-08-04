# MSW Controller SDK

A universal JavaScript/TypeScript SDK for managing Mock Service Worker (MSW) handlers with a visual interface.

## Features

- 🎯 **Framework Agnostic**: Works with any JavaScript framework or vanilla JS
- 🎨 **Visual Interface**: Floating button and control panel for easy MSW management
- 🌙 **Dark Mode Support**: Built-in dark/light theme switching
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🔧 **Customizable**: Flexible configuration options
- 📦 **Lightweight**: Minimal dependencies

## Installation

```bash
npm install @msw-controller/sdk
# or
yarn add @msw-controller/sdk
# or
pnpm add @msw-controller/sdk
```

## Quick Start

### Basic Usage

```javascript
import { initMSWController } from '@msw-controller/sdk';

// Initialize with default settings
const controller = initMSWController();
```

### Advanced Configuration

```javascript
import { MSWControllerSDK } from '@msw-controller/sdk';

const controller = new MSWControllerSDK({
  container: document.body, // Container element
  position: { x: 20, y: 20 }, // Initial button position
  theme: {
    primary: '#3B82F6',
    secondary: '#10B981',
    background: '#FFFFFF',
    text: '#1F2937'
  },
  buttonContent: 'MSW', // Custom button text
  isDarkMode: false // Initial theme
});

// Show the controller
controller.show();

// Hide the controller
controller.hide();

// Destroy the controller
controller.destroy();
```

### HTML Usage

```html
<!DOCTYPE html>
<html>
<head>
  <title>MSW Controller Example</title>
</head>
<body>
  <script type="module">
    import { initMSWController } from 'https://unpkg.com/@msw-controller/sdk';
    
    // Initialize MSW Controller
    initMSWController({
      position: { x: 50, y: 50 },
      buttonContent: '🔧'
    });
  </script>
</body>
</html>
```

## API Reference

### `initMSWController(config?)`

A convenience function that creates and shows an MSWControllerSDK instance.

**Parameters:**
- `config` (optional): Configuration object

**Returns:** MSWControllerSDK instance

### `MSWControllerSDK`

The main SDK class for managing the MSW controller.

#### Constructor

```typescript
new MSWControllerSDK(config?: MSWControllerConfig)
```

#### Methods

- `show()`: Show the floating button and enable the controller
- `hide()`: Hide the floating button and control panel
- `destroy()`: Remove all elements and clean up event listeners
- `updateTheme(theme: Partial<Theme>)`: Update the theme colors
- `updatePosition(position: Position)`: Update the button position

#### Configuration Options

```typescript
interface MSWControllerConfig {
  container?: HTMLElement; // Container element (default: document.body)
  position?: Position; // Initial button position
  theme?: Partial<Theme>; // Theme colors
  buttonContent?: string; // Button text/content
  isDarkMode?: boolean; // Initial dark mode state
}

interface Position {
  x: number;
  y: number;
}

interface Theme {
  primary: string;
  secondary: string;
  background: string;
  text: string;
}
```

## Examples

### React Integration

```jsx
import React, { useEffect } from 'react';
import { initMSWController } from '@msw-controller/sdk';

function App() {
  useEffect(() => {
    const controller = initMSWController({
      position: { x: 20, y: 20 },
      isDarkMode: true
    });

    return () => {
      controller.destroy();
    };
  }, []);

  return (
    <div>
      <h1>My App</h1>
      {/* Your app content */}
    </div>
  );
}
```

### Vue Integration

```vue
<template>
  <div>
    <h1>My App</h1>
    <!-- Your app content -->
  </div>
</template>

<script>
import { initMSWController } from '@msw-controller/sdk';

export default {
  mounted() {
    this.controller = initMSWController({
      position: { x: 20, y: 20 }
    });
  },
  beforeUnmount() {
    if (this.controller) {
      this.controller.destroy();
    }
  }
};
</script>
```

### Angular Integration

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { initMSWController, MSWControllerSDK } from '@msw-controller/sdk';

@Component({
  selector: 'app-root',
  template: `
    <h1>My App</h1>
    <!-- Your app content -->
  `
})
export class AppComponent implements OnInit, OnDestroy {
  private controller?: MSWControllerSDK;

  ngOnInit() {
    this.controller = initMSWController({
      position: { x: 20, y: 20 }
    });
  }

  ngOnDestroy() {
    if (this.controller) {
      this.controller.destroy();
    }
  }
}
```

## License

MIT