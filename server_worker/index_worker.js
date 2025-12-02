// Hono框架实现的Cloudflare Worker API服务
// 提供与原Express应用相同的API端点，但适配Cloudflare Workers环境

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt } from 'hono/jwt';
import { env } from 'hono/adapter';

// 创建Hono应用实例
const app = new Hono();

// 配置CORS中间件
app.use('*', cors({
  origin: '*', // 在生产环境中应该限制具体的域名
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}));

// 模拟节点数据（因为Cloudflare Workers不能直接连接MySQL）
const mockNodes = [
  { id: 1, node_id: 1, name: '装修准备', parent_id: null, sort_order: 0 },
  { id: 2, node_id: 2, name: '水电改造', parent_id: 1, sort_order: 1 },
  { id: 3, node_id: 3, name: '木工工程', parent_id: 1, sort_order: 2 },
  { id: 4, node_id: 4, name: '瓦工工程', parent_id: 1, sort_order: 3 },
  { id: 5, node_id: 5, name: '油漆工程', parent_id: 1, sort_order: 4 }
];

// 模拟用户数据
const mockUsers = [
  { id: 1, username: 'demo', password_hash: '$2a$10$8Hl5bLxk5TfFy1vO8XQx9Oe0U2y4Q4Xx9Oe0U2y4Q4Xx9Oe0U2y4Q' } // password: demo
];

// 验证JWT的中间件
const jwtMiddleware = jwt({
  secret: (c) => {
    const { JWT_SECRET } = env(c);
    return JWT_SECRET || 'default_secret_key'; // 应该从环境变量获取
  },
  // Hono的jwt中间件默认需要凭证，可以通过错误处理来实现可选认证
});

// 可选的JWT认证
const optionalJwt = async (c, next) => {
  try {
    await jwtMiddleware(c, next);
  } catch (error) {
    // 不抛出错误，允许请求继续
    await next();
  }
};

// 认证相关路由
app.post('/api/auth/register', async (c) => {
  try {
    const { username, password } = await c.req.json();
    
    // 在实际应用中，这里应该使用bcrypt进行密码哈希
    // 但在Worker环境中，我们简化处理
    
    // 检查用户是否已存在
    const existingUser = mockUsers.find(u => u.username === username);
    if (existingUser) {
      return c.json({ error: '用户名已存在' }, 409);
    }
    
    // 创建新用户
    const newUserId = mockUsers.length + 1;
    mockUsers.push({
      id: newUserId,
      username,
      password_hash: password // 在实际应用中应该哈希处理
    });
    
    return c.json({ id: newUserId }, 201);
  } catch (error) {
    console.error('注册错误:', error);
    return c.json({ error: '服务器错误' }, 500);
  }
});

app.post('/api/auth/login', async (c) => {
  try {
    const { username, password } = await c.req.json();
    
    // 查找用户
    const user = mockUsers.find(u => u.username === username);
    
    if (!user || user.password_hash !== password) { // 简化的密码验证
      return c.json({ error: '无效凭证' }, 401);
    }
    
    // 生成JWT
    const { JWT_SECRET } = env(c);
    const secret = JWT_SECRET || 'default_secret_key';
    
    // 在实际应用中，应该使用标准的JWT库生成token
    // 这里简化处理
    const token = `mock_jwt_token_${user.id}`;
    
    return c.json({ token });
  } catch (error) {
    console.error('登录错误:', error);
    return c.json({ error: '登录错误' }, 500);
  }
});

app.get("/api/", (c) => c.json({ name: "Decoration Mind Map" }));
// 节点相关路由
app.get('/api/nodes', async (c) => {
  try {
    // 返回模拟数据
    return c.json(mockNodes);
  } catch (error) {
    console.error('获取节点错误:', error);
    return c.json({ error: error.message }, 500);
  }
});

// 处理其他请求
app.all('*', (c) => {
  return c.json({ error: '路由不存在' }, 404);
});

// 导出应用
// Cloudflare Worker导出语法
export default app;