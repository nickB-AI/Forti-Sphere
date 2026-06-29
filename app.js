const installBtn = document.getElementById('installBtn');
const installButtons = document.querySelectorAll('[data-install-trigger]');
const installNotice = document.getElementById('installNotice');
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');
const refreshBtn = document.getElementById('refreshBtn');
const themeToggle = document.getElementById('themeToggle');
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');
const loginForm = document.getElementById('loginForm');
const authMessage = document.getElementById('authMessage');
const resetForm = document.getElementById('resetForm');
const resetMessage = document.getElementById('resetMessage');
const toggleResetBtn = document.getElementById('toggleReset');
const dashboardWelcome = document.getElementById('dashboardWelcome');
const signOutBtn = document.getElementById('signOutBtn');
const signOutBtnInline = document.getElementById('signOutBtnInline');
const loginActionBtn = document.getElementById('loginActionBtn');
const settingsToggles = document.querySelectorAll('.settings-toggle');
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredPrompt = event;
  installButtons.forEach((button) => {
    button.hidden = false;
  });
  if (installNotice) installNotice.hidden = false;
});

window.addEventListener('appinstalled', () => {
  installButtons.forEach((button) => {
    button.hidden = true;
  });
  if (installNotice) installNotice.hidden = true;
});

const promptInstall = async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installButtons.forEach((button) => {
    button.hidden = true;
  });
  if (installNotice) installNotice.hidden = true;
};

installBtn?.addEventListener('click', promptInstall);
installButtons.forEach((button) => {
  if (button !== installBtn) button.addEventListener('click', promptInstall);
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(console.error);
  });
}

refreshBtn?.addEventListener('click', () => {
  window.location.reload();
});

menuToggle?.addEventListener('click', () => {
  mainNav?.classList.toggle('open');
});

themeToggle?.addEventListener('click', () => {
  document.body.classList.toggle('light-theme');
  const isLight = document.body.classList.contains('light-theme');
  themeToggle.textContent = isLight ? 'Switch to dark' : 'Toggle theme';
  localStorage.setItem('forti-sphere-theme', isLight ? 'light' : 'dark');
});

const savedTheme = localStorage.getItem('forti-sphere-theme');
if (savedTheme === 'light') {
  document.body.classList.add('light-theme');
  if (themeToggle) themeToggle.textContent = 'Switch to dark';
}

contactForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(contactForm);
  const data = Object.fromEntries(formData.entries());
  localStorage.setItem('forti-sphere-note', JSON.stringify(data));

  if (formMessage) {
    formMessage.textContent = `Saved for ${data.name || 'you'}.`;
  }
  contactForm.reset();
});

const savedNote = localStorage.getItem('forti-sphere-note');
if (savedNote && formMessage) {
  try {
    const parsed = JSON.parse(savedNote);
    formMessage.textContent = `Last note saved for ${parsed.name || 'you'}.`;
  } catch {
    formMessage.textContent = 'A note was saved locally in this browser.';
  }
}

function getStoredAuth() {
  try {
    return JSON.parse(localStorage.getItem('forti-sphere-auth') || 'null');
  } catch {
    return null;
  }
}

function isAuthenticated() {
  return Boolean(getStoredAuth()?.email);
}

function updateDashboardState() {
  const auth = getStoredAuth();
  const email = auth?.email;

  if (dashboardWelcome) {
    dashboardWelcome.textContent = email
      ? `Welcome back, ${email}. Your secure workspace is ready for review.`
      : 'Please sign in to unlock your protected workspace.';
  }

  if (loginActionBtn) {
    loginActionBtn.hidden = Boolean(email);
  }

  if (signOutBtnInline) {
    signOutBtnInline.hidden = !email;
  }

  if (signOutBtn) {
    signOutBtn.hidden = !email;
  }
}

loginForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const email = formData.get('email');
  const password = formData.get('password');

  if (!email || !password) {
    if (authMessage) authMessage.textContent = 'Please enter both email and password.';
    return;
  }

  localStorage.setItem('forti-sphere-auth', JSON.stringify({ email, password }));
  if (authMessage) authMessage.textContent = 'Signed in successfully.';
  setTimeout(() => {
    window.location.href = '/dashboard.html';
  }, 600);
});

resetForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(resetForm);
  const email = formData.get('resetEmail');

  if (!email) {
    if (resetMessage) resetMessage.textContent = 'Please provide an email address.';
    return;
  }

  localStorage.setItem('forti-sphere-reset', email);
  if (resetMessage) resetMessage.textContent = `Reset instructions were prepared for ${email}.`;
  resetForm.reset();
});

toggleResetBtn?.addEventListener('click', () => {
  if (resetForm) {
    resetForm.hidden = !resetForm.hidden;
  }
});

[signOutBtn, signOutBtnInline].forEach((button) => {
  button?.addEventListener('click', () => {
    localStorage.removeItem('forti-sphere-auth');
    updateDashboardState();
    if (window.location.pathname.includes('/dashboard.html')) {
      window.location.href = './login.html';
    }
  });
});

settingsToggles.forEach((toggle) => {
  const key = toggle.getAttribute('data-setting');
  const savedValue = localStorage.getItem(`forti-sphere-${key}`);
  if (savedValue !== null) {
    toggle.checked = savedValue === 'true';
  }

  toggle.addEventListener('change', () => {
    localStorage.setItem(`forti-sphere-${key}`, String(toggle.checked));
  });
});

if (window.location.pathname.includes('/dashboard.html')) {
  updateDashboardState();
  if (!isAuthenticated()) {
    if (dashboardWelcome) {
      dashboardWelcome.textContent = 'Please sign in to access the secure workspace.';
    }
  }
}

if (window.location.pathname.includes('/login.html')) {
  if (isAuthenticated()) {
    if (authMessage) authMessage.textContent = 'You are already signed in.';
    setTimeout(() => {
      window.location.href = './dashboard.html';
    }, 500);
  }
}
