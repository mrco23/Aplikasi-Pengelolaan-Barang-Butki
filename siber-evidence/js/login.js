document.addEventListener('DOMContentLoaded', () => {
  // Redirect jika sudah login
  const user = Auth.getUser();
  if (user) {
    window.location.href = user.role === 'Administrator' ? './admin/dashboard.html' : './petugas/dashboard.html';
    return;
  }

  const form = document.getElementById('login-form');
  const uInput = document.getElementById('username');
  const pInput = document.getElementById('password');
  const rInput = document.getElementById('remember');
  const errMsg = document.getElementById('error-msg');
  const errText = document.getElementById('error-text');
  
  const togglePass = document.getElementById('toggle-password');
  const btnDemo = document.getElementById('btn-demo');
  const btnForgot = document.getElementById('btn-forgot');

  // Toggle password visibility
  let showPass = false;
  togglePass.addEventListener('click', () => {
    showPass = !showPass;
    pInput.type = showPass ? 'text' : 'password';
    togglePass.innerHTML = `<i data-lucide="${showPass ? 'eye-off' : 'eye'}" width="15" height="15"></i>`;
    if (window.lucide) lucide.createIcons({ root: togglePass });
  });

  // Login Submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    errMsg.classList.add('hidden-el');
    
    const u = uInput.value.trim();
    const p = pInput.value;
    const r = rInput.checked;

    if (!u || !p) {
      errText.textContent = 'Nama pengguna dan kata sandi wajib diisi.';
      errMsg.classList.remove('hidden-el');
      return;
    }

    const res = Auth.login(u, p, r);
    if (res.ok) {
      Toaster.show('success', 'Login berhasil', 'Selamat datang, ' + res.user.nama);
      setTimeout(() => {
        window.location.href = res.user.role === 'Administrator' ? './admin/dashboard.html' : './petugas/dashboard.html';
      }, 500);
    } else {
      errText.textContent = res.msg;
      errMsg.classList.remove('hidden-el');
    }
  });

  // Demo Login (One-click)
  btnDemo.addEventListener('click', () => {
    const res = Auth.login('admin', 'demo123', true);
    if (res.ok) {
      Toaster.show('success', 'Login Demo', 'Masuk sebagai Administrator.');
      setTimeout(() => {
        window.location.href = './admin/dashboard.html';
      }, 500);
    }
  });

  // Forgot password demo
  btnForgot.addEventListener('click', () => {
    Toaster.show('info', 'Lupa kata sandi', 'Pada aplikasi nyata, hubungi administrator sistem. (demo)');
  });
});
