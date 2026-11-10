// ====================================================================
// AyurDesk - Authentication & Role-Based Access Control
// Organization: Ayuryoga International
// ====================================================================

const DEMO_USERS = {
  admin: {
    id: '36c696a3-bd86-46e2-8ff8-06bec48f37f4',
    email: 'admin@ayuryoga.example.com',
    full_name: 'Owner / Administrator',
    role: 'admin',
    must_change_password: false,
  },
  shilpa: {
    id: 'ad5cf6a7-175e-4e41-a97a-a2621e1fe2df',
    email: 'shilpa@ayuryoga.example.com',
    full_name: 'Shilpa',
    role: 'staff',
    must_change_password: true,
  },
  gokul: {
    id: 'b110aeeb-dc4d-42d5-b1fb-6eb4dece1267',
    email: 'gokul@ayuryoga.example.com',
    full_name: 'Gokul',
    role: 'staff',
    must_change_password: true,
  },
};

const AUTH_STORAGE_KEY = 'ayurdesk_auth_user_v2';

class AuthManager {
  constructor() {
    this.currentUser = this.loadUser();
    this.ensureSupabaseSession();
  }

  async ensureSupabaseSession() {
    if (!window.supabaseClient || !this.currentUser) return;
    try {
      const { data } = await window.supabaseClient.auth.getSession();
      if (!data?.session && this.currentUser.email) {
        await window.supabaseClient.auth.signInWithPassword({
          email: this.currentUser.email,
          password: 'ChangeMe123!',
        });
      }
    } catch (err) {
      console.warn('[AyurDesk] Background session ensure notice:', err);
    }
  }

  loadUser() {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  getCurrentUser() {
    if (!this.currentUser) {
      this.currentUser = this.loadUser();
    }
    return this.currentUser;
  }

  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === 'admin';
  }

  async signIn(email, password) {
    // 1. Try Supabase Auth if available
    if (window.supabaseClient) {
      try {
        const { data, error } = await window.supabaseClient.auth.signInWithPassword({
          email,
          password,
        });

        if (!error && data && data.user) {
          const userObj = {
            id: data.user.id,
            email: data.user.email,
            full_name: data.user.user_metadata?.full_name || email.split('@')[0],
            role: data.user.user_metadata?.role || (email.includes('admin') ? 'admin' : 'staff'),
            must_change_password: false,
          };
          this.setUser(userObj);
          return { success: true, user: userObj };
        }
      } catch (err) {
        console.warn('[AyurDesk] Supabase auth attempt notice:', err);
      }
    }

    // 2. Fallback local / demo authentication
    const cleanEmail = email.toLowerCase().trim();
    if (cleanEmail.includes('admin') || cleanEmail.includes('owner')) {
      const user = DEMO_USERS.admin;
      this.setUser(user);
      this.syncSupabaseLogin(user.email);
      return { success: true, user };
    } else if (cleanEmail.includes('shilpa')) {
      const user = DEMO_USERS.shilpa;
      this.setUser(user);
      this.syncSupabaseLogin(user.email);
      return { success: true, user };
    } else if (cleanEmail.includes('gokul')) {
      const user = DEMO_USERS.gokul;
      this.setUser(user);
      this.syncSupabaseLogin(user.email);
      return { success: true, user };
    } else {
      // Generic staff login
      const user = {
        id: 'usr-' + Date.now(),
        email: cleanEmail,
        full_name: cleanEmail.split('@')[0].replace('.', ' '),
        role: 'staff',
        must_change_password: false,
      };
      this.setUser(user);
      return { success: true, user };
    }
  }

  async syncSupabaseLogin(email) {
    if (window.supabaseClient) {
      try {
        await window.supabaseClient.auth.signInWithPassword({
          email,
          password: 'ChangeMe123!',
        });
      } catch (e) {
        console.warn('[AyurDesk] Supabase auth background sync notice:', e);
      }
    }
  }

  signInDemo(key) {
    const user = DEMO_USERS[key] || DEMO_USERS.admin;
    this.setUser(user);
    this.syncSupabaseLogin(user.email);
    return user;
  }

  async switchDemoUser(key) {
    const user = this.signInDemo(key);
    await this.syncSupabaseLogin(user.email);
    window.location.reload();
  }

  setUser(user) {
    this.currentUser = user;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  }

  async signOut() {
    if (window.supabaseClient) {
      try {
        await window.supabaseClient.auth.signOut();
      } catch (e) {
        console.warn('[AyurDesk] Supabase sign out:', e);
      }
    }
    this.currentUser = null;
    localStorage.removeItem(AUTH_STORAGE_KEY);
    window.location.href = 'login.html';
  }

  requireAuth(adminOnly = false) {
    const user = this.getCurrentUser();
    if (!user) {
      const currentPath = window.location.pathname.split('/').pop() || 'index.html';
      window.location.href = `login.html?from=${encodeURIComponent(currentPath)}`;
      return false;
    }

    if (adminOnly && user.role !== 'admin') {
      alert('Access restricted: This section requires Administrator permissions.');
      window.location.href = 'index.html';
      return false;
    }

    return true;
  }
}

window.authManager = new AuthManager();

