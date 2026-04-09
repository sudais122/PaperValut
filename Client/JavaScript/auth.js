/* PaperVault — Client/JavaScript/auth.js
   Place this file in:  Client/JavaScript/auth.js
   It handles: Login · Register · Forgot Password */

const API = 'http://localhost:5000/api';   // ← your backend URL


/* SHARED HELPER — toast notification
   (replaces alert() calls everywhere) */
function showToast(msg, type = 'success') {
  let t = document.getElementById('_toast');
  if (!t) {
    t = document.createElement('div');
    t.id = '_toast';
    t.style.cssText = [
      'position:fixed','bottom:26px','right:26px','z-index:9999',
      'padding:11px 18px','border-radius:10px','font-size:.85rem',
      'font-family:"DM Sans",sans-serif','font-weight:500',
      'display:flex','align-items:center','gap:8px',
      'opacity:0','transform:translateY(8px)',
      'transition:opacity .3s,transform .3s',
      'max-width:300px','pointer-events:none'
    ].join(';');
    document.body.appendChild(t);
  }
  const colors = { success:'#1D9E75', error:'#E53E3E', warn:'#E6A817' };
  const icons  = { success:'check-circle', error:'times-circle', warn:'exclamation-circle' };
  t.style.background = colors[type] || colors.success;
  t.style.color      = '#fff';
  t.innerHTML        = `<i class="fas fa-${icons[type]||icons.success}"></i> ${msg}`;
  t.style.opacity    = '1';
  t.style.transform  = 'translateY(0)';
  clearTimeout(t._t);
  t._t = setTimeout(() => {
    t.style.opacity   = '0';
    t.style.transform = 'translateY(8px)';
  }, 3500);
}

/* SHARED HELPER — button loading state */
function setBtnLoading(btn, loading) {
  if (!btn) return;
  if (loading) {
    btn._orig    = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Please wait…';
  } else {
    btn.disabled = false;
    btn.innerHTML = btn._orig || 'Submit';
  }
}


/* LOGIN FORM
   HTML file: Client/Login/login.html
   Include:   <script src="../JavaScript/auth.js"></script> */

/* your original togglePassword — unchanged */
function togglePassword() {
  const input   = document.getElementById('l-password');
  const icon    = document.getElementById('eye-icon');
  const btn     = document.getElementById('eye-btn');
  const showing = input.type === 'text';

  input.type = showing ? 'password' : 'text';
  icon.className = showing ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash';
  btn.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
}

document.addEventListener('DOMContentLoaded', () => {

  /* ── LOGIN submit ── */
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email    = document.getElementById('l-email').value.trim();
      const password = document.getElementById('l-password').value;
      const btn      = loginForm.querySelector('[type="submit"]');

      if (!email || !password) {
        showToast('Please fill in all fields', 'error');
        return;
      }

      setBtnLoading(btn, true);

      try {
        const res  = await fetch(`${API}/auth/login`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (data.success) {
          /* save token + user for later use across the site */
          localStorage.setItem('pv_token', data.token);
          localStorage.setItem('pv_user',  JSON.stringify(data.user));
          showToast('Welcome back, ' + data.user.name + '!');
          setTimeout(() => {
            window.location.href = '../Paper/paper.html';
          }, 1000);

        } else if (data.needsVerify) {
          /* account exists but email not verified yet */
          sessionStorage.setItem('verify_email',  data.email);
          sessionStorage.setItem('verify_reason', 'register');
          showToast('Please verify your email first.', 'warn');
          setTimeout(() => {
            window.location.href = '../Register/verify-otp.html';
          }, 1200);

        } else {
          showToast(data.message || 'Login failed.', 'error');
        }

      } catch (err) {
        showToast('Cannot reach server. Make sure it is running.', 'error');
      } finally {
        setBtnLoading(btn, false);
      }
    });
  }

  /* ── REGISTER submit (also inside DOMContentLoaded) ── */
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const firstName = document.getElementById('r-firstname').value.trim();
      const lastName  = document.getElementById('r-lastname').value.trim();
      const email     = document.getElementById('r-email').value.trim();
      const password  = document.getElementById('r-password').value;
      const btn       = registerForm.querySelector('[type="submit"]');

      if (!firstName || !lastName || !email || !password) {
        showToast('Please fill in all fields', 'error');
        return;
      }
      if (password.length < 8) {
        showToast('Password must be at least 8 characters', 'error');
        return;
      }

      setBtnLoading(btn, true);

      try {
        /* ── Step 1: create account ── */
        const res  = await fetch(`${API}/auth/register`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            name:  firstName + ' ' + lastName,
            email,
            password
          })
        });
        const data = await res.json();

        if (!data.success) {
          showToast(data.message || 'Registration failed.', 'error');
          setBtnLoading(btn, false);
          return;
        }

        /* ── Step 2: send OTP to their email ── */
        const otpRes  = await fetch(`${API}/auth/send-otp`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ email, reason: 'register' })
        });
        const otpData = await otpRes.json();

        /* save email so verify-otp.html knows who to verify */
        sessionStorage.setItem('verify_email',  email);
        sessionStorage.setItem('verify_reason', 'register');

        if (otpData.success) {
          showToast('Account created! Check your email for the OTP.');
          setTimeout(() => {
            window.location.href = '../Register/verify-otp.html';
          }, 1200);
        } else {
          /* account created but OTP email failed — still redirect */
          showToast('Account created. OTP send failed — try resending.', 'warn');
          setTimeout(() => {
            window.location.href = '../Register/verify-otp.html';
          }, 2000);
        }

      } catch (err) {
        showToast('Cannot reach server. Make sure it is running.', 'error');
      } finally {
        setBtnLoading(btn, false);
      }
    });
  }

});  /* end DOMContentLoaded */


/* REGISTER — password toggle & strength
   your original functions — unchanged */

/* overloaded togglePassword — handles register inputs */
function togglePassword(inputId, iconId, btnId) {
  const input   = document.getElementById(inputId);
  const icon    = document.getElementById(iconId);
  const btn     = document.getElementById(btnId);
  const showing = input.type === 'text';
  input.type    = showing ? 'password' : 'text';
  icon.className = showing ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash';
  if (btn) btn.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
}

function checkStrength(val) {
  const bar   = document.getElementById('strength-bar');
  const label = document.getElementById('strength-label');
  let score = 0;
  if (val.length >= 6)           score++;
  if (val.length >= 10)          score++;
  if (/[A-Z]/.test(val))         score++;
  if (/[0-9]/.test(val))         score++;
  if (/[^A-Za-z0-9]/.test(val))  score++;
  const levels = [
    { pct:'0%',   color:'transparent', text:''            },
    { pct:'25%',  color:'#E53E3E',     text:'Weak'        },
    { pct:'50%',  color:'#ED8936',     text:'Fair'        },
    { pct:'75%',  color:'#ECC94B',     text:'Good'        },
    { pct:'90%',  color:'#48BB78',     text:'Strong'      },
    { pct:'100%', color:'#1D9E75',     text:'Very strong' },
  ];
  const lvl = val.length === 0 ? levels[0] : levels[Math.min(score, 5)];
  if (bar)   { bar.style.width = lvl.pct; bar.style.background = lvl.color; }
  if (label) { label.textContent = lvl.text; label.style.color = lvl.color; }
}


/* FORGOT PASSWORD
   HTML file: Client/Forgot Password/forgot.html
   Include:   <script src="../JavaScript/auth.js"></script> */

/* your original goToStep — unchanged */
function goToStep(n) {
  document.querySelectorAll('.step').forEach((s, i) => {
    s.classList.toggle('active', i + 1 === n);
  });
  [1, 2, 3].forEach(i => {
    const dot = document.getElementById('dot-' + i);
    if (!dot) return;
    dot.classList.remove('active', 'done');
    if (i < n)   dot.classList.add('done');
    if (i === n) dot.classList.add('active');
  });
  hideAlerts();
}

/* your original alert helpers — unchanged */
function showError(msg) {
  hideAlerts();
  const box = document.getElementById('error-box');
  const txt = document.getElementById('error-msg');
  if (box && txt) { txt.textContent = msg; box.classList.add('show'); }
}
function showSuccess(msg) {
  hideAlerts();
  const box = document.getElementById('success-box');
  const txt = document.getElementById('success-msg');
  if (box && txt) { txt.textContent = msg; box.classList.add('show'); }
}
function hideAlerts() {
  document.getElementById('error-box')  ?.classList.remove('show');
  document.getElementById('success-box')?.classList.remove('show');
}


/* ── STEP 1: Send OTP ──
   was: setTimeout fake
   now: real POST /api/auth/send-otp
*/
async function sendCode() {
  const email = document.getElementById('fp-email').value.trim();
  if (!email)                        return showError('Please enter your email address.');
  if (!/\S+@\S+\.\S+/.test(email))   return showError('Please enter a valid email address.');

  const btn = document.getElementById('send-btn');
  setBtnLoading(btn, true);

  try {
    const res  = await fetch(`${API}/auth/send-otp`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, reason: 'forgot-password' })
    });
    const data = await res.json();

    if (data.success) {
      /* save so step 2 & 3 know the email */
      sessionStorage.setItem('verify_email',  email);
      sessionStorage.setItem('verify_reason', 'forgot-password');

      const el = document.getElementById('sent-to-email');
      if (el) el.textContent = email;

      showSuccess('Code sent! Check your inbox.');
      setTimeout(() => {
        goToStep(2);
        startCountdown();
        document.querySelector('.otp-box')?.focus();
      }, 1000);

    } else {
      showError(data.message || 'No account found with that email.');
    }

  } catch (err) {
    showError('Cannot reach server. Make sure it is running.');
  } finally {
    setBtnLoading(btn, false);
  }
}


/* ── OTP INPUT auto-jump — your original code, unchanged ── */
document.querySelectorAll('.otp-box').forEach((box, idx, boxes) => {
  box.addEventListener('input', () => {
    box.value = box.value.replace(/[^0-9]/g, '');
    if (box.value && idx < boxes.length - 1) boxes[idx + 1].focus();
  });
  box.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && !box.value && idx > 0) boxes[idx - 1].focus();
  });
  box.addEventListener('paste', (e) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    digits.split('').forEach((d, i) => { if (boxes[i]) boxes[i].value = d; });
    const next = boxes[Math.min(digits.length, boxes.length - 1)];
    if (next) next.focus();
  });
});


/* ── RESEND COUNTDOWN — your original code, unchanged ── */
let countdownTimer;
function startCountdown() {
  const btn  = document.getElementById('resend-btn');
  if (!btn) return;
  let secs   = 30;
  btn.disabled  = true;
  btn.innerHTML = 'Resend in <span id="countdown">' + secs + '</span>s';
  clearInterval(countdownTimer);
  countdownTimer = setInterval(() => {
    secs--;
    const el = document.getElementById('countdown');
    if (el) el.textContent = secs;
    if (secs <= 0) {
      clearInterval(countdownTimer);
      btn.disabled    = false;
      btn.textContent = 'Resend code';
    }
  }, 1000);
}

/* ── RESEND OTP ──
   was: setTimeout fake
   now: real POST /api/auth/send-otp
*/
async function resendCode() {
  const email = sessionStorage.getItem('verify_email')
             || document.getElementById('fp-email')?.value.trim();

  if (!email) return showError('Session expired. Go back to step 1.');

  const btn = document.getElementById('resend-btn');
  setBtnLoading(btn, true);

  try {
    const res  = await fetch(`${API}/auth/send-otp`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, reason: sessionStorage.getItem('verify_reason') || 'forgot-password' })
    });
    const data = await res.json();

    if (data.success) {
      showSuccess('A new code has been sent!');
      startCountdown();
    } else {
      showError(data.message || 'Failed to resend. Try again.');
      setBtnLoading(btn, false);
    }

  } catch {
    showError('Cannot reach server.');
    setBtnLoading(btn, false);
  }
}


/* ── STEP 2: Verify OTP ──
   was: setTimeout fake
   now: real POST /api/auth/verify-otp
*/
async function verifyCode() {
  const code = [...document.querySelectorAll('.otp-box')].map(b => b.value).join('');
  if (code.length < 6) return showError('Please enter the full 6-digit code.');

  const email  = sessionStorage.getItem('verify_email');
  const reason = sessionStorage.getItem('verify_reason');
  if (!email)  return showError('Session expired. Please start over.');

  const btn = document.getElementById('verify-btn');
  setBtnLoading(btn, true);

  try {
    const res  = await fetch(`${API}/auth/verify-otp`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, otp: code })
    });
    const data = await res.json();

    if (data.success) {
      if (reason === 'forgot-password') {
        showSuccess('Code verified! Set your new password.');
        setTimeout(() => goToStep(3), 1000);
      } else {
        /* registration verify — save token and redirect */
        if (data.token) {
          localStorage.setItem('pv_token', data.token);
          localStorage.setItem('pv_user',  JSON.stringify(data.user));
        }
        showSuccess('Email verified! Redirecting…');
        sessionStorage.removeItem('verify_email');
        sessionStorage.removeItem('verify_reason');
        setTimeout(() => window.location.href = '../Paper/paper.html', 1200);
      }
    } else {
      showError(data.message || 'Invalid or expired code. Try again.');
    }

  } catch {
    showError('Cannot reach server.');
  } finally {
    setBtnLoading(btn, false);
  }
}


/* ── STEP 3: Reset Password ──
   was: setTimeout fake
   now: real POST /api/auth/reset-password
*/
async function resetPassword() {
  const newPass = document.getElementById('fp-newpass').value;
  const confirm = document.getElementById('fp-confirm').value;
  const email   = sessionStorage.getItem('verify_email');

  if (!newPass || !confirm)  return showError('Please fill in both fields.');
  if (newPass.length < 8)    return showError('Password must be at least 8 characters.');
  if (newPass !== confirm)    return showError('Passwords do not match.');
  if (!email)                 return showError('Session expired. Please start over.');

  const btn = document.getElementById('reset-btn');
  setBtnLoading(btn, true);

  try {
    const res  = await fetch(`${API}/auth/reset-password`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, newPassword: newPass })
    });
    const data = await res.json();

    if (data.success) {
      sessionStorage.removeItem('verify_email');
      sessionStorage.removeItem('verify_reason');
      showSuccess('Password reset! Redirecting to login…');
      setTimeout(() => window.location.href = '../Login/login.html', 1800);
    } else {
      showError(data.message || 'Reset failed. Please try again.');
    }

  } catch {
    showError('Cannot reach server.');
  } finally {
    setBtnLoading(btn, false);
  }
}


/* ── UTILITIES — your originals, unchanged ── */
function toggleEye(inputId, iconId) {
  const input   = document.getElementById(inputId);
  const icon    = document.getElementById(iconId);
  const showing = input.type === 'text';
  input.type    = showing ? 'password' : 'text';
  icon.className = showing ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash';
}

function checkMatch() {
  const pass    = document.getElementById('fp-newpass')?.value;
  const confirm = document.getElementById('fp-confirm')?.value;
  const label   = document.getElementById('match-label');
  const input   = document.getElementById('fp-confirm');
  if (!label || !confirm) return;
  if (!confirm) { label.textContent = ''; if(input) input.style.borderColor = ''; return; }
  if (pass === confirm) {
    label.textContent       = '✓ Passwords match';
    label.style.color       = '#1D9E75';
    if(input) input.style.borderColor = '#1D9E75';
  } else {
    label.textContent       = '✗ Passwords do not match';
    label.style.color       = '#E53E3E';
    if(input) input.style.borderColor = 'rgba(229,62,62,0.6)';
  }
}