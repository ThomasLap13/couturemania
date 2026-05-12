/* ===========================================
   COUTUREMANIA — Main JavaScript
   Reviews carousel, scroll reveals, navbar etc.
   =========================================== */

let swup;

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollReveal();
  initHoursHighlight();
  initContactForm();
  loadReviews();

  swup = new Swup();

  swup.hooks.on('page:view', () => {
    initScrollReveal();
    initHoursHighlight();
    initContactForm();
    loadReviews();
    updateNavbarActiveState();
  });
});

function updateNavbarActiveState() {
  const currentPath = window.location.pathname;
  const links = document.querySelectorAll('#mainNav .nav-link');
  links.forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    if (href && href === './' && (currentPath.endsWith('/') || currentPath.endsWith('index'))) {
      link.classList.add('active');
    } else if (href && href !== './' && currentPath.includes(href)) {
      link.classList.add('active');
    }
  });
}

/* ---- Navbar scroll effect ---- */
function initNavbar() {
  const nav = document.getElementById('mainNav');
  if (!nav) return;
  
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ---- Scroll Reveal (IntersectionObserver) ---- */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  reveals.forEach(el => observer.observe(el));
}

/* ---- Highlight today's row in hours table ---- */
function initHoursHighlight() {
  const tables = document.querySelectorAll('.hours-table');
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const today = days[new Date().getDay()];

  tables.forEach(table => {
    table.querySelectorAll('tr').forEach(row => {
      if (row.querySelector('td') && row.querySelector('td').textContent.trim() === today) {
        row.classList.add('today');
      }
    });
  });
}

/* ---- Contact form handler ---- */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const success = document.getElementById('formSuccess');
    if (success) {
      success.classList.remove('d-none');
      form.reset();
      setTimeout(() => success.classList.add('d-none'), 5000);
    }
  });
}

/* ============================================
   GOOGLE REVIEWS SYSTEM
   ============================================ */

const GOOGLE_MAPS_URL = 'https://www.google.com/maps/place/Couturemania+retouche+express/@47.2341203,6.0246106,740m/data=!3m1!1e3!4m8!3m7!1s0x478d635969a62027:0x1373e8b3f88466a0!8m2!3d47.2341203!4d6.0271855!9m1!1b1!16s%2Fg%2F11twt6jyjl?entry=ttu';

async function loadReviews() {
  const track = document.getElementById('reviewsTrack');
  if (!track) return;

  let reviewsData = null;

  // Determine API path (works from any page)
  const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
  const apiUrl = basePath + 'api/reviews.php';

  // Fetch from PHP API
  try {
    const res = await fetch(apiUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'ok' && data.reviews && data.reviews.length > 0) {
        reviewsData = data;
      }
    }
  } catch (e) {
    console.log('API not available:', e);
  }

  if (!reviewsData) {
    console.log('No reviews data received from API');
    return;
  }

  const reviews = reviewsData.reviews;
  const globalRating = reviewsData.rating || 4.8;
  const globalCount = reviewsData.total_reviews || 29;

  // Update global score
  updateGlobalScore(globalRating, globalCount);

  // Render reviews (single set, no duplication)
  const reviewsHTML = reviews.map(r => renderReviewCard(r)).join('');
  track.innerHTML = reviewsHTML;
}

function updateGlobalScore(rating, count) {
  const ratingEl = document.getElementById('globalRating');
  const countEl = document.getElementById('globalCount');
  const starsEl = document.getElementById('globalStars');

  if (ratingEl) ratingEl.textContent = rating.toFixed(1);
  if (countEl) countEl.textContent = count;
  if (starsEl) starsEl.innerHTML = renderStars(rating);
}

function renderStars(rating) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      html += '<i class="bi bi-star-fill"></i>';
    } else if (rating >= i - 0.5) {
      html += '<i class="bi bi-star-half"></i>';
    } else {
      html += '<i class="bi bi-star"></i>';
    }
  }
  return html;
}

function renderReviewCard(review) {
  const initials = review.author_name
    .split(' ')
    .map(w => w.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');

  const stars = renderStars(review.rating);

  return `
    <a href="${GOOGLE_MAPS_URL}" target="_blank" rel="noopener" class="review-card" style="text-decoration: none; color: inherit;">
      <div class="review-card-header">
        <div class="review-avatar">${initials}</div>
        <div>
          <div class="review-author">${escapeHtml(review.author_name)}</div>
          <div class="review-date">${escapeHtml(review.relative_time_description)}</div>
        </div>
      </div>
      <div class="review-stars">${stars}</div>
      <div class="review-text">${escapeHtml(review.text)}</div>
      <div class="review-google-icon">
        <svg height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        <span style="color: rgba(255,255,255,.5);">Avis Google</span>
      </div>
    </a>
  `;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
