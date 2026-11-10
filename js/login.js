// ====================================================================
// AyurDesk - Login Page Script
// ====================================================================

document.addEventListener('DOMContentLoaded', () => {
  // If already authenticated, redirect to index.html or ?from=
  const currentUser = window.authManager.getCurrentUser();
  if (currentUser) {
    const urlParams = new URLSearchParams(window.location.search);
    const from = urlParams.get('from') || 'index.html';
    window.location.href = from;
    return;
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }

  const tabSignIn = document.getElementById('tab-signin');
  const tabRegister = document.getElementById('tab-register');
  const formSignIn = document.getElementById('signin-form');
  const formRegister = document.getElementById('register-form');

  tabSignIn.addEventListener('click', () => {
    tabSignIn.classList.add('active');
    tabRegister.classList.remove('active');
    formSignIn.style.display = 'flex';
    formRegister.style.display = 'none';
  });

  tabRegister.addEventListener('click', () => {
    tabRegister.classList.add('active');
    tabSignIn.classList.remove('active');
    formSignIn.style.display = 'none';
    formRegister.style.display = 'flex';
  });

  // Handle Sign In Submit
  formSignIn.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;
    const btn = document.getElementById('btn-submit-signin');

    btn.disabled = true;
    btn.innerHTML = 'Authenticating...';

    try {
      const res = await window.authManager.signIn(email, password);
      if (res.success) {
        window.showToast('Welcome Back', `Signed in as ${res.user.full_name}`, 'success');
        const urlParams = new URLSearchParams(window.location.search);
        const from = urlParams.get('from') || 'index.html';
        setTimeout(() => {
          window.location.href = from;
        }, 500);
      } else {
        window.showToast('Authentication Error', 'Invalid credentials or user not found.', 'error');
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="log-in"></i><span>Sign In to AyurDesk</span>';
        if (window.lucide) window.lucide.createIcons();
      }
    } catch (err) {
      window.showToast('Authentication Failed', err.message || 'Error occurred', 'error');
      btn.disabled = false;
      btn.innerHTML = '<i data-lucide="log-in"></i><span>Sign In to AyurDesk</span>';
      if (window.lucide) window.lucide.createIcons();
    }
  });

  // Handle Register Submit
  formRegister.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fullName = document.getElementById('reg-fullname').value;
    const email = document.getElementById('reg-email').value;
    const role = document.getElementById('reg-role').value;
    const password = document.getElementById('reg-password').value;
    const btn = document.getElementById('btn-submit-reg');

    btn.disabled = true;
    btn.innerHTML = 'Registering User...';

    try {
      // Add user to data store
      await window.dataStore.addUser({
        full_name: fullName,
        email: email,
        role: role,
      });

      // Sign in as this user
      window.authManager.setUser({
        id: 'usr-' + Date.now(),
        email: email,
        full_name: fullName,
        role: role,
        must_change_password: false,
      });

      window.showToast('Account Created', `Welcome to AyurDesk, ${fullName}!`, 'success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 600);
    } catch (err) {
      window.showToast('Registration Error', err.message || 'Could not register user', 'error');
      btn.disabled = false;
      btn.innerHTML = '<i data-lucide="user-plus"></i><span>Create Account</span>';
      if (window.lucide) window.lucide.createIcons();
    }
  });
});

// Demo Login Shortcut
function quickLogin(roleKey) {
  const user = window.authManager.signInDemo(roleKey);
  window.showToast('Demo Access Granted', `Logged in as ${user.full_name} (${user.role})`, 'success');
  const urlParams = new URLSearchParams(window.location.search);
  const from = urlParams.get('from') || 'index.html';
  setTimeout(() => {
    window.location.href = from;
  }, 400);
}

window.quickLogin = quickLogin;

