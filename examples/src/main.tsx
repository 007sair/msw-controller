import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

/**
 * 按照 MSW 官方推荐的方式启用 mocking
 * 只在开发环境下启用，避免影响生产环境
 */
async function enableMocking() {
  if (!import.meta.env.DEV) {
    return
  }
  const { worker } = await import('./mocks/browser')
  return worker.start()
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
