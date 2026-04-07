  const reveals = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.12 });
  reveals.forEach(el => obs.observe(el));

  // Navbar shrink on scroll
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });

  // Hamburger
  const ham = document.querySelector('.nav-hamburger');
  const links = document.querySelector('.nav-links');
  ham.addEventListener('click', () => links.classList.toggle('open'));