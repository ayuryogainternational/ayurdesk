// ====================================================================
// AyurDesk - Login Page Script with Portal Switcher
// Organization: Ayuryoga International
// ====================================================================

let activePortal = 'desk'; // 'desk' | 'therapist'

document.addEventListener('DOMContentLoaded', () => {
  // If already authenticated, redirect appropriately
  const currentUser = window.authManager.getCurrentUser();
  if (currentUser) {
    if (currentUser.role === 'therapist') {
      window.location.href = 'therapist-portal.html';
      return;
    }
    const urlParams = new URLSearchParams(window.location.search);
    const from = urlParams.get('from') || 'index.html';
    window.location.href = from;
    return;
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Portal Toggle
  const toggleDesk = document.getElementById('portal-toggle-desk');
  const toggleTherapist = document.getElementById('portal-toggle-therapist');
  const portalBannerText = document.getElementById('portal-banner-text');
  const portalBannerIcon = document.getElementById('portal-banner-icon');
  const demoProfilesDesk = document.getElementById('demo-profiles-desk');
  const demoProfilesTherapist = document.getElementById('demo-profiles-therapist');
  const signinEmailInput = document.getElementById('signin-email');
  const signinBtnText = document.getElementById('btn-submit-signin-text');
  const tabRegisterLabel = document.getElementById('tab-register-label');
  const regRoleSelect = document.getElementById('reg-role');

  function switchPortal(portal) {
    activePortal = portal;
    if (portal === 'therapist') {
      toggleTherapist.classList.add('active');
      toggleDesk.classList.remove('active');
      portalBannerText.textContent = 'Ayurvedic Treatment & Daily Attendance Management';
      if (portalBannerIcon) portalBannerIcon.setAttribute('data-lucide', 'heart-pulse');
      demoProfilesDesk.style.display = 'none';
      demoProfilesTherapist.style.display = 'block';
      signinEmailInput.placeholder = 'vishnu@ayuryoga.com';
      signinBtnText.textContent = 'Sign In to Therapist Portal';
      if (tabRegisterLabel) tabRegisterLabel.textContent = 'Register Therapist';
      if (regRoleSelect) regRoleSelect.value = 'therapist';
    } else {
      toggleDesk.classList.add('active');
      toggleTherapist.classList.remove('active');
      portalBannerText.textContent = 'Reception & Administrative Operations';
      if (portalBannerIcon) portalBannerIcon.setAttribute('data-lucide', 'shield-check');
      demoProfilesDesk.style.display = 'block';
      demoProfilesTherapist.style.display = 'none';
      signinEmailInput.placeholder = 'admin@ayuryoga.example.com';
      signinBtnText.textContent = 'Sign In to AyurDesk';
      if (tabRegisterLabel) tabRegisterLabel.textContent = 'Register Team';
      if (regRoleSelect) regRoleSelect.value = 'staff';
    }
    if (window.lucide) window.lucide.createIcons();
  }

  if (toggleDesk) toggleDesk.addEventListener('click', () => switchPortal('desk'));
  if (toggleTherapist) toggleTherapist.addEventListener('click', () => switchPortal('therapist'));

  // Check URL query param ?portal=therapist
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('portal') === 'therapist') {
    switchPortal('therapist');
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
        const from = urlParams.get('from');

        setTimeout(() => {
          if (res.user.role === 'therapist') {
            window.location.href = 'therapist-portal.html';
          } else {
            window.location.href = from || 'index.html';
          }
        }, 500);
      } else {
        window.showToast('Authentication Error', 'Invalid credentials or user not found.', 'error');
        btn.disabled = false;
        btn.innerHTML = `<i data-lucide="log-in"></i><span>${signinBtnText.textContent}</span>`;
        if (window.lucide) window.lucide.createIcons();
      }
    } catch (err) {
      window.showToast('Authentication Failed', err.message || 'Error occurred', 'error');
      btn.disabled = false;
      btn.innerHTML = `<i data-lucide="log-in"></i><span>${signinBtnText.textContent}</span>`;
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
    btn.innerHTML = 'Registering Account...';

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
        if (role === 'therapist') {
          window.location.href = 'therapist-portal.html';
        } else {
          window.location.href = 'index.html';
        }
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
  const from = urlParams.get('from');

  setTimeout(() => {
    if (user.role === 'therapist' || roleKey === 'vishnu' || roleKey === 'priya') {
      window.location.href = 'therapist-portal.html';
    } else {
      window.location.href = from || 'index.html';
    }
  }, 400);
}

window.quickLogin = quickLogin;

