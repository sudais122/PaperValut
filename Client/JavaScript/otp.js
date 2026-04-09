 const API = 'http://localhost:5000/api';

  /* ── Restore email from session ── */
  const email  = sessionStorage.getItem('verify_email')  || '';
  const reason = sessionStorage.getItem('verify_reason') || 'register';
  document.getElementById('display-email').textContent = email || 'your email';

  /* ── OTP input wiring ── */
  const boxes = document.querySelectorAll('.otp-box');
  boxes.forEach((box, idx) => {
    box.addEventListener('input', () => {
      box.value = box.value.replace(/[^0-9]/g, '');
      box.classList.toggle('filled', !!box.value);
      if (box.value && idx < boxes.length - 1) boxes[idx + 1].focus();
    });
    box.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !box.value && idx > 0) {
        boxes[idx - 1].focus();
        boxes[idx - 1].classList.remove('filled');
      }
    });
    box.addEventListener('paste', e => {
      e.preventDefault();
      const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
      digits.split('').forEach((d, i) => {
        if (boxes[i]) { boxes[i].value = d; boxes[i].classList.add('filled'); }
      });
      const next = boxes[Math.min(digits.length, boxes.length - 1)];
      if (next) next.focus();
    });
  });

  /* ── Expiry countdown (10 min) ── */
  let expiryTimer;
  let resendTimer;

  function startExpiry(seconds = 600) {
    clearInterval(expiryTimer);
    const el = document.getElementById('timer-count');
    const txt = document.getElementById('timer-text');
    expiryTimer = setInterval(() => {
      seconds--;
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      el.textContent = `${m}:${s.toString().padStart(2,'0')}`;
      if (seconds <= 0) {
        clearInterval(expiryTimer);
        txt.innerHTML = '<span style="color:#E53E3E">Code expired — resend a new one</span>';
      }
    }, 1000);
  }

  function startResendCooldown(seconds = 30) {
    clearInterval(resendTimer);
    const btn = document.getElementById('resend-btn');
    btn.disabled = true;
    resendTimer = setInterval(() => {
      seconds--;
      btn.textContent = `Resend in ${seconds}s`;
      if (seconds <= 0) {
        clearInterval(resendTimer);
        btn.disabled    = false;
        btn.textContent = 'Resend code';
      }
    }, 1000);
  }

  startExpiry();
  startResendCooldown();

  /* ── alerts ── */
  function showErr(msg) {
    document.getElementById('error-msg').textContent = msg;
    document.getElementById('error-box').classList.add('show');
    document.getElementById('success-box').classList.remove('show');
    boxes.forEach(b => b.classList.add('error'));
    setTimeout(() => boxes.forEach(b => b.classList.remove('error')), 1200);
  }
  function showOk(msg) {
    document.getElementById('success-msg').textContent = msg;
    document.getElementById('success-box').classList.add('show');
    document.getElementById('error-box').classList.remove('show');
  }
  function clearAlerts() {
    document.getElementById('error-box').classList.remove('show');
    document.getElementById('success-box').classList.remove('show');
  }

  /* ── Verify ── */
  async function handleVerify() {
    clearAlerts();
    const code = [...boxes].map(b => b.value).join('');
    if (code.length < 6) return showErr('Please enter all 6 digits.');
    if (!email)          return showErr('Session expired — please register again.');

    const btn = document.getElementById('verify-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner"></i> Verifying…';

    try {
      const res  = await fetch(`${API}/auth/verify-otp`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, otp: code })
      });
      const data = await res.json();

      if (data.success) {
        clearInterval(expiryTimer);
        boxes.forEach(b => b.classList.add('success-box-input'));

        if (reason === 'register' && data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user',  JSON.stringify(data.user));
        }

        /* show success card */
        document.getElementById('main-card').style.display    = 'none';
        document.getElementById('success-card').classList.add('show');

        sessionStorage.removeItem('verify_email');
        sessionStorage.removeItem('verify_reason');

        setTimeout(() => {
          window.location.href = reason === 'forgot-password'
            ? '../Forgot Password/forgot.html?step=3'
            : '../Paper/paper.html';
        }, 2000);

      } else {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-shield-check"></i> Verify Email';
        showErr(data.message || 'Invalid or expired code. Try again.');
      }
    } catch {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-shield-check"></i> Verify Email';
      showErr('Cannot connect to server. Is it running?');
    }
  }

  /* ── Resend ── */
  async function handleResend() {
    if (!email) return showErr('Session expired — please register again.');
    clearAlerts();
    const btn = document.getElementById('resend-btn');
    btn.disabled    = true;
    btn.textContent = 'Sending…';

    try {
      const res  = await fetch(`${API}/auth/send-otp`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email })
      });
      const data = await res.json();

      if (data.success) {
        showOk('New code sent! Check your inbox.');
        boxes.forEach(b => { b.value = ''; b.classList.remove('filled','error'); });
        boxes[0].focus();
        startExpiry();
        startResendCooldown();
      } else {
        showErr(data.message || 'Could not resend. Try again.');
        btn.disabled    = false;
        btn.textContent = 'Resend code';
      }
    } catch {
      showErr('Cannot connect to server.');
      btn.disabled    = false;
      btn.textContent = 'Resend code';
    }
  }

  /* ── Auto-submit when all 6 filled ── */
  boxes[boxes.length - 1].addEventListener('input', () => {
    const code = [...boxes].map(b => b.value).join('');
    if (code.length === 6) setTimeout(handleVerify, 300);
  });

  /* ── Focus first box on load ── */
  window.addEventListener('load', () => boxes[0].focus());