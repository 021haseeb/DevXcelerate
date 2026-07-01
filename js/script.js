/* DevXcelerate — premium UI interactions */

(function(){
  const $ = (sel, parent=document) => parent.querySelector(sel);
  const $$ = (sel, parent=document) => Array.from(parent.querySelectorAll(sel));

  // Year in footer
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Header scroll effect
  const header = $('.header');
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  // Mobile nav
  const menuBtn = $('#menuBtn');
  const navLinks = $('#navLinks');
  const setExpanded = (expanded) => {
    if (!menuBtn || !navLinks) return;
    menuBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    navLinks.classList.toggle('show', expanded);
  };

  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      const expanded = menuBtn.getAttribute('aria-expanded') !== 'true';
      setExpanded(expanded);
    });

    // Close on link click
    $$('#navLinks a').forEach(a => {
      a.addEventListener('click', () => setExpanded(false));
    });

    // Close on escape
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setExpanded(false);
    });
  }

  // Scroll spy active nav
  const sections = [
    '#home','#services','#about','#work','#technology','#team','#contact'
  ].map(id => $(id)).filter(Boolean);

  const setActiveById = (id) => {
    if (!navLinks) return;
    $$('#navLinks a').forEach(a => {
      const href = a.getAttribute('href');
      a.classList.toggle('active', href === id);
    });
  };

  if (sections.length && navLinks) {
    const obs = new IntersectionObserver((entries) => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a,b) => (b.intersectionRatio - a.intersectionRatio))[0];
      if (!visible) return;
      setActiveById('#' + visible.target.id);
    }, { threshold: [0.15, 0.25, 0.35] });

    sections.forEach(s => obs.observe(s));
  }

  // Reveal animations
  const revealEls = $('[data-reveal]') ? $$('[data-reveal]') : [];
  if (revealEls.length) {
    const rObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-in');
          rObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealEls.forEach(el => rObs.observe(el));
  }

  // Count up (simple)
  const countupEls = $$('[data-countup]');
  const startCountUp = (el) => {
    if (!el) return;
    const span = $('.count', el);
    if (!span) return;
    const targetText = (span.textContent || '').replace(/[+]/g,'').trim();
    const target = Math.max(0, Number(targetText) || 0);
    const duration = 900;
    const start = performance.now();

    const step = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const value = Math.floor(target * (0.1 + 0.9 * p));
      span.textContent = String(value);
      if (p < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  if (countupEls.length) {
    const cObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          startCountUp(e.target);
          cObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.35 });

    countupEls.forEach(el => cObs.observe(el));
  }

  // Contact form validation
  const form = $('#contactForm');
  if (form) {
    const nameInput = $('#name');
    const emailInput = $('#email');
    const messageInput = $('#message');

    const setError = (field, msg) => {
      const err = $$('[data-error-for="'+field+'"]').shift();
      if (err) err.textContent = msg || '';
    };

    const clearError = () => {
      ['name','email','message'].forEach(k => setError(k,'') );
    };

    const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());

    const validate = () => {
      clearError();
      let ok = true;

      const nameVal = (nameInput?.value || '').trim();
      const emailVal = (emailInput?.value || '').trim();
      const msgVal = (messageInput?.value || '').trim();

      if (!nameVal || nameVal.length < 2) {
        setError('name', 'Please enter your name.');
        ok = false;
      }

      if (!emailVal || !isValidEmail(emailVal)) {
        setError('email', 'Enter a valid email address.');
        ok = false;
      }

      if (!msgVal || msgVal.length < 10) {
        setError('message', 'Message should be at least 10 characters.');
        ok = false;
      }

      return ok;
    };

    // Live validation
    [nameInput, emailInput, messageInput].filter(Boolean).forEach(inp => {
      inp.addEventListener('input', () => validate());
      inp.addEventListener('blur', () => validate());
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const ok = validate();
      if (!ok) return;

      const btn = form.querySelector('button[type="submit"]');
      const original = btn ? btn.innerHTML : null;
      if (btn) {
        btn.disabled = true;
        btn.style.opacity = '0.7';
        btn.innerHTML = 'Sending...';
      }

      // EmailJS sending (no backend). Uses your form fields: name, email, message.

      // Credentials: paste your EmailJS values here.
      // IMPORTANT:
      // - PUBLIC_KEY MUST be a real EmailJS Public Key (not 'PUBLIC_KEY')
      // - SERVICE_ID MUST be your EmailJS Email Service ID
      // - TEMPLATE_ID MUST be your EmailJS Email Template ID
      const PUBLIC_KEY = 'MaCbgjeDe0_LIRzGI';
      const SERVICE_ID = 'service_2bc7jqe';
      const TEMPLATE_ID = 'template_8h2vtrh';


      const showStatus = (text, kind) => {
        // Remove previous status if any (no layout/animation changes)
        const prev = form.querySelector('[data-status]');
        if (prev) prev.remove();

        const note = document.createElement('div');
        note.textContent = text;
        note.style.marginTop = '12px';
        note.style.fontWeight = '800';
        note.style.color = kind === 'success' ? '#34d399' : '#fb7185';
        note.style.background = kind === 'success' ? 'rgba(52, 211, 153, 0.12)' : 'rgba(251, 113, 133, 0.12)';
        note.style.border = kind === 'success' ? '1px solid rgba(52, 211, 153, 0.35)' : '1px solid rgba(251, 113, 133, 0.35)';
        note.style.padding = '10px 12px';
        note.style.borderRadius = '12px';
        note.setAttribute('role', kind === 'success' ? 'status' : 'alert');
        note.setAttribute('data-status', 'true');
        form.appendChild(note);
      };

      // Wait until EmailJS is ready
      const sendWithEmailJS = async () => {
        // Basic guard in case script failed to load
        if (!window.emailjs || typeof window.emailjs.sendForm !== 'function') {
          throw new Error('EmailJS not loaded. Check the EmailJS CDN script in index.html.');
        }

        // Initialize EmailJS
        window.emailjs.init(PUBLIC_KEY);

        // sendForm() sends values from the form inputs/textarea by their `name` attributes.
        // Your form uses: name, email, message.
        // Your EmailJS template must define the same variable names.
        // Example template placeholders: {{name}}, {{email}}, {{message}}
        return window.emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, form);
      };


      (async () => {
        try {
          // Loading state: keep the button disabled and label as already set to "Sending..."
          // Keep UX consistent with your current design.

          await sendWithEmailJS();

          // Restore button state
          if (btn && original !== null) {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.innerHTML = original;
          }

          // Success UX
          form.reset();
          clearError();
          showStatus('Message sent successfully. We will contact you shortly.', 'success');
        } catch (err) {
          // Restore button state
          if (btn && original !== null) {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.innerHTML = original;
          }

          // Error UX
          console.error('EmailJS send failed:', err);
          showStatus('Failed to send message. Please try again in a moment.', 'error');
        }
      })();
    });
  }

  // Lenis (optional smooth scroll)
  try{
    if (window.lenis) return;
  }catch(err){}
})();


