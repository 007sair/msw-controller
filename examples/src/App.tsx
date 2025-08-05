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
        <h1>MSW Controller React Example</h1>
        <p>演示如何在 React 应用中使用 MSW Controller</p>
      </header>

      <div className="demo-section">
        <h2>🚀 API 测试</h2>
        <p>点击下面的按钮来测试不同的 API 请求，观察 MSW Controller 如何管理这些请求。</p>

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
        <h2>🎛️ MSW Controller</h2>
        <p>右下角的浮动按钮可以打开 MSW Controller 面板，你可以：</p>
        <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
          <li>查看和管理所有的 API 处理器</li>
          <li>启用或禁用特定的处理器</li>
          <li>查看请求历史记录</li>
          <li>调整工具设置</li>
        </ul>
      </div>
    </div>
  )
}

export default App
