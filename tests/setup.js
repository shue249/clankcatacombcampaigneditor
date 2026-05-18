import '@testing-library/jest-dom'

// React Flow uses ResizeObserver which is not available in happy-dom
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
