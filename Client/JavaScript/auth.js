 function togglePassword() {
    const input   = document.getElementById('l-password');
    const icon    = document.getElementById('eye-icon');
    const btn     = document.getElementById('eye-btn');
    const showing = input.type === 'text';

    input.type = showing ? 'password' : 'text';

    // Swap icon
    icon.className = showing ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash';

    // Swap tooltip
    btn.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
  }

  /* ── Form Submit ── */
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email    = document.getElementById('l-email').value;
    const password = document.getElementById('l-password').value;

    if (!email || !password) {
      alert("Fill all fields");
      return;
    }

    // API CALL HERE
    console.log("Login:", email, password);
  });

//   registtaion form code
  function togglePassword() {
    const input   = document.getElementById('r-password');
    const icon    = document.getElementById('eye-icon');
    const btn     = document.getElementById('eye-btn');
    const showing = input.type === 'text';

    input.type     = showing ? 'password' : 'text';
    icon.className = showing ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash';
    btn.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
  }

  /* ── Password Strength ── */
  function checkStrength(val) {
    const bar   = document.getElementById('strength-bar');
    const label = document.getElementById('strength-label');

    let score = 0;
    if (val.length >= 6)            score++;
    if (val.length >= 10)           score++;
    if (/[A-Z]/.test(val))          score++;
    if (/[0-9]/.test(val))          score++;
    if (/[^A-Za-z0-9]/.test(val))   score++;

    const levels = [
      { pct: '0%',   color: 'transparent', text: ''           },
      { pct: '25%',  color: '#E53E3E',     text: 'Weak'       },
      { pct: '50%',  color: '#ED8936',     text: 'Fair'       },
      { pct: '75%',  color: '#ECC94B',     text: 'Good'       },
      { pct: '90%',  color: '#48BB78',     text: 'Strong'     },
      { pct: '100%', color: '#1D9E75',     text: 'Very strong'},
    ];

    const lvl = val.length === 0 ? levels[0] : levels[Math.min(score, 5)];

    bar.style.width      = lvl.pct;
    bar.style.background = lvl.color;
    label.textContent    = lvl.text;
    label.style.color    = lvl.color;
  }

  /* ── Form Submit ── */
  document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const firstName  = document.getElementById('r-firstname').value.trim();
    const lastName   = document.getElementById('r-lastname').value.trim();
    const email      = document.getElementById('r-email').value.trim();
    const password   = document.getElementById('r-password').value;

    if (!firstName || !lastName || !email || !password) {
      alert("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

  });

//   forgot password
    //    STEP NAVIGATION
    function goToStep(n) {
        document.querySelectorAll('.step').forEach((s, i) => {
            s.classList.toggle('active', i + 1 === n);
        });
        // Update dots
        [1, 2, 3].forEach(i => {
            const dot = document.getElementById('dot-' + i);
            dot.classList.remove('active', 'done');
            if (i < n)  dot.classList.add('done');
            if (i === n) dot.classList.add('active');
        });
        hideAlerts();
    }

    //    ALERTS
    function showError(msg) {
        hideAlerts();
        document.getElementById('error-msg').textContent = msg;
        document.getElementById('error-box').classList.add('show');
    }
    function showSuccess(msg) {
        hideAlerts();
        document.getElementById('success-msg').textContent = msg;
        document.getElementById('success-box').classList.add('show');
    }
    function hideAlerts() {
        document.getElementById('error-box').classList.remove('show');
        document.getElementById('success-box').classList.remove('show');
    }

    /* ═══════════════════════════════════════
       STEP 1 — SEND CODE
    ═══════════════════════════════════════ */
    function sendCode() {
        const email = document.getElementById('fp-email').value.trim();
        if (!email) return showError('Please enter your email address.');
        if (!/\S+@\S+\.\S+/.test(email)) return showError('Please enter a valid email address.');

        const btn = document.getElementById('send-btn');
        btn.disabled = true; btn.classList.add('loading');

        // ── Replace with real API call ──
        setTimeout(() => {
            btn.disabled = false; btn.classList.remove('loading');
            document.getElementById('sent-to-email').textContent = email;
            showSuccess('Code sent! Check your inbox.');
            setTimeout(() => {
                goToStep(2);
                startCountdown();
                document.querySelector('.otp-box').focus();
            }, 1000);
        }, 1500);
    }

    /* OTP INPUT — auto-jump between boxes*/
    document.querySelectorAll('.otp-box').forEach((box, idx, boxes) => {
        box.addEventListener('input', () => {
            // Only allow digits
            box.value = box.value.replace(/[^0-9]/g, '');
            if (box.value && idx < boxes.length - 1) boxes[idx + 1].focus();
        });
        box.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !box.value && idx > 0) boxes[idx - 1].focus();
        });
        box.addEventListener('paste', (e) => {
            e.preventDefault();
            const digits = (e.clipboardData.getData('text')).replace(/\D/g, '').slice(0, 6);
            digits.split('').forEach((d, i) => { if (boxes[i]) boxes[i].value = d; });
            const next = boxes[Math.min(digits.length, boxes.length - 1)];
            if (next) next.focus();
        });
    });

    /* ═══════════════════════════════════════
       RESEND COUNTDOWN
    ═══════════════════════════════════════ */
    let countdownTimer;
    function startCountdown() {
        const btn  = document.getElementById('resend-btn');
        const span = document.getElementById('countdown');
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
                btn.disabled  = false;
                btn.textContent = 'Resend code';
            }
        }, 1000);
    }

    function resendCode() {
        const btn = document.getElementById('resend-btn');
        btn.disabled = true;
        // ── Replace with real API call ──
        setTimeout(() => {
            showSuccess('A new code has been sent!');
            startCountdown();
        }, 1000);
    }

    /* ═══════════════════════════════════════
       STEP 2 — VERIFY CODE
    ═══════════════════════════════════════ */
    function verifyCode() {
        const code = [...document.querySelectorAll('.otp-box')].map(b => b.value).join('');
        if (code.length < 6) return showError('Please enter the full 6-digit code.');

        const btn = document.getElementById('verify-btn');
        btn.disabled = true; btn.classList.add('loading');

        // ── Replace with real API call ──
        setTimeout(() => {
            btn.disabled = false; btn.classList.remove('loading');
            showSuccess('Code verified! Set your new password.');
            setTimeout(() => goToStep(3), 1000);
        }, 1400);
    }

    /* ═══════════════════════════════════════
       STEP 3 — RESET PASSWORD
    ═══════════════════════════════════════ */
    function resetPassword() {
        const newPass = document.getElementById('fp-newpass').value;
        const confirm = document.getElementById('fp-confirm').value;

        if (!newPass || !confirm) return showError('Please fill in both fields.');
        if (newPass.length < 6)   return showError('Password must be at least 6 characters.');
        if (newPass !== confirm)   return showError('Passwords do not match.');

        const btn = document.getElementById('reset-btn');
        btn.disabled = true; btn.classList.add('loading');

        // ── Replace with real API call ──
        setTimeout(() => {
            btn.disabled = false; btn.classList.remove('loading');
            showSuccess('Password reset! Redirecting to login…');
            setTimeout(() => window.location.href = 'login.html', 1800);
        }, 1500);
    }

    /* ═══════════════════════════════════════
       UTILITIES
    ═══════════════════════════════════════ */
    function toggleEye(inputId, iconId) {
        const input   = document.getElementById(inputId);
        const icon    = document.getElementById(iconId);
        const showing = input.type === 'text';
        input.type     = showing ? 'password' : 'text';
        icon.className = showing ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash';
    }

    function checkStrength(val) {
        const bar = document.getElementById('strength-bar');
        const lbl = document.getElementById('strength-label');
        let score = 0;
        if (val.length >= 6)           score++;
        if (val.length >= 10)          score++;
        if (/[A-Z]/.test(val))         score++;
        if (/[0-9]/.test(val))         score++;
        if (/[^A-Za-z0-9]/.test(val))  score++;

        const levels = [
            { pct: '0%',   color: 'transparent', text: ''            },
            { pct: '25%',  color: '#E53E3E',     text: 'Weak'        },
            { pct: '50%',  color: '#ED8936',     text: 'Fair'        },
            { pct: '75%',  color: '#ECC94B',     text: 'Good'        },
            { pct: '90%',  color: '#48BB78',     text: 'Strong'      },
            { pct: '100%', color: '#1D9E75',     text: 'Very strong' },
        ];
        const lvl = val.length === 0 ? levels[0] : levels[Math.min(score, 5)];
        bar.style.width      = lvl.pct;
        bar.style.background = lvl.color;
        lbl.textContent      = lvl.text;
        lbl.style.color      = lvl.color;
    }

    function checkMatch() {
        const pass    = document.getElementById('fp-newpass').value;
        const confirm = document.getElementById('fp-confirm').value;
        const label   = document.getElementById('match-label');
        const input   = document.getElementById('fp-confirm');

        if (!confirm) { label.textContent = ''; input.style.borderColor = ''; return; }

        if (pass === confirm) {
            label.textContent       = '✓ Passwords match';
            label.style.color       = '#1D9E75';
            input.style.borderColor = '#1D9E75';
        } else {
            label.textContent       = '✗ Passwords do not match';
            label.style.color       = '#E53E3E';
            input.style.borderColor = 'rgba(229,62,62,0.6)';
        }
    }