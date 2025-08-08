import { getControllerInstance } from '@msw-controller/core'
import { type MSWControllerSDK, renderMSWController } from '@msw-controller/sdk'
import { useEffect, useState } from 'react'

function App() {
  const [response, setResponse] = useState<string>('')
  const [loading, setLoading] = useState(false)

  // 初始化 MSW Controller SDK - 提供悬浮按钮和控制面板UI
  useEffect(() => {
    let mswController: MSWControllerSDK | null = null
    try {
      const controller = getControllerInstance()
      mswController = renderMSWController(controller, {
        // 其他配置选项
      })
      console.log('✅ MSW Controller SDK 初始化成功')
    } catch (error) {
      console.error('❌ MSW Controller SDK 初始化失败:', error)
      console.warn('⚠️ SDK 初始化失败，但不影响应用正常运行')
    }

    // 清理函数：组件卸载时销毁SDK实例，避免内存泄漏
    return () => {
      if (typeof mswController?.destroy === 'function') {
        mswController.destroy()
        console.log('🧹 MSW Controller SDK 已清理')
      }
    }
  }, [])

  const makeRequest = async (url: string, options?: RequestInit) => {
    setLoading(true)
    setResponse('正在请求...')

    const startTime = Date.now()

    try {
      const res = await fetch(url, options)
      const endTime = Date.now()
      const responseTime = endTime - startTime

      // 检查响应是否成功
      if (!res.ok) {
        const errorData = await res.json()
        setResponse(`❌ 请求失败 (${res.status})\n\n${JSON.stringify(errorData, null, 2)}`)
        return
      }

      // 解析JSON响应
      const data = await res.json()

      // 格式化显示响应
      const formattedResponse = `✅ 请求成功 (${res.status}) - ${responseTime}ms\n\n${JSON.stringify(data, null, 2)}`
      setResponse(formattedResponse)
    } catch (error) {
      console.error('❌ 请求失败:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      setResponse(
        `❌ 网络错误: ${errorMessage}\n\n请检查:\n1. MSW是否正常启动\n2. 网络连接是否正常\n3. API路径是否正确`,
      )
    } finally {
      setLoading(false)
    }
  }

  const testGetUsers = () => {
    makeRequest('/api/users')
  }

  const testCreateUser = () => {
    makeRequest('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'New User',
        email: 'newuser@example.com',
        role: 'User',
      }),
    })
  }

  const testGetPosts = () => {
    makeRequest('/api/posts')
  }

  const testGetUser = () => {
    makeRequest('/api/users/1')
  }

  const testError = () => {
    makeRequest('/api/error')
  }

  const testSlow = () => {
    makeRequest('/api/slow')
  }

  return (
    <div className="container">
      <header className="header">
        <div className="header-content">
          <div className="header-text">
            <h1>MSW Controller React Example</h1>
            <p>演示如何使用 MSW Controller</p>
          </div>
        </div>
      </header>

      <div className="demo-section">
        <h2>🚀 开始使用</h2>
        <p>
          <strong>第一步：</strong>点击下面的按钮来测试不同的 API 请求，观察网络请求如何被 MSW
          拦截和模拟。
        </p>

        <div className="api-buttons">
          <button type="button" className="api-button" onClick={testGetUsers}>
            获取用户列表
          </button>
          <button type="button" className="api-button" onClick={testCreateUser}>
            创建新用户
          </button>
          <button type="button" className="api-button" onClick={testGetPosts}>
            获取文章列表
          </button>
          <button type="button" className="api-button" onClick={testGetUser}>
            获取单个用户
          </button>
          <button type="button" className="api-button" onClick={testError}>
            测试错误响应
          </button>
          <button type="button" className="api-button" onClick={testSlow}>
            测试延迟响应
          </button>
        </div>

        <div className="response-display">
          {loading ? (
            <div className="loading">正在加载...</div>
          ) : (
            <pre>{response || '点击上面的按钮开始测试 API'}</pre>
          )}
        </div>
      </div>

      <div className="demo-section">
        <h2>🎛️ 使用 MSW Controller</h2>
        <p>
          <strong>第二步：</strong>点击右下角的浮动按钮{' '}
          <span
            style={{
              background: '#007acc',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '12px',
            }}
          >
            MSW
          </span>{' '}
          打开控制面板
        </p>

        <div
          style={{
            background: '#f8f9fa',
            padding: '15px',
            borderRadius: '8px',
            margin: '15px 0',
            border: '1px solid #e9ecef',
          }}
        >
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#495057' }}>
            💡 控制面板功能：
          </h3>
          <ul style={{ marginLeft: '20px', marginBottom: '10px' }}>
            <li>
              <strong>请求记录 标签：</strong>查看和管理所有的 API 处理器，可以启用/禁用特定接口
            </li>
            <li>
              <strong>Handlers 标签：</strong>查看所有被拦截的请求历史记录
            </li>
            <li>
              <strong>设置 标签：</strong>调整工具的全局设置，包括主题切换和面板重置
            </li>
          </ul>
          <div
            style={{
              marginTop: '10px',
              padding: '10px',
              background: '#e3f2fd',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          >
            <strong>🎯 交互功能：</strong>
            <br />• <strong>拖拽移动：</strong>点击面板标题栏可拖拽移动面板位置
            <br />• <strong>调整大小：</strong>拖拽面板右下角可调整面板大小
            <br />• <strong>状态保存：</strong>面板位置、大小和主题偏好会自动保存
          </div>
        </div>

        <p>
          <strong>第三步：</strong>尝试在控制面板中禁用某个处理器，然后重新发送请求，观察真实 API
          调用的效果
        </p>
        <p style={{ marginTop: '20px' }}>
          了解更多信息，请访问：
          <a
            href="https://github.com/007sair/msw-controller"
            target="_blank"
            rel="noopener noreferrer"
            className="github-link"
            aria-label="查看 GitHub 仓库"
          >
            <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            <span>GitHub 仓库</span>
          </a>
        </p>
      </div>
    </div>
  )
}

export default App
