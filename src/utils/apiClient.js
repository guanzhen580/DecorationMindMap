// API客户端工具，用于处理前端API请求
// 适配CloudFlare Pages部署环境
import axios from 'axios';

// 创建axios实例
const apiClient = axios.create({
  // 基础URL会根据环境自动适配
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 获取API基础URL
 * 根据部署环境自动选择正确的API端点
 * @returns {string} API基础URL
 */
function getApiBaseUrl() {
  // 判断是否在CloudFlare Pages环境中
  const isCloudflareDeployed = import.meta.env.VITE_CLOUDFLARE_DEPLOYED === 'true';
  
  if (isCloudflareDeployed) {
    // 在CloudFlare Pages上，使用自定义域名或后端API地址
    // 这里需要替换为实际的后端API地址
    return 'https://your-backend-api.example.com';
  } else {
    // 本地开发环境，使用开发服务器代理
    return '/api';
  }
}

/**
 * 设置认证token
 * @param {string} token - JWT认证令牌
 */
export function setAuthToken(token) {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
}

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 可以在这里添加请求前的逻辑，如token验证等
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // 统一错误处理
    if (error.response) {
      // 服务器响应了，但状态码不是2xx
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // 请求已发送，但未收到响应
      console.error('Network Error:', error.request);
    } else {
      // 请求配置出错
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// 导出API客户端
export default apiClient;
