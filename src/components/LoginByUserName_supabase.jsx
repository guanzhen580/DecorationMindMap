import "../index.css";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useUser } from '../context/UserContext';

/**
 * Supabase用户名/密码认证组件
 * 实现用户注册、登录、登出等功能
 */
const supabase = createClient(
  import.meta.env.VITE_PUBLIC_SUPABASE_URL,
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY
);

export default function LoginBySupabaseUsername({ onSuccess }) {
  // 认证状态管理
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // 表单状态管理
  const [isRegister, setIsRegister] = useState(false); // 切换注册/登录模式
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const { login } = useUser();

  /**
   * 初始化时检查用户会话状态
   * 监听认证状态变化
   */
  useEffect(() => {
    // 查询supabase中是否存在现有会话
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * 处理用户注册
   * @param {Event} event - 表单提交事件
   */
  const handleRegister = async (event) => {
    event.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      console.log("注册尝试:", { email, password, username });
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username, // 存储用户名到用户元数据
          },
        },
      });

      if (error) {
        throw error;
      }

      // 注册成功，调用成功回调
      if (data.user) {
        onSuccess?.(data.user);
        console.log("注册成功:", data.user);
        setIsRegister(false); // 切换回登录模式
      }
    } catch (error) {
      setAuthError(error.message);
      console.error("注册失败:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理用户登录
   * @param {Event} event - 表单提交事件
   */
  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      console.log("登录尝试:", { email, password });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // 登录成功，调用成功回调
      if (data.session) {
        console.log("login success data: ", data);
        login({
          token: data.session.access_token,
          username,
          isPremium: data.isPremium || false // 从API响应获取VIP状态
        });
        onSuccess?.(data.user);
      }
    } catch (error) {
      setAuthError(error.message);
      console.error("登录失败:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理用户登出
   */
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
    } catch (error) {
      console.error("登出失败:", error);
    }
  };

  /**
   * 渲染错误信息
   */
  const renderError = () => {
    if (!authError) return null;
    return (
      <div style={{ color: "red", margin: "10px 0" }}>
        {authError}
      </div>
    );
  };

  /**
   * 渲染已登录状态
   */
  if (session) {
    login({
      token: session.access_token,
      username: session.user.user_metadata.username,
      isPremium: session.user.user_metadata.isPremium || false // 从用户元数据获取VIP状态
    });
    return (
      <div style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}>
        <h1>欢迎回来！</h1>
        <p>您已登录为: {session.user.email}</p>
        {session.user.user_metadata?.username && (
          <p>用户名: {session.user.user_metadata.username}</p>
        )}
        <button
          onClick={handleLogout}
          style={{
            padding: "10px 20px",
            backgroundColor: "#ff4d4f",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          登出
        </button>
      </div>
    );
  }

  /**
   * 渲染登录/注册表单
   */
  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}>
      <h1>{isRegister ? "用户注册" : "用户登录"}</h1>

      {renderError()}

      {isRegister ? (
        // 注册表单
        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>
              用户名:
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #d9d9d9"
              }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>
              电子邮箱:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #d9d9d9"
              }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>
              密码:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6} // 密码最小长度
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #d9d9d9"
              }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "10px 20px",
                backgroundColor: "#1890ff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              {loading ? "注册中..." : "注册"}
            </button>
          </div>
        </form>
      ) : (
        // 登录表单
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>
              电子邮箱:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #d9d9d9"
              }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>
              密码:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #d9d9d9"
              }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "10px 20px",
                backgroundColor: "#1890ff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              {loading ? "登录中..." : "登录"}
            </button>
          </div>
        </form>
      )}

      {/* 切换登录/注册模式 */}
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        {isRegister ? (
          <p>
            已有账号？
            <button
              onClick={() => setIsRegister(false)}
              style={{
                background: "none",
                border: "none",
                color: "#1890ff",
                cursor: "pointer",
                textDecoration: "underline"
              }}
            >
              立即登录
            </button>
          </p>
        ) : (
          <p>
            还没有账号？
            <button
              onClick={() => setIsRegister(true)}
              style={{
                background: "none",
                border: "none",
                color: "#1890ff",
                cursor: "pointer",
                textDecoration: "underline"
              }}
            >
              立即注册
            </button>
          </p>
        )}
      </div>
    </div>
  );
}