import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

/**
 * 按照 MSW 官方推荐的方式启用 mocking
 * 在开发环境和 GitHub Pages 演示环境下启用
 */
async function enableMocking() {
  // 在开发环境或 GitHub Pages 演示环境下启用 MSW
  if (import.meta.env.DEV || window.location.hostname.includes('github.io')) {
    const { worker } = await import('./mocks/browser')
    return worker.start()
  }
}

// 启用 mocking 后再渲染应用
enableMocking().then(() => {
  const root = ReactDOM.createRoot(document.getElementById('root')!)

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
})
