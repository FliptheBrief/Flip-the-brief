/* Flip the Brief — shared site script (every page loads this) */
(function () {
  'use strict';

  // ── Mobile menu ─────────────────────────────────────────────────────
  var burger = document.getElementById('burger');
  var mnav = document.getElementById('mnav');
  if (burger && mnav) {
    burger.addEventListener('click', function () {
      var open = mnav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mnav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mnav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ── Briefy's 2 cents (button on the home page) ──────────────────────
  var quotes = [
    "Boring briefs don't excite me. Challenges do.",
    "Every brief has a real problem hiding in it. I go find it.",
    "If your brief is one line, that's a great start. Send it anyway.",
    "I've read a thousand briefs. Most of them were wrong about what they needed.",
    "Synergy is not a strategy.",
    "The brief is just the beginning. I promise it gets better from here."
  ];
  var quoteBtn = document.getElementById('briefyBtn');
  var quoteEl = document.getElementById('briefyQuote');
  if (quoteBtn && quoteEl) {
    var qi = 0;
    quoteBtn.addEventListener('click', function () {
      qi = (qi + 1) % quotes.length;
      quoteEl.textContent = '"' + quotes[qi] + '"';
    });
  }

  // ── Package finder (packages page) ──────────────────────────────────
  var finderResult = document.getElementById('finderResult');
  document.querySelectorAll('.finder-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.finder-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      if (!finderResult) return;
      finderResult.textContent = 'That sounds like ' + btn.getAttribute('data-name') + ' — ';
      var a = document.createElement('a');
      a.href = btn.getAttribute('data-href');
      a.textContent = 'see what’s inside →';
      finderResult.appendChild(a);
    });
  });

  // ── Floating Briefy ─────────────────────────────────────────────────
  // Works the same on phones and desktops: it is triggered by scrolling
  // (not by mouse hover), so touch screens see it too. Tap him to dismiss.
  var float = document.getElementById('briefyFloat');
  var bubble = document.getElementById('briefyFloatBubble');
  if (float && bubble) {
    var queue = [];
    var busy = false;
    var timer = null;

    var hide = function () {
      clearTimeout(timer);
      float.classList.remove('show');
      setTimeout(function () { busy = false; pump(); }, 600);
    };
    var pump = function () {
      if (busy || !queue.length) return;
      busy = true;
      bubble.textContent = queue.shift();
      float.classList.add('show');
      timer = setTimeout(hide, 4800);
    };
    var say = function (text) { queue.push(text); pump(); };
    float.addEventListener('click', hide);

    // Elements with data-briefy="..." make Briefy pop up once, when they scroll into view.
    var targets = document.querySelectorAll('[data-briefy]');
    if ('IntersectionObserver' in window && targets.length) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            say(e.target.getAttribute('data-briefy'));
            io.unobserve(e.target);
          }
        });
      }, { rootMargin: '0px 0px -30% 0px', threshold: 0 });
      // small delay so nothing pops the instant the page loads
      setTimeout(function () { targets.forEach(function (t) { io.observe(t); }); }, 1500);
    }

    // Home page only: deep-scroll line
    if (document.body.getAttribute('data-page') === 'home') {
      var deepShown = false;
      window.addEventListener('scroll', function () {
        if (deepShown) return;
        var scrolled = window.scrollY + window.innerHeight;
        if (scrolled > document.documentElement.scrollHeight * 0.65) {
          deepShown = true;
          say('Still scrolling? You might as well hire us.');
        }
      }, { passive: true });
    }
  }

  // ── Contact form → Formspree ────────────────────────────────────────
  var FORMSPREE_ENDPOINT = 'https://formspree.io/f/mkjnvdor';
  var form = document.getElementById('briefForm');
  var formBtn = document.getElementById('formBtn');
  var formStatus = document.getElementById('formStatus');

  // Buttons on package pages carry data-package="The flip" — pre-fill the message.
  document.querySelectorAll('[data-package]').forEach(function (el) {
    el.addEventListener('click', function () {
      var msg = form && form.querySelector('textarea[name="message"]');
      if (msg && !msg.value.trim()) {
        msg.value = "I'm interested in " + el.getAttribute('data-package') + '. ';
      }
    });
  });

  if (form && formBtn && formStatus) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      formBtn.disabled = true;
      formBtn.textContent = 'Sending...';
      formStatus.style.display = 'none';

      var done = function (ok) {
        if (ok) {
          form.reset();
          formStatus.textContent = "Thanks — we'll be in touch.";
          formStatus.style.color = 'var(--lime)';
        } else {
          formStatus.textContent = 'Something went wrong. Try emailing us directly instead.';
          formStatus.style.color = '#e0a0a0';
        }
        formStatus.style.display = 'block';
        formBtn.disabled = false;
        formBtn.textContent = 'Send it over';
      };

      fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      }).then(function (r) { done(r.ok); }).catch(function () { done(false); });
    });
  }
})();
