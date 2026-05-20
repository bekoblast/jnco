/* ============================================
   JNCO — Single Page Site Interactions
   ============================================ */

(function () {
    'use strict';

    /* ---------- LOADER ---------- */
    window.addEventListener('load', () => {
        setTimeout(() => {
            document.getElementById('loader').classList.add('hidden');
        }, 800);
    });

    /* ---------- AOS ---------- */
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-out-cubic',
            once: true,
            offset: 80,
            disable: window.innerWidth < 480 ? false : false
        });
    }

    /* ---------- NAV SCROLL STATE ---------- */
    const nav = document.getElementById('nav');
    const onScroll = () => {
        const y = window.scrollY;
        if (y > 40) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');

        // scroll progress
        const docH = document.documentElement.scrollHeight - window.innerHeight;
        const pct = (y / docH) * 100;
        const bar = document.querySelector('.scroll-progress span');
        if (bar) bar.style.width = pct + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ---------- MOBILE MENU ---------- */
    const menuBtn = document.getElementById('menuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('active');
            mobileMenu.classList.toggle('open');
        });
        mobileMenu.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                menuBtn.classList.remove('active');
                mobileMenu.classList.remove('open');
            });
        });
    }

    /* ---------- THEME TOGGLE ---------- */
    const themeToggle = document.getElementById('themeToggle');
    let currentTheme = localStorage.getItem('jnco-theme') || 'dark';

    function applyTheme(theme) {
        currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('jnco-theme', theme);
    }
    applyTheme(currentTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            applyTheme(currentTheme === 'light' ? 'dark' : 'light');
        });
    }

    /* ---------- LANGUAGE TOGGLE ---------- */
    const html = document.documentElement;
    const langToggle = document.getElementById('langToggle');
    let currentLang = localStorage.getItem('jnco-lang') || 'ar';

    function applyLang(lang) {
        currentLang = lang;
        html.lang = lang;
        html.dir = lang === 'ar' ? 'rtl' : 'ltr';

        document.querySelectorAll('[data-en]').forEach(el => {
            const v = el.getAttribute('data-' + lang);
            if (v != null) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = v;
                } else {
                    el.textContent = v;
                }
            }
        });

        // option elements (selects don't use textContent the same way)
        document.querySelectorAll('option[data-en]').forEach(el => {
            const v = el.getAttribute('data-' + lang);
            if (v != null) el.textContent = v;
        });

        localStorage.setItem('jnco-lang', lang);

        // re-trigger AOS refresh after language change layout shift
        if (typeof AOS !== 'undefined') AOS.refresh();
    }

    applyLang(currentLang);

    if (langToggle) {
        langToggle.addEventListener('click', () => {
            const next = currentLang === 'en' ? 'ar' : 'en';
            // small fade animation
            document.body.style.transition = 'opacity .25s';
            document.body.style.opacity = '0.4';
            setTimeout(() => {
                applyLang(next);
                document.body.style.opacity = '1';
            }, 200);
        });
    }

    /* ---------- COUNTER ANIMATION ---------- */
    const counters = document.querySelectorAll('[data-counter]');
    const countObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            if (el.dataset.counted) return;
            el.dataset.counted = '1';

            const target = parseInt(el.dataset.counter, 10);
            const duration = 1800;
            const start = performance.now();

            function tick(now) {
                const t = Math.min(1, (now - start) / duration);
                const eased = 1 - Math.pow(1 - t, 3);
                el.textContent = Math.floor(eased * target);
                if (t < 1) requestAnimationFrame(tick);
                else el.textContent = target;
            }
            requestAnimationFrame(tick);
        });
    }, { threshold: 0.4 });

    counters.forEach(c => countObserver.observe(c));

    /* ---------- CURSOR BLOB (desktop only) ---------- */
    const blob = document.querySelector('.cursor-blob');
    const isHoverable = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (blob && !isHoverable) {
        // remove entirely on touch devices so it can never cause horizontal scroll
        blob.remove();
    } else if (blob) {
        let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
        document.addEventListener('mousemove', (e) => {
            targetX = e.clientX;
            targetY = e.clientY;
        });
        function animateBlob() {
            currentX += (targetX - currentX) * 0.08;
            currentY += (targetY - currentY) * 0.08;
            blob.style.left = currentX + 'px';
            blob.style.top = currentY + 'px';
            requestAnimationFrame(animateBlob);
        }
        animateBlob();
    }

    /* ---------- SMOOTH ANCHOR SCROLL (offset for nav) ---------- */
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', (e) => {
            const id = a.getAttribute('href');
            if (id.length < 2) return;
            const target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            const top = target.getBoundingClientRect().top + window.scrollY - 70;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });

    /* ---------- FORM SUCCESS BANNER (?sent=1) ---------- */
    if (new URLSearchParams(window.location.search).has('sent')) {
        const form = document.querySelector('.contact-form');
        if (form) {
            form.classList.add('sent');
            form.reset();
            // scroll to the form so user sees the confirmation
            setTimeout(() => form.scrollIntoView({ behavior: 'smooth', block: 'center' }), 400);
            // clean the URL
            history.replaceState({}, '', window.location.pathname + '#contact');
        }
    }

    /* ---------- HERO TITLE WORD STAGGER (subtle) ---------- */
    const heroLines = document.querySelectorAll('.hero-line');
    heroLines.forEach((line, i) => {
        line.style.opacity = '0';
        line.style.transform = 'translateY(40px)';
        line.style.transition = 'opacity 1s cubic-bezier(.2,.8,.2,1), transform 1s cubic-bezier(.2,.8,.2,1)';
        setTimeout(() => {
            line.style.opacity = '1';
            line.style.transform = 'translateY(0)';
        }, 900 + i * 150);
    });

})();
