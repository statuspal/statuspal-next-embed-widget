# StatusPal Next Embed Widget

A lightweight, embeddable status widget and badge built with Preact. Shows status banners and badges that can be positioned anywhere on your website.

## 🚀 Quick Start

### 1. Set Configuration

```html
<script>
  window.StatusPalNextWidgetConfig = {
    origin: 'https://status.statuspal.page', // Required
    banner: { enabled: true }, // Enable status banner
    badge: { enabled: true, selector: '.statuspal-next-badge-container' } // Enable status badge
  };
</script>
```

### 2. Include Widget

```html
<script src="https://widget.next.statuspal.io"></script>
```

### 3. Add Badge Container (Optional)

```html
<a href="https://status.statuspal.page" class="statuspal-next-badge-container"
  >Status</a
>
```

The widget automatically appears when the page loads!

## ⚙️ Configuration Options

### Required

- **`origin`** (string): Your status page URL

### Global Options

| Option    | Default  | Description                              |
| --------- | -------- | ---------------------------------------- |
| `enabled` | `true`   | Global enable/disable for all components |
| `theme`   | `'auto'` | `'auto'`, `'light'`, or `'dark'` theme   |
| `demo`    | `false`  | Only used for demo previews              |

### Banner Options (`banner` object)

| Option     | Default          | Description                                                    |
| ---------- | ---------------- | -------------------------------------------------------------- |
| `enabled`  | `true`           | Show/hide status banner                                        |
| `position` | `'bottom-right'` | `'top-left'`, `'top-right'`, `'bottom-left'`, `'bottom-right'` |
| `theme`    | inherits global  | Theme override for banner                                      |

### Badge Options (`badge` object)

| Option      | Default                             | Description                                                 |
| ----------- | ----------------------------------- | ----------------------------------------------------------- |
| `enabled`   | `false`                             | Show/hide status badges                                     |
| `selector`  | `'.statuspal-next-badge-container'` | CSS selector for badge containers                           |
| `placement` | `'right'`                           | Tooltip placement: `'top'`, `'bottom'`, `'left'`, `'right'` |
| `theme`     | inherits global                     | Theme override for badge                                    |

### Example Configuration

```javascript
window.StatusPalNextWidgetConfig = {
  origin: 'https://status.statuspal.page',
  theme: 'dark',
  banner: {
    enabled: true,
    position: 'top-right'
  },
  badge: {
    enabled: true,
    selector: '.status-badge',
    placement: 'top'
  }
};
```

## 🛠️ Development

### Prerequisites

- Node.js 22+
- npm

### Setup

```bash
npm install
npm run dev    # Development server at http://localhost:5173
```

### Build

```bash
npm run build  # Creates main.iife.js in dist/
```

## 📁 Project Structure

```
src/
├── badge.css          # Badge component styles
├── badge.tsx          # Status badge component
├── banner.css         # Banner component styles
├── banner.tsx         # Status banner component
├── helpers.ts         # Shared utilities
├── main.css           # Global widget styles
└── main.tsx           # Entry point and global API
```

## 🎨 Features

- **Lightweight**: Built with Preact (~37.0 kB zipped)
- **Dual Components**: Status banner + badge system
- **Responsive**: Mobile and desktop optimized
- **Themeable**: Auto, light, and dark themes
- **Positioned**: Multiple positioning options
- **Interactive**: Close buttons and tooltips
- **Real-time**: Auto-refresh every minute

## 📖 API Reference

### Global API

```javascript
window.StatusPalNextWidget = {
  create: function () {
    // Creates/recreates widget using window.StatusPalNextWidgetConfig
  },
  destroy: function (options) {
    // Removes widget from page
    // options: { onlyBanner?: boolean, animationEnded?: boolean }
  },
  getConfig: function () {
    // Returns processed configuration
  }
};
```

### Auto-initialization

The widget automatically initializes when:

1. `window.StatusPalNextWidgetConfig` is defined with `origin`
2. DOM is ready
3. At least one component is enabled

## 🔧 Usage Examples

### Banner + Badge

```html
<!DOCTYPE html>
<html>
  <body>
    <header>
      <a
        href="https://status.statuspal.page"
        class="statuspal-next-badge-container"
        >System Status</a
      >
    </header>

    <script>
      window.StatusPalNextWidgetConfig = {
        origin: 'https://status.statuspal.page',
        banner: { enabled: true, position: 'bottom-right' },
        badge: { enabled: true }
      };
    </script>
    <script src="https://widget.next.statuspal.io"></script>
  </body>
</html>
```

### Banner Only

```html
<script>
  window.StatusPalNextWidgetConfig = {
    origin: 'https://status.statuspal.page',
    banner: { enabled: true },
    badge: { enabled: false }
  };
</script>
```

### Custom Badge Selector

```html
<nav>
  <span class="status-indicator">Status</span>
</nav>

<script>
  window.StatusPalNextWidgetConfig = {
    origin: 'https://status.statuspal.page',
    badge: {
      enabled: true,
      selector: '.status-indicator'
    }
  };
</script>
```

## ❌ Error Handling

- Missing `origin`: Console error, no initialization
- Missing badge containers: Console error for badge selector
- API failures: Fallback to test data in development
- Network issues: Automatic retry every minute

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Make changes and test with `npm run dev`
4. Format code: `npm run format`
5. Submit pull request

## 📄 License

MIT License
