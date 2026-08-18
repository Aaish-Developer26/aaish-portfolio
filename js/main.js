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

  // --- Neural network canvas + 3D card tilt ---
  initNeuralNetwork();
  initCardTilt();

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

/* === SESSION B: NEURAL NETWORK CANVAS === */

function initNeuralNetwork() {
  const canvas = document.getElementById('neural-canvas');
  if (!canvas) return;

  // Disable on mobile/touch for performance
  if (window.innerWidth < 768) return;

  const ctx = canvas.getContext('2d');
  let nodes = [];
  let animationId = null;
  let isVisible = true;

  const CONFIG = {
    nodeCount: 55,
    maxDistance: 148,
    nodeRadius: 2.2,
    nodeSpeed: 0.38,
    nodeColor: '0, 168, 255',
    lineColor: '0, 168, 255',
    nodeOpacityMin: 0.35,
    nodeOpacityMax: 0.85,
    pulseSpeed: 0.008,
  };

  function resizeCanvas() {
    const hero = canvas.parentElement;
    canvas.width = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
  }

  function createNode() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * CONFIG.nodeSpeed,
      vy: (Math.random() - 0.5) * CONFIG.nodeSpeed,
      radius: CONFIG.nodeRadius + Math.random() * 1.2,
      opacity: CONFIG.nodeOpacityMin +
               Math.random() * (CONFIG.nodeOpacityMax - CONFIG.nodeOpacityMin),
      pulseOffset: Math.random() * Math.PI * 2,
    };
  }

  function initNodes() {
    nodes = [];
    for (let i = 0; i < CONFIG.nodeCount; i++) {
      nodes.push(createNode());
    }
  }

  function updateNodes() {
    nodes.forEach(node => {
      node.x += node.vx;
      node.y += node.vy;
      node.pulseOffset += CONFIG.pulseSpeed;

      // Bounce off edges with padding
      const pad = 20;
      if (node.x < pad || node.x > canvas.width - pad) {
        node.vx *= -1;
        node.x = Math.max(pad, Math.min(canvas.width - pad, node.x));
      }
      if (node.y < pad || node.y > canvas.height - pad) {
        node.vy *= -1;
        node.y = Math.max(pad, Math.min(canvas.height - pad, node.y));
      }
    });
  }

  function drawFrame() {
    if (!isVisible) {
      animationId = requestAnimationFrame(drawFrame);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connecting lines first (below nodes)
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONFIG.maxDistance) {
          const lineOpacity = (1 - dist / CONFIG.maxDistance) * 0.35;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(${CONFIG.lineColor}, ${lineOpacity})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    nodes.forEach(node => {
      const pulse = Math.sin(node.pulseOffset) * 0.2;
      const currentOpacity = Math.min(
        CONFIG.nodeOpacityMax,
        node.opacity + pulse
      );

      // Outer glow
      const gradient = ctx.createRadialGradient(
        node.x, node.y, 0,
        node.x, node.y, node.radius * 3.5
      );
      gradient.addColorStop(0, `rgba(${CONFIG.nodeColor}, ${currentOpacity})`);
      gradient.addColorStop(1, `rgba(${CONFIG.nodeColor}, 0)`);

      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius * 3.5, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Core dot
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${CONFIG.nodeColor}, ${currentOpacity})`;
      ctx.fill();
    });

    updateNodes();
    animationId = requestAnimationFrame(drawFrame);
  }

  // Pause when tab not visible (battery/performance)
  document.addEventListener('visibilitychange', () => {
    isVisible = !document.hidden;
  });

  // Resize handler with debounce
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.innerWidth < 768) {
        canvas.style.display = 'none';
        if (animationId) cancelAnimationFrame(animationId);
        return;
      }
      canvas.style.display = '';
      resizeCanvas();
      initNodes();
    }, 200);
  });

  // Start
  resizeCanvas();
  initNodes();
  animationId = requestAnimationFrame(drawFrame);
}

/* === SESSION B: NEURAL NETWORK CANVAS END === */

/* === SESSION B: 3D CARD TILT === */

function initCardTilt() {
  // Only run on devices with a real hover/mouse
  if (window.matchMedia('(hover: none)').matches) return;

  // Real tiltable card classes found in index.html:
  // project cards (.project-card) and skill cards (.skill-card)
  const TILT_SELECTORS = ['.project-card', '.skill-card'];

  const MAX_TILT = 7;      // degrees max rotation
  const SCALE_HOVER = 1.015; // very subtle lift

  function applyTilt(card, e) {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -MAX_TILT;
    const rotY = ((x - centerX) / centerX) * MAX_TILT;

    card.style.transform =
      `perspective(900px) rotateX(${rotX}deg) ` +
      `rotateY(${rotY}deg) scale(${SCALE_HOVER})`;

    // Update sheen position via CSS custom properties
    card.style.setProperty('--sheen-x', `${x}px`);
    card.style.setProperty('--sheen-y', `${y}px`);

    card.classList.add('tilt-active');
    card.classList.remove('tilt-reset');
  }

  function resetTilt(card) {
    card.classList.add('tilt-reset');
    card.classList.remove('tilt-active');
    card.style.transform = '';
    // Clean up transition-reset class after it finishes
    setTimeout(() => {
      card.classList.remove('tilt-reset');
    }, 500);
  }

  // Find all matching cards
  const allCards = [];
  TILT_SELECTORS.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      if (!allCards.includes(el)) allCards.push(el);
    });
  });

  allCards.forEach(card => {
    card.addEventListener('mousemove', (e) => applyTilt(card, e));
    card.addEventListener('mouseleave', () => resetTilt(card));
    card.addEventListener('mouseenter', (e) => applyTilt(card, e));
  });
}

/* === SESSION B: 3D CARD TILT END === */
