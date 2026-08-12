// Admin Authentication Logic

document.addEventListener('DOMContentLoaded', () => {
  // Check if we are on the login page or a protected admin page
  const isLoginPage = window.location.pathname.endsWith('login.html');
  const loginForm = document.getElementById('loginForm');
  const logoutBtn = document.getElementById('logoutBtn');
  const authError = document.getElementById('authError');

  // Check Session on Load
  checkSession();

  // Listen for Auth State Changes
  supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
      if (isLoginPage) {
        window.location.href = 'dashboard.html';
      }
    } else if (event === 'SIGNED_OUT') {
      if (!isLoginPage) {
        window.location.href = 'login.html';
      }
    }
  });

  async function checkSession() {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    
    if (session) {
      if (isLoginPage) {
        window.location.href = 'dashboard.html';
      }
    } else {
      if (!isLoginPage) {
        window.location.href = 'login.html';
      }
    }
  }

  // Handle Login
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Signing In...';
      authError.style.display = 'none';

      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        authError.textContent = error.message;
        authError.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Sign In';
      } else {
        window.location.href = 'dashboard.html';
      }
    });
  }

  // Handle Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await supabaseClient.auth.signOut();
      window.location.href = 'login.html';
    });
  }
});
