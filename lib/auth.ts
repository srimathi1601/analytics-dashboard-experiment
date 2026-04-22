const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin@123";
const USERS_KEY = "registered_users";
const SESSION_KEY = "auth_session";

export interface User {
  username: string;
  password: string;
  role: "admin" | "user";
  createdAt: string;
}

export interface Session {
  username: string;
  role: "admin" | "user";
  token: string;
}

function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function getRegisteredUsers(): User[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(USERS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveUser(user: User): void {
  const users = getRegisteredUsers();
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function login(username: string, password: string): { success: boolean; error?: string } {
  const isAdmin = username === ADMIN_USERNAME && password === ADMIN_PASSWORD;

  if (isAdmin) {
    const session: Session = { username, role: "admin", token: generateToken() };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    document.cookie = `auth-session=${session.token}; path=/; max-age=${60 * 60 * 24}`;
    return { success: true };
  }

  const users = getRegisteredUsers();
  const user = users.find((u) => u.username === username && u.password === password);

  if (user) {
    const session: Session = { username, role: user.role, token: generateToken() };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    document.cookie = `auth-session=${session.token}; path=/; max-age=${60 * 60 * 24}`;
    return { success: true };
  }

  return { success: false, error: "Invalid username or password" };
}

export function register(
  username: string,
  password: string
): { success: boolean; error?: string } {
  if (username === ADMIN_USERNAME) {
    return { success: false, error: "Username already taken" };
  }

  const users = getRegisteredUsers();
  if (users.find((u) => u.username === username)) {
    return { success: false, error: "Username already taken" };
  }

  if (username.length < 3) {
    return { success: false, error: "Username must be at least 3 characters" };
  }
  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters" };
  }

  saveUser({
    username,
    password,
    role: "user",
    createdAt: new Date().toISOString(),
  });

  return { success: true };
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
  document.cookie = "auth-session=; path=/; max-age=0";
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(SESSION_KEY);
  return stored ? JSON.parse(stored) : null;
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}
