    const root = document.documentElement;
    const yearEl = document.getElementById("year");
    const themeToggle = document.getElementById("themeToggle");
    const menuToggle = document.getElementById("menuToggle");
    const mainNav = document.getElementById("mainNav");
    const lightbox = document.getElementById("lightbox");
    const lightboxImage = document.getElementById("lightboxImage");
    const lightboxClose = document.getElementById("lightboxClose");
    const backToTop = document.getElementById("backToTop");
    const scrollProgressBar = document.getElementById("scrollProgress");

    yearEl.textContent = new Date().getFullYear();

    function setTheme(theme) {
      root.setAttribute("data-theme", theme);
      try { localStorage.setItem("site-theme", theme); } catch (e) { }
    }

    try {
      const savedTheme = localStorage.getItem("site-theme");
      if (savedTheme) setTheme(savedTheme);
    } catch (e) {
      setTheme("light");
    }

    themeToggle.addEventListener("click", () => {
      setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });

    menuToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("open");
      menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    });

    mainNav.addEventListener("click", event => {
      if (event.target.closest("a")) {
        mainNav.classList.remove("open");
        menuToggle.setAttribute("aria-label", "Open navigation");
      }
    });

    const navLinks = Array.from(document.querySelectorAll(".nav-link"));
    const sections = navLinks
      .map(link => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);

    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => {
          link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-35% 0px -55% 0px", threshold: 0 });

    sections.forEach(section => sectionObserver.observe(section));

    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll(".reveal").forEach(element => revealObserver.observe(element));

    function openLightbox(img) {
      lightboxImage.src = img.currentSrc || img.src;
      lightboxImage.alt = img.alt || "Expanded preview";
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("no-scroll");
    }

    function closeLightbox() {
      lightbox.classList.remove("open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("no-scroll");
      lightboxImage.src = "";
    }

    document.querySelectorAll(".gallery-grid img, .screenshot-grid img").forEach(img => {
      img.addEventListener("click", () => openLightbox(img));
    });

    lightboxClose.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", event => {
      if (event.target === lightbox) closeLightbox();
    });
    window.addEventListener("keydown", event => {
      if (event.key === "Escape" && lightbox.classList.contains("open")) closeLightbox();
    });

    window.addEventListener("scroll", () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0) {
        scrollProgressBar.style.width = (scrolled / total * 100) + "%";
      }
      backToTop.classList.toggle("visible", scrolled > 500);
    }, { passive: true });

    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    const counterEls = document.querySelectorAll("[data-count]");
    let countersAnimated = false;

    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !countersAnimated) {
          countersAnimated = true;
          counterEls.forEach(el => {
            const target = parseInt(el.dataset.count);
            const suffix = el.dataset.suffix || "";
            const duration = 1200;
            const start = performance.now();

            function tick(now) {
              const progress = Math.min((now - start) / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              el.textContent = Math.round(eased * target) + suffix;
              if (progress < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
          });
          counterObserver.disconnect();
        }
      });
    }, { threshold: 0.3 });

    counterEls.forEach(el => counterObserver.observe(el));

    // Game tab switching
    document.querySelectorAll('.game-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.game-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.game-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        const targetGame = document.getElementById('game-' + tab.dataset.game);
        if (targetGame) {
          targetGame.classList.add('active');
          targetGame.querySelectorAll('.reveal').forEach(el => {
            el.classList.remove('is-visible');
            void el.offsetWidth;
            el.classList.add('is-visible');
          });
        }
      });
    });

    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      document.querySelectorAll(".project-card").forEach(card => {
        card.addEventListener("mousemove", e => {
          const rect = card.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;
          card.style.transform = `perspective(700px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateY(-4px)`;
        });

        card.addEventListener("mouseleave", () => {
          card.style.transition = "transform 500ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 350ms ease, border-color 350ms ease";
          card.style.transform = "";
          setTimeout(() => { card.style.transition = ""; }, 500);
        });
      });
    }
