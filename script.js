/* ==========================================================================
   Natures Wealth - Interactive Script & Logic
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
  initStatCounters();
  initJourneyRoadmap();
});

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

  // Fallback for elements that may not intersect due to scroll position or layout shifts
  window.requestAnimationFrame(() => {
    revealTargets.forEach((el, index) => {
      if (!el.classList.contains('animate-in')) {
        revealElement(el, 120 + index * 60);
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
    const trees = parseInt(treeSlider.value, 10);
    const years = parseInt(yearSlider.value, 10);

    treeValueDisplay.textContent = trees.toLocaleString() + ' Trees';
    yearValueDisplay.textContent = years + ' Years';

    // Industry calculation for Agarwood in LKR
    // Cost per tree allocation & care ~ LKR 120,000
    // Revenue yield per mature tree ~ LKR 450,000 to 750,000 depending on maturity (years)
    const baseValuePerTreeLKR = 550000;
    const maturityMultiplier = 1 + ((years - 5) * 0.20);

    const totalEstimatedValueLKR = Math.round(trees * baseValuePerTreeLKR * maturityMultiplier);
    const estimatedOilMl = Math.round(trees * (10 + (years - 5) * 2.5));
    const co2OffsetKg = Math.round(trees * 22 * years);
    const investmentCostLKR = trees * 120000;
    const projectedReturnPercent = Math.round(((totalEstimatedValueLKR - investmentCostLKR) / investmentCostLKR) * 100);

    // Format & Render Outputs
    estimatedValueDisplay.textContent = 'Rs. ' + totalEstimatedValueLKR.toLocaleString();
    estimatedYieldDisplay.textContent = estimatedOilMl.toLocaleString() + ' ml';
    co2OffsetDisplay.textContent = (co2OffsetKg / 1000).toFixed(1) + ' Tons';
    annualReturnDisplay.textContent = projectedReturnPercent + '%';
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
      const itemTitle = btn.getAttribute('data-title') || 'Agarwood Investment & Oud Inquiry';
      const itemPrice = btn.getAttribute('data-price');

      if (modalTitle) {
        modalTitle.textContent = itemTitle;
      }
      if (modalBodyText) {
        modalBodyText.textContent = itemPrice
          ? `Inquire about purchasing ${itemTitle} (${itemPrice}) directly from our master distillery.`
          : `Connect with our plantation specialists to discuss your custom Agarwood tree investment.`;
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

      let msg = `- *Natures Wealth - ${title}*\n\n`;
      if (name) msg += `- *Name:* ${name}\n`;
      if (contact) msg += `- *Contact:* ${contact}\n`;
      if (notes) msg += `- *Details:* ${notes}\n`;

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

      let msg = `- *Natures Wealth Website Inquiry*\n\n`;
      if (name) msg += `- *Name:* ${name}\n`;
      if (email) msg += `- *Email:* ${email}\n`;
      if (phone) msg += `- *Phone:* ${phone}\n`;
      if (interestText) msg += `- *Interest:* ${interestText}\n`;
      if (message) msg += `- *Message:* ${message}\n`;

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
   JOURNEY OF AGARWOOD - EDITORIAL ROADMAP ANIMATIONS & SVG PATH DRAWING
   ========================================================================== */
function initJourneyRoadmap() {
  const roadmapSection = document.getElementById('journeyRoadmapSection');
  const path = document.getElementById('roadmapSvgLine');
  if (!roadmapSection) return;

  if (path) {
    const pathLength = path.getTotalLength();
    path.style.strokeDasharray = pathLength;
    path.style.strokeDashoffset = pathLength;

    function updatePathOnScroll() {
      const rect = roadmapSection.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      const totalHeight = rect.height;
      const currentScroll = windowHeight - rect.top;
      let progress = currentScroll / (totalHeight + windowHeight / 3);
      
      progress = Math.max(0, Math.min(1, progress));
      
      const drawLength = pathLength * progress;
      path.style.strokeDashoffset = pathLength - drawLength;
    }

    window.addEventListener('scroll', updatePathOnScroll, { passive: true });
    updatePathOnScroll();
  }

  // Scroll reveal observer for editorial stages & final product destination
  const stages = roadmapSection.querySelectorAll('.editorial-stage, .editorial-final-destination');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal');
      }
    });
  }, { 
    threshold: 0.15, 
    rootMargin: '0px 0px -50px 0px' 
  });

  stages.forEach(stage => observer.observe(stage));
}





