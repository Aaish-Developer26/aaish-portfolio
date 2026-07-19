document.addEventListener('DOMContentLoaded', () => {

  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const backToTop = document.getElementById('back-to-top');
  const navbarHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-height'), 10) || 72;

  // --- Mobile nav toggle ---
  navToggle.addEventListener('click', () => {
    const isActive = navMenu.classList.toggle('active');
    navToggle.classList.toggle('active', isActive);
    navToggle.setAttribute('aria-expanded', String(isActive));
  });

  // Close mobile menu when a nav link is clicked
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      navToggle.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // --- Smooth scroll for internal links ---
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // --- Navbar opacity + back-to-top visibility on scroll ---
  const handleScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    backToTop.classList.toggle('visible', window.scrollY > 400);
  };

  window.addEventListener('scroll', handleScroll);
  handleScroll();

  // --- Back to top ---
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // --- Scroll-triggered fade-in animations ---
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in-visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
  });

  document.querySelectorAll('.fade-in-hidden').forEach((el) => {
    fadeObserver.observe(el);
  });

  // --- Active nav link highlighting based on scroll position ---
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const id = entry.target.getAttribute('id');
      navLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    });
  }, {
    rootMargin: `-${navbarHeight}px 0px -60% 0px`,
    threshold: 0,
  });

  sections.forEach((section) => navObserver.observe(section));

  // --- Code terminal widget ---
  runTerminal();

  // --- Impact numbers counter ---
  animateImpactCounters();

});

/* === TERMINAL WIDGET START === */

function runTerminal() {
  const codeTerminal = document.getElementById('code-terminal');
  const runBtn = document.getElementById('terminal-run-btn');
  const statusbar = document.getElementById('terminal-statusbar');
  const statusIcon = document.getElementById('terminal-status-icon');
  const statusText = document.getElementById('terminal-status-text');
  const output = document.getElementById('terminal-output');
  const outputContent = document.getElementById('terminal-output-content');

  if (!codeTerminal || !runBtn || !output || !outputContent) return;

  const TYPE_DELAY = 18;
  const RUN_DELAY = 600;

  const outputLines = [
    { text: '> Executing portfolio.py...', className: 'out-cmd' },
    { text: '', className: '' },
    { text: "Hello! I'm Aaish Faisal Hameedi 👋", className: 'out-name' },
    { text: '─────────────────────────────────', className: 'out-sep' },
    { text: '', className: '' },
    { text: 'AI Engineer with 3+ years shipping production-grade AI —', className: 'out-detail' },
    { text: 'Graph-RAG pipelines, LLMs, and computer vision systems', className: 'out-detail' },
    { text: 'that actually work outside of Jupyter notebooks. 🎯', className: 'out-detail' },
    { text: '', className: '' },
    { text: ' 📍  Karachi, Pakistan', className: 'out-detail' },
    { text: ' 💼  AI Engineer @ Appedology Pvt. Ltd', className: 'out-detail' },
    { text: ' 🎓  MS AI @ FAST-NUCES  (In Progress)', className: 'out-detail' },
    { text: '', className: '' },
    { text: '> No hallucinations detected in this portfolio.', className: 'out-cmd' },
    { text: '> Status: Open to Gulf & Pakistan opportunities', className: 'out-cmd' },
    { text: '> Exit code: 0  ✓', className: 'out-cmd' },
  ];

  let timers = [];

  const clearTimers = () => {
    timers.forEach((id) => clearTimeout(id));
    timers = [];
  };

  const setStatus = (state) => {
    statusbar.classList.remove('is-ready', 'is-running', 'is-done');
    statusbar.classList.add(`is-${state}`);

    if (state === 'ready') {
      statusIcon.textContent = '●';
      statusText.textContent = 'Ready';
    } else if (state === 'running') {
      statusIcon.textContent = '⟳';
      statusText.textContent = 'Running portfolio.py...';
    } else if (state === 'done') {
      statusIcon.textContent = '✓';
      statusText.textContent = 'Completed in 0.42s';
    }
  };

  const addResetLink = () => {
    if (document.getElementById('terminal-reset-link')) return;

    const resetLink = document.createElement('a');
    resetLink.id = 'terminal-reset-link';
    resetLink.href = '#';
    resetLink.className = 'terminal-reset-link';
    resetLink.textContent = 'Reset';
    resetLink.addEventListener('click', (e) => {
      e.preventDefault();
      resetTerminal();
    });

    runBtn.insertAdjacentElement('afterend', resetLink);
  };

  const removeResetLink = () => {
    const resetLink = document.getElementById('terminal-reset-link');
    if (resetLink) resetLink.remove();
  };

  const typeLine = (lineIndex, charIndex, lineEl) => {
    if (lineIndex >= outputLines.length) {
      setStatus('done');
      runBtn.classList.add('is-done');
      runBtn.innerHTML = '<i class="fa-solid fa-check" aria-hidden="true"></i> Done';
      codeTerminal.classList.remove('is-running');
      codeTerminal.classList.add('is-done');
      addResetLink();
      return;
    }

    const line = outputLines[lineIndex];

    if (charIndex === 0) {
      lineEl = document.createElement('div');
      lineEl.className = `terminal-output-line${line.className ? ` ${line.className}` : ''}`;
      outputContent.appendChild(lineEl);

      if (line.text === '') {
        timers.push(setTimeout(() => typeLine(lineIndex + 1, 0, null), TYPE_DELAY));
        return;
      }
    }

    lineEl.textContent += line.text[charIndex];

    const advance = (charIndex + 1 < line.text.length)
      ? () => typeLine(lineIndex, charIndex + 1, lineEl)
      : () => typeLine(lineIndex + 1, 0, null);

    timers.push(setTimeout(advance, TYPE_DELAY));
  };

  const startRun = () => {
    runBtn.disabled = true;
    runBtn.innerHTML = '<i class="fa-solid fa-arrows-rotate fa-spin" aria-hidden="true"></i> Running...';
    codeTerminal.classList.add('is-running');
    setStatus('running');

    timers.push(setTimeout(() => {
      outputContent.innerHTML = '';
      output.classList.add('visible');
      typeLine(0, 0, null);
    }, RUN_DELAY));
  };

  const resetTerminal = () => {
    clearTimers();
    removeResetLink();

    codeTerminal.classList.remove('is-running', 'is-done');
    output.classList.remove('visible');
    outputContent.innerHTML = '';

    runBtn.disabled = false;
    runBtn.classList.remove('is-done');
    runBtn.innerHTML = '<i class="fa-solid fa-play" aria-hidden="true"></i> Run';

    setStatus('ready');
  };

  runBtn.addEventListener('click', startRun);
}

/* === TERMINAL WIDGET END === */

/* === CHANGE 4: IMPACT COUNTER ANIMATION === */

function animateImpactCounters() {
  const impactSection = document.getElementById('impact');
  if (!impactSection) return;

  const numbers = impactSection.querySelectorAll('.impact-number');
  const DURATION = 1800;
  let counted = false;

  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  const runCounters = () => {
    if (counted) return;
    counted = true;

    numbers.forEach((el) => {
      const target = parseInt(el.getAttribute('data-target'), 10) || 0;
      const startTime = performance.now();

      const step = (now) => {
        const progress = Math.min((now - startTime) / DURATION, 1);
        const value = Math.round(target * easeOut(progress));
        el.textContent = String(value);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = String(target);
        }
      };

      requestAnimationFrame(step);
    });
  };

  const impactObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        runCounters();
        impactObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.3,
  });

  impactObserver.observe(impactSection);
}

/* === CHANGE 4: END === */
