// Admin Authentication Logic

document.addEventListener('DOMContentLoaded', () => {
  // Check if we are on the login page or a protected admin page
  const isLoginPage = window.location.pathname.endsWith('login.html');
  const loginForm = document.getElementById('loginForm');
  const logoutBtn = document.getElementById('logoutBtn');
  const authError = document.getElementById('authError');

  // Inject Mobile Navigation Toggle if admin-layout and admin-sidebar exist
  const adminLayout = document.querySelector('.admin-layout');
  const adminSidebar = document.querySelector('.admin-sidebar');
  if (adminLayout && adminSidebar) {
    setupMobileNav(adminLayout, adminSidebar);
  }

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

  function setupMobileNav(layout, sidebar) {
    if (document.querySelector('.mobile-topbar')) return;

    // Create Mobile Topbar
    const topbar = document.createElement('div');
    topbar.className = 'mobile-topbar';
    topbar.innerHTML = `
      <a href="dashboard.html" class="mobile-brand">
        <img src="../Favicon.png" alt="Logo">
        <span>Admin Portal</span>
      </a>
      <button class="mobile-nav-toggle" id="mobileNavToggle" aria-label="Toggle Menu">
        <i class="fas fa-bars"></i>
      </button>
    `;

    // Create Overlay
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';

    layout.parentNode.insertBefore(topbar, layout);
    document.body.appendChild(overlay);

    const toggleBtn = document.getElementById('mobileNavToggle');

    function openSidebar() {
      sidebar.classList.add('sidebar-open');
      overlay.classList.add('active');
    }

    function closeSidebar() {
      sidebar.classList.remove('sidebar-open');
      overlay.classList.remove('active');
    }

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (sidebar.classList.contains('sidebar-open')) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });

    overlay.addEventListener('click', closeSidebar);

    // Close sidebar when navigating
    sidebar.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeSidebar);
    });
  }
});

