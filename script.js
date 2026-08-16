/* ==========================================================================
   Natures Treasure - Interactive Script & Logic
   Pure By Nature | Agarwood Management & Artisanal Pure Oud Oil
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initRoiCalculator();
  initShopFilters();
  initModals();
  initContactForm();
  initSmoothScroll();
  initRevealAnimations();
  initSiteAnimations();
  initStatCounters();
  initJourneyRoadmap();
});

/* Site-wide reveal animations using IntersectionObserver
   - Does NOT touch or modify the editorial/journey roadmap section
   - Applies subtle motion classes and staggers groups when appropriate
*/
function initSiteAnimations() {
  if (!('IntersectionObserver' in window)) return;

  const animatedGroups = new Set();

  // Candidate selectors to animate (avoid broad 'section' to prevent conflict
  // with existing hero/reveal logic; exclude anything inside .hero)
  const selectors = [
    '.process-card',
    '.product-card',
    '.metric-card',
    '.tech-feature-item',
    '.feathered-image-wrap',
    '.about-hero-copy',
    '.about-hero-card',
    '.message-card',
    '.vision-card',
    '.final-product-image',
    '.contact-form-container',
    '.contact-info-box',
    '.footer'
  ];

  const heroExclusionClasses = [
    'hero-image-wrapper',
    'hero-card-preview',
    'hero-content',
    'hero-badge',
    'hero-actions',
    'hero-stats',
    'hero-floating-glass',
    'hero-title',
    'hero-description'
  ];

  const candidates = Array.from(document.querySelectorAll(selectors.join(','))).filter(el => {
    // Skip anything inside the editorial roadmap section
    if (el.closest('#journeyRoadmapSection') || el.closest('.editorial-journey-section')) return false;
    // Skip hero section and hero preview/card elements to avoid conflicting reveal styles
    if (el.matches('.hero, .hero *')) return false;
    if (heroExclusionClasses.some(cls => el.classList.contains(cls))) return false;
    // Skip elements that already have reveal classes applied
    if (el.classList.contains('animate-in') || el.classList.contains('reveal')) return false;
    return true;
  });

  // Group candidates by their parent container to enable staggered reveals
  const groups = new Map();
  candidates.forEach(el => {
    const parent = el.parentElement || document.body;
    const key = parent; // use DOM node as key
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(el);
  });

  // Apply initial motion classes based on layout heuristics
  function chooseVariant(el) {
    // force-up for cards
    if (el.classList.contains('process-card') || el.classList.contains('product-card') || el.classList.contains('metric-card') || el.classList.contains('tech-feature-item')) return 'motion-fade-up';
    if (el.classList.contains('hero-image-wrapper') || el.classList.contains('final-product-image') || el.classList.contains('feathered-image-wrap')) return 'motion-scale';
    if (el.classList.contains('contact-form-container') || el.classList.contains('contact-info-box')) return 'motion-fade-up';

    // Determine center vs side
    const container = el.parentElement || document.body;
    try {
      const cRect = container.getBoundingClientRect();
      const eRect = el.getBoundingClientRect();
      const eCenter = eRect.left + eRect.width / 2;
      const cCenter = cRect.left + cRect.width / 2;
      const rel = (eCenter - cCenter) / cRect.width;
      if (Math.abs(rel) < 0.15) return 'motion-fade-up';
      return rel < 0 ? 'motion-slide-left' : 'motion-slide-right';
    } catch (err) {
      return 'motion-fade-up';
    }
  }

  // Initialize classes and data-group
  let groupId = 0;
  groups.forEach((els, parent) => {
    const id = `mg-${groupId++}`;
    els.forEach((el, idx) => {
      el.dataset.motionGroup = id;
      const variant = chooseVariant(el);
      el.classList.add(variant, 'motion-hidden', 'motion-item');
      // set a small base delay for visual hierarchy (headlines before body will be handled elsewhere)
      const baseDelay = 0.06 * idx; // 60ms per item
      el.style.transitionDelay = `${baseDelay}s`;
    });
  });

  const io = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const gid = el.dataset.motionGroup;
      if (!gid) {
        el.classList.remove('motion-hidden');
        el.classList.add('animate-in');
        observer.unobserve(el);
        return;
      }

      // If group already animated, just reveal this element without stagger
      if (animatedGroups.has(gid)) {
        el.classList.remove('motion-hidden');
        el.classList.add('animate-in');
        observer.unobserve(el);
        return;
      }

      // Animate the whole group with stagger
      const groupEls = Array.from(document.querySelectorAll(`[data-motion-group="${gid}"]`));
      groupEls.forEach((gEl, i) => {
        // small stagger: 90ms
        gEl.style.transitionDelay = `${i * 0.09}s`;
        setTimeout(() => {
          gEl.classList.remove('motion-hidden');
          gEl.classList.add('animate-in');
        }, i * 90);
        observer.unobserve(gEl);
      });
      animatedGroups.add(gid);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  // Observe all candidates
  candidates.forEach(el => io.observe(el));
}

function initStatCounters() {
  const counters = document.querySelectorAll('.stat-value');
  if (!counters.length) return;

  const duration = 2300;
  const start = performance.now();

  const formatNumber = value => value.toLocaleString('en-US');
  const easeOut = t => 1 - Math.pow(1 - t, 3);

  const animate = now => {
    const elapsed = Math.min(now - start, duration);
    const progress = easeOut(elapsed / duration);

    counters.forEach(counter => {
      const target = Number(counter.dataset.target);
      const current = Math.round(target * progress);
      counter.textContent = formatNumber(current);
    });

    if (elapsed < duration) {
      window.requestAnimationFrame(animate);
    } else {
      counters.forEach(counter => {
        counter.textContent = formatNumber(Number(counter.dataset.target));
      });
    }
  };

  window.requestAnimationFrame(animate);
}

function initRevealAnimations() {
  const revealTargets = Array.from(document.querySelectorAll(
    '.about-hero-copy, .about-hero-card, .hero-content, .hero-image-wrapper, .story-card, .message-card, .vision-card, .about-cta, .hero-stats .stat-item, .highlight-box'
  ));

  if (revealTargets.length === 0) return;

  const revealElement = (element, delay = 0) => {
    setTimeout(() => element.classList.add('animate-in'), delay);
  };

  if (!('IntersectionObserver' in window)) {
    revealTargets.forEach((el, index) => revealElement(el, index * 80));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        revealElement(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
  });

  revealTargets.forEach(el => observer.observe(el));

  // Fallback for elements already in the visible viewport on page load
  window.requestAnimationFrame(() => {
    revealTargets.forEach((el, index) => {
      if (!el.classList.contains('animate-in')) {
        const rect = el.getBoundingClientRect();
        const isInView = rect.top < window.innerHeight && rect.bottom > 0;
        if (isInView) {
          revealElement(el, 120 + index * 60);
        }
      }
    });
  });
}

/* Navbar Scroll & Mobile Toggle */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const icon = mobileToggle.querySelector('i');
      if (icon) {
        if (navLinks.classList.contains('active')) {
          icon.className = 'fas fa-times';
        } else {
          icon.className = 'fas fa-bars';
        }
      }
    });

    // Close mobile menu when link clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const icon = mobileToggle.querySelector('i');
        if (icon) icon.className = 'fas fa-bars';
      });
    });
  }
}

/* Interactive ROI & Tree Management Calculator */
function initRoiCalculator() {
  const treeSlider = document.getElementById('treeSlider');
  const treeValueDisplay = document.getElementById('treeValueDisplay');
  const yearSlider = document.getElementById('yearSlider');
  const yearValueDisplay = document.getElementById('yearValueDisplay');

  const estimatedValueDisplay = document.getElementById('estimatedValueDisplay');
  const estimatedYieldDisplay = document.getElementById('estimatedYieldDisplay');
  const co2OffsetDisplay = document.getElementById('co2OffsetDisplay');
  const annualReturnDisplay = document.getElementById('annualReturnDisplay');

  if (!treeSlider || !yearSlider) return;

  function calculateROI() {
    const trees = parseInt(treeSlider.value, 10) || 1;
    const years = parseInt(yearSlider.value, 10) || 1;

    treeValueDisplay.textContent = trees === 1 ? '1 Tree' : trees.toLocaleString() + ' Trees';
    yearValueDisplay.textContent = years === 1 ? '1 Year' : years + ' Years';

    // Investment & Return Math:
    // Initial investment per tree: LKR 2,000 (Plant: 1,500 + Labour: 500)
    // Inoculation: 1,000 holes * 3 grams = 3,000 grams resin per tree
    // Selling price: LKR 300 / gram -> Gross value per tree = LKR 900,000
    const initialInvestmentLKR = trees * 2000;
    const totalResinGrams = trees * 3000;
    const grossReturnLKR = trees * 900000;
    const totalCo2Kg = trees * 22 * years;
    const projectedRoiPercent = Math.round(((grossReturnLKR - initialInvestmentLKR) / initialInvestmentLKR) * 100);

    // Format & Render Outputs
    if (estimatedValueDisplay) {
      estimatedValueDisplay.textContent = 'LKR ' + grossReturnLKR.toLocaleString();
    }
    if (estimatedYieldDisplay) {
      estimatedYieldDisplay.textContent = (totalResinGrams / 1000).toLocaleString() + ' kg (' + totalResinGrams.toLocaleString() + ' g)';
    }
    if (co2OffsetDisplay) {
      co2OffsetDisplay.textContent = (totalCo2Kg / 1000).toFixed(1) + ' Tons';
    }
    if (annualReturnDisplay) {
      annualReturnDisplay.textContent = projectedRoiPercent.toLocaleString() + '%';
    }
  }

  treeSlider.addEventListener('input', calculateROI);
  yearSlider.addEventListener('input', calculateROI);

  // Initial Calculation
  calculateROI();
}

/* Shop Filters & Product Interaction */
function initShopFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      productCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });
}

/* Modal Windows & Inquiries */
function initModals() {
  const modal = document.getElementById('inquiryModal');
  const modalClose = document.getElementById('modalClose');
  const modalTitle = document.getElementById('modalTitle');
  const modalBodyText = document.getElementById('modalBodyText');
  const orderButtons = document.querySelectorAll('.inquire-prod-btn, .open-inquiry-modal');

  orderButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const itemTitle = btn.getAttribute('data-title') || 'Agarwood Tree & Oud Inquiry';
      const itemPrice = btn.getAttribute('data-price');

      if (modalTitle) {
        modalTitle.textContent = itemTitle;
      }
      if (modalBodyText) {
        modalBodyText.textContent = itemPrice
          ? `Inquire about purchasing ${itemTitle} (${itemPrice}) directly from our master distillery.`
          : `Connect with our plantation specialists to discuss your custom Agarwood tree package.`;
      }

      if (modal) modal.classList.add('active');
    });
  });

  if (modalClose && modal) {
    modalClose.addEventListener('click', () => {
      modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  }

  // Modal Form Submission -> WhatsApp
  const modalForm = document.getElementById('modalForm');
  if (modalForm) {
    modalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('m_name')?.value || '';
      const contact = document.getElementById('m_email')?.value || '';
      const notes = document.getElementById('m_notes')?.value || '';
      const title = modalTitle?.textContent || 'Plantation & Oud Inquiry';

      let msg = `Inquiry: ${title}\n\n`;
      if (name) msg += `Name: ${name}\n`;
      if (contact) msg += `Email/Phone: ${contact}\n`;
      if (notes) msg += `Message: ${notes}\n`;

      sendToWhatsApp(msg);
      if (modal) modal.classList.remove('active');
      showToast('Opening WhatsApp with your inquiry...');
      modalForm.reset();
    });
  }
}

/* Contact & Plantation Form Submission -> WhatsApp */
function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('c_name')?.value || '';
      const email = document.getElementById('c_email')?.value || '';
      const phone = document.getElementById('c_phone')?.value || '';
      const interestSelect = document.getElementById('c_interest');
      const interestText = interestSelect ? interestSelect.options[interestSelect.selectedIndex].text : '';
      const message = document.getElementById('c_msg')?.value || '';

      let msg = `Contact Form Submission\n\n`;
      if (name) msg += `Name: ${name}\n`;
      if (email) msg += `Email: ${email}\n`;
      if (phone) msg += `Phone: ${phone}\n`;
      if (interestText) msg += `Interest: ${interestText}\n`;
      if (message) msg += `Message: ${message}\n`;

      sendToWhatsApp(msg);
      showToast('Opening WhatsApp with your message...');
      contactForm.reset();
    });
  }
}

/* WhatsApp Helper Function */
function sendToWhatsApp(message) {
  const whatsappNumber = '94760595115';
  const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

/* Smooth Scrolling */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerOffset = 90;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/* Toast Notifications */
function showToast(message) {
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fas fa-check-circle" style="color: var(--accent-gold-light); font-size: 1.3rem;"></i> <span>${message}</span>`;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 100);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, 4000);
}

/* ==========================================================================
   JOURNEY OF AGARWOOD - VINE HEAD SYNCHRONIZED LEAF GROWTH
   ========================================================================== */
function initJourneyRoadmap() {
  const roadmapSection = document.getElementById('journeyRoadmapSection');
  const path = document.getElementById('roadmapSvgLine');
  if (!roadmapSection || !path) return;

  const leafSprouts = roadmapSection.querySelectorAll('.vine-leaf-sprout');
  const pathLength = path.getTotalLength();
  path.style.strokeDasharray = pathLength;
  path.style.strokeDashoffset = pathLength;

  // Measure and cache the exact distance along the vine path for every leaf sprout
  const sproutDistances = [];
  const sampleSteps = 200;
  const sampledPoints = [];
  for (let i = 0; i <= sampleSteps; i++) {
    const len = (i / sampleSteps) * pathLength;
    const pt = path.getPointAtLength(len);
    sampledPoints.push({ len, x: pt.x, y: pt.y });
  }

  leafSprouts.forEach((sprout) => {
    const useEl = sprout.querySelector('use');
    if (!useEl) return;
    const lx = parseFloat(useEl.getAttribute('x') || 0);
    const ly = parseFloat(useEl.getAttribute('y') || 0);

    // Find the closest point on the SVG path for this leaf
    let minD = Infinity;
    let closestLen = 0;
    for (let j = 0; j < sampledPoints.length; j++) {
      const sp = sampledPoints[j];
      const dx = sp.x - lx;
      const dy = sp.y - ly;
      const d = dx * dx + dy * dy;
      if (d < minD) {
        minD = d;
        closestLen = sp.len;
      }
    }
    sproutDistances.push({ element: sprout, targetLength: closestLen });
  });

  function updateVineAndLeavesOnScroll() {
    const rect = roadmapSection.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    const totalHeight = rect.height;
    // Map scroll so vine starts drawing near top of section and finishes at bottom
    const currentScroll = windowHeight * 0.75 - rect.top;
    let progress = currentScroll / totalHeight;
    progress = Math.max(0, Math.min(1, progress));

    const currentDrawnLength = pathLength * progress;
    path.style.strokeDashoffset = pathLength - currentDrawnLength;

    // Reveal leaves ONLY when the vine line reaches them, hide them if scrolled back up
    sproutDistances.forEach((item) => {
      if (currentDrawnLength >= item.targetLength - 10) {
        item.element.classList.add('sprouted');
      } else {
        item.element.classList.remove('sprouted');
      }
    });
  }

  window.addEventListener('scroll', updateVineAndLeavesOnScroll, { passive: true });
  updateVineAndLeavesOnScroll();
  window.addEventListener('resize', updateVineAndLeavesOnScroll, { passive: true });
  window.addEventListener('orientationchange', updateVineAndLeavesOnScroll, { passive: true });

  // Scroll reveal observer for content cards
  const stages = roadmapSection.querySelectorAll('.editorial-stage');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal');
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  stages.forEach(stage => observer.observe(stage));
}





