import { HttpResponse, http } from 'msw'

// 模拟用户数据
const users = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'User' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'User' },
]

// 模拟文章数据
const posts = [
  {
    id: 1,
    title: 'Getting Started with MSW',
    content: 'MSW is a powerful tool...',
    author: 'Alice Johnson',
  },
  {
    id: 2,
    title: 'React Best Practices',
    content: 'Here are some best practices...',
    author: 'Bob Smith',
  },
  {
    id: 3,
    title: 'TypeScript Tips',
    content: 'TypeScript can help you...',
    author: 'Charlie Brown',
  },
]

export const handlers = [
  // 获取用户列表
  http.get('/api/users', () => {
    return HttpResponse.json({
      success: true,
      data: users,
      message: '用户列表获取成功',
    })
  }),

  // 创建新用户
  http.post('/api/users', async ({ request }) => {
    const newUser = (await request.json()) as { name: string; email: string; role: string }
    const user = {
      id: users.length + 1,
      ...newUser,
    }
    users.push(user)

    return HttpResponse.json(
      {
        success: true,
        data: user,
        message: '用户创建成功',
      },
      { status: 201 },
    )
  }),

  // 获取文章列表
  http.get('/api/posts', () => {
    return HttpResponse.json({
      success: true,
      data: posts,
      message: '文章列表获取成功',
    })
  }),

  // 获取单个用户
  http.get('/api/users/:id', ({ params }) => {
    const { id } = params
    const user = users.find((u) => u.id === Number(id))

    if (!user) {
      return HttpResponse.json(
        {
          success: false,
          message: '用户不存在',
        },
        { status: 404 },
      )
    }

    return HttpResponse.json({
      success: true,
      data: user,
      message: '用户信息获取成功',
    })
  }),

  // 模拟错误响应
  http.get('/api/error', () => {
    return HttpResponse.json(
      {
        success: false,
        message: '服务器内部错误',
      },
      { status: 500 },
    )
  }),

  // 模拟延迟响应
  http.get('/api/slow', async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000))
    return HttpResponse.json({
      success: true,
      data: { message: '这是一个延迟2秒的响应' },
      message: '延迟响应成功',
    })
  }),
]
