const panels = document.querySelectorAll('.panel');
const menuLinks = document.querySelectorAll('.top-menu a');
const contentPanel = document.querySelector('.content-panel');

let loreData = [];
let teamData = [];
let partnerData = [];
let indicatorDisabled = false;
let lastPanelIndex = 0;
let touchStartX = 0;
let touchEndX = 0;
let activePopup = null; // track popup for ESC key

// Panel order
const panelOrder = [
  'panel-collection',
  'panel-utility',
  'panel-about',
  'panel-about-team',
  'panel-about-partners',
  'panel-worlds',
  'panel-metaheads',
  'panel-marketplace',
  'panel-minigame'
];

/* ==========================
   ACTIVE MENU INDICATOR
========================== */
function setActive(el) {
  if (!el) return;
  menuLinks.forEach(a => a.classList.remove('active'));
  el.classList.add('active');
}

/* ==========================
   PANEL TRANSITION
========================== */
function showPanel(panelId, clickedIndex = null) {
  const current = Array.from(panels).find(p => p.style.display === 'flex');
  const nextPanel = document.getElementById(panelId);
  if (!nextPanel || current === nextPanel) return;

  let direction = 'right';
  if (clickedIndex !== null) {
    direction = clickedIndex < lastPanelIndex ? 'left' : 'right';
    lastPanelIndex = clickedIndex;
  }

  nextPanel.style.display = 'flex';
  nextPanel.style.position = 'absolute';
  nextPanel.style.transform = `translateX(${direction === 'left' ? '-100%' : '100%'})`;
  nextPanel.style.transition = 'transform 0.5s ease';
  nextPanel.classList.add('active');

  requestAnimationFrame(() => {
    nextPanel.style.transform = 'translateX(0%)';
  });

  if (current) {
    current.style.transition = 'transform 0.5s ease';
    current.style.transform = `translateX(${direction === 'left' ? '100%' : '-100%'})`;
    current.classList.remove('active');

    setTimeout(() => {
      current.style.display = 'none';
      current.style.transform = 'translateX(0%)';
    }, 500);
  }
}

/* ==========================
   PANEL LOADERS
========================== */
function loadCollection(el) {
  indicatorDisabled = false;
  setActive(el);
  showPanel('panel-collection', 0);
  closeMobileMenu();
}

function loadUtility(el) {
  indicatorDisabled = false;
  setActive(el);
  showPanel('panel-utility', 1);
  closeMobileMenu();
}

function loadAboutTeam(el) {
  indicatorDisabled = false;
  const aboutMenu = Array.from(menuLinks).find(a => a.textContent.toLowerCase().includes('about'));
  menuLinks.forEach(a => a.classList.remove('active'));
  if (el) el.classList.add('active');
  if (aboutMenu) aboutMenu.classList.add('active');
  loadTeamPanel();
  closeMobileMenu();
}

function loadAboutPartners(el) {
  indicatorDisabled = false;
  const aboutMenu = Array.from(menuLinks).find(a => a.textContent.toLowerCase().includes('about'));
  menuLinks.forEach(a => a.classList.remove('active'));
  if (el) el.classList.add('active');
  if (aboutMenu) aboutMenu.classList.add('active');
  loadPartnerPanel();
  closeMobileMenu();
}

function loadLoreWorlds(el) {
  indicatorDisabled = false;
  const loreMenu = Array.from(menuLinks).find(a => a.textContent.toLowerCase().includes('lore'));
  const worldsMenu = el;
  menuLinks.forEach(a => a.classList.remove('active'));
  if(worldsMenu) worldsMenu.classList.add('active');
  if(loreMenu) loreMenu.classList.add('active');
  showPanel('panel-worlds', 5);
  closeMobileMenu();
}

function loadLoreMetaHeads(el) {
  indicatorDisabled = false;
  const loreMenu = Array.from(menuLinks).find(a => a.textContent.toLowerCase().includes('lore'));
  const metaMenu = el;
  menuLinks.forEach(a => a.classList.remove('active'));
  if(metaMenu) metaMenu.classList.add('active');
  if(loreMenu) loreMenu.classList.add('active');
  loadLoreMetaHeadsPanel(el, 6);
}

function loadMarketplace(el) {
  indicatorDisabled = false;
  setActive(el);
  showPanel('panel-marketplace', 7);
  closeMobileMenu();
}

function loadMinigame(el) {
  indicatorDisabled = false;
  setActive(el);
  showPanel('panel-minigame', 8);
  closeMobileMenu();
}

/* ==========================
   MOBILE MENU CLOSE
========================== */
function closeMobileMenu() {
  const menu = document.querySelector('.top-menu');
  if (menu.classList.contains('show')) menu.classList.remove('show');
}

/* ==========================
   LOGO / TITLE CLICK -> COLLECTION
========================== */
const logo = document.querySelector('.top-logo');
const titleImg = document.querySelector('.top-title-img');

[logo, titleImg].forEach(el => el.addEventListener('click', () => {
  const collectionLink = Array.from(menuLinks)
    .find(a => a.textContent.toLowerCase().includes('collection'));
  if (collectionLink) setActive(collectionLink);
  lastPanelIndex = 0;
  showPanel('panel-collection', 0);
  closeMobileMenu();
}));

/* ==========================
   LOAD METAHEADS PANEL
========================== */
async function loadLoreMetaHeadsPanel(el, index=6) {
  const res = await fetch('data/lore.json');
  loreData = await res.json();

  const grid = document.getElementById('loreGrid');
  grid.innerHTML = '';

  loreData.forEach(l => {
    const card = document.createElement('div');
    card.className = 'lore-card';
    card.innerHTML = `
      <img src="${l.image}" alt="${l.name}">
      <h4 id="lore-card-text" style="margin:0; text-align:center; text-transform:uppercase;">
        ${l.name}
      </h4>
    `;
    card.onclick = () => openLorePopup(l.id);
    grid.appendChild(card);
  });

  showPanel('panel-metaheads', index);
  closeMobileMenu();
}

/* ==========================
   LOAD TEAM PANEL
========================== */
async function loadTeamPanel() {
  const res = await fetch('data/team.json');
  teamData = await res.json();

  const panel = document.getElementById('panel-about-team');
  panel.innerHTML = '<h2>Team</h2><div class="team-grid"></div>';
  const grid = panel.querySelector('.team-grid');

  teamData.forEach(t => {
    const card = document.createElement('div');
    card.className = 'team-card';

    let socialsHTML = '';
    if (t.socials) {
      socialsHTML = `
        <div class="team-socials">
          ${Object.entries(t.socials).map(([key, url]) => `
            <a href="${url}" target="_blank" rel="noopener" class="team-social ${key}" data-tooltip="${url}">
              <img src="assets/images/team-icon/${key}.png" alt="${key}">
            </a>
          `).join('')}
        </div>
      `;
    }

    card.innerHTML = `
      <img src="${t.image}" alt="${t.name}">
      <h4>${t.name}</h4>
      <p>${t.role}</p>
      ${socialsHTML}
    `;

    /* Avatar click → profile popup */
    card.querySelector('img').onclick = e => {
      e.stopPropagation();
      openTeamPopup(t);
    };

    /* Mobile tap to toggle socials */
    card.onclick = () => {
      if (window.innerWidth <= 768) {
        card.classList.toggle('show-socials');
      }
    };

    grid.appendChild(card);
  });

  showPanel('panel-about-team', 3);
  closeMobileMenu();
}

/* ==========================
   LOAD PARTNERS PANEL
========================== */
async function loadPartnerPanel() {
  const res = await fetch('data/partners.json');
  partnerData = await res.json();

  const panel = document.getElementById('panel-about-partners');
  panel.innerHTML = '<h2>Partners</h2><div class="partner-grid"></div>';
  const grid = panel.querySelector('.partner-grid');

  partnerData.forEach(p => {
    const card = document.createElement('div');
    card.className = 'partner-card';

    let socialsHTML = '';
    if (p.socials) {
      socialsHTML = `
        <div class="partner-socials">
          ${Object.entries(p.socials).map(([key, url]) => `
            <a href="${url}" target="_blank" rel="noopener" class="partner-social ${key}" data-tooltip="${key}">
              <img src="assets/images/partner-icon/${key}.jpg" alt="${key}">
            </a>
          `).join('')}
        </div>
      `;
    }

    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <h4>${p.name}</h4>
      ${socialsHTML}
    `;

    /* Logo click → popup */
    card.querySelector('img').onclick = e => {
      e.stopPropagation();
      openPartnerPopup(p);
    };

    /* Mobile tap → socials */
    card.onclick = () => {
      if (window.innerWidth <= 768) {
        card.classList.toggle('show-socials');
      }
    };

    grid.appendChild(card);
  });

  // Show panel after loading content
  showPanel('panel-about-partners', 4);
  closeMobileMenu();
}

/* ==========================
   POPUP SLIDER WITH BOUNCE
========================== */
function openLorePopup(id) {
  const l = loreData.find(x => x.id === id);
  if (!l) return;

  const slides = l.sliderImages?.length ? l.sliderImages : [l.image];
  const labels = ["MetaHead Profile","GIF","Static"];
  let index = 0;

  const popup = document.createElement('div');
  popup.className = 'lore-popup bounce-in';
  activePopup = popup;

  popup.innerHTML = `
    <div class="lore-popup-content">
      <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
        <h2 style="margin:0; font-family: 'PixelPurl', monospace; letter-spacing: 3px; text-transform: uppercase;">${l.name}</h2>
        <div class="close-popup">✕</div>
      </div>
      <div class="lore-slider single" style="margin-top:12px;">
        <button class="slider-btn left">❮</button>
        <div class="slider-viewport">
          <div class="slider-track">
            ${slides.map((img,i)=>`
              <div class="slide">
                <div class="slide-label" style="text-align:center; margin-bottom:6px;">
                  ${labels[i] || ''}
                </div>
                <img src="${img}" draggable="false">
              </div>
            `).join('')}
          </div>
        </div>
        <button class="slider-btn right">❯</button>
      </div>
    </div>
  `;

  document.body.appendChild(popup);

  const track = popup.querySelector('.slider-track');
  const slideEls = popup.querySelectorAll('.slide');
  const btnLeft = popup.querySelector('.slider-btn.left');
  const btnRight = popup.querySelector('.slider-btn.right');
  const btnClose = popup.querySelector('.close-popup');

  function updateSlider() {
    track.style.transform = `translateX(-${index * 100}%)`;
    slideEls.forEach((s,i)=>{
      s.classList.toggle('current-slide', i === index);
      resetTilt(s);
      if(i === index) applyTilt(s);
    });
  }

  btnLeft.onclick = () => {
    index = (index - 1 + slideEls.length) % slideEls.length;
    updateSlider();
  };
  btnRight.onclick = () => {
    index = (index + 1) % slideEls.length;
    updateSlider();
  };

  function closeLorePopup() {
    popup.classList.remove('bounce-in');
    popup.classList.add('bounce-out');
    setTimeout(() => {
      popup.cleanup?.();
      popup.remove();
      if(activePopup === popup) activePopup = null;
    }, 400);
  }

  function keyHandler(e){
    if (e.key === 'ArrowLeft') btnLeft.click();
    if (e.key === 'ArrowRight') btnRight.click();
    if (e.key === 'Escape') closeLorePopup();
  }
  document.addEventListener('keydown', keyHandler);

  popup.cleanup = () => {
    document.removeEventListener('keydown', keyHandler);
  };

  popup.addEventListener('click', e => {
    if (e.target === popup) closeLorePopup();
  });

  btnClose.onclick = closeLorePopup;

  updateSlider();
}

/* ==========================
   TILT EFFECT
========================== */
function applyTilt(slide){
  slide.addEventListener('mousemove', tiltMove);
  slide.addEventListener('mouseleave', tiltReset);
}
function resetTilt(slide){
  slide.removeEventListener('mousemove', tiltMove);
  slide.removeEventListener('mouseleave', tiltReset);
  slide.style.transform = '';
}
function tiltMove(e){
  const r = this.getBoundingClientRect();
  const x = e.clientX - r.left;
  const y = e.clientY - r.top;
  const rx = ((y / r.height) - 0.5) * -12;
  const ry = ((x / r.width) - 0.5) * 12;
  this.style.transform =
    `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.05)`;
}
function tiltReset(){
  this.style.transform =
    'perspective(900px) rotateX(0) rotateY(0) scale(1)';
}

/* ==========================
   MOBILE MENU + INIT
========================== */
const hamburger = document.createElement('div');
hamburger.className = 'hamburger';
hamburger.innerHTML = `<div></div><div></div><div></div>`;
document.querySelector('.top-bar').appendChild(hamburger);

hamburger.onclick = () =>
  document.querySelector('.top-menu').classList.toggle('show');

/* ==========================
   MOBILE SWIPE FOR PANELS
========================== */
contentPanel.addEventListener('touchstart',
  e => touchStartX = e.touches[0].clientX
);
contentPanel.addEventListener('touchend', e => {
  touchEndX = e.changedTouches[0].clientX;
  const diff = touchEndX - touchStartX;
  if (Math.abs(diff) < 50) return;

  const activeIndex = panelOrder.findIndex(
    id => document.getElementById(id).style.display === 'flex'
  );

  if (diff > 0 && activeIndex > 0)
    menuLinks[activeIndex - 1].click();
  else if (diff < 0 && activeIndex < panelOrder.length - 1)
    menuLinks[activeIndex + 1].click();
});

/* ==========================
   INITIAL PANEL ON LANDING (COLLECTION ACTIVE)
========================== */
document.addEventListener('DOMContentLoaded', () => {
  panels.forEach(p => p.style.display = 'none');

  const collectionLink = Array.from(menuLinks)
    .find(a => a.textContent.toLowerCase().includes('collection'));

  if (collectionLink) setActive(collectionLink);
  showPanel('panel-collection', 0);
});

/* ==========================
   TEAM POPUP
========================== */
function openTeamPopup(member) {
  const popup = document.createElement('div');
  popup.className = 'lore-popup bounce-in';
  activePopup = popup;

  popup.innerHTML = `
    <div class="lore-popup-content">
      <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
        <h2 style="margin:0; font-family:'PixelPurl', monospace; letter-spacing:3px;">
          ${member.name}
        </h2>
        <div class="close-popup">✕</div>
      </div>
      <div class="team-popup-body">
        <img src="${member.image}">
        <p>${member.role}</p>
      </div>
    </div>
  `;

  document.body.appendChild(popup);

  const closeBtn = popup.querySelector('.close-popup');

  function closePopup() {
    popup.classList.remove('bounce-in');
    popup.classList.add('bounce-out');
    setTimeout(() => {
      popup.cleanup?.();
      popup.remove();
      if(activePopup === popup) activePopup = null;
    }, 400);
  }

  // Close popup on Escape key
  function keyHandler(e) {
    if (e.key === 'Escape') closePopup();
  }

  document.addEventListener('keydown', keyHandler);

  // Cleanup handler on close
  popup.cleanup = () => {
    document.removeEventListener('keydown', keyHandler);
  };

  popup.addEventListener('click', e => {
    if (e.target === popup) closePopup();
  });

  closeBtn.onclick = closePopup;
}

/* ==========================
   PARTNER POPUP
========================== */
function openPartnerPopup(partner) {
  const popup = document.createElement('div');
  popup.className = 'lore-popup bounce-in';
  activePopup = popup;

  popup.innerHTML = `
    <div class="lore-popup-content">
      <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
        <h2 style="margin:0; font-family:'PixelPurl', monospace; letter-spacing:3px;">
          ${partner.name}
        </h2>
        <div class="close-popup">✕</div>
      </div>
      <div class="team-popup-body">
        <img src="${partner.image}">
        <p>${partner.description || ''}</p>
      </div>
    </div>
  `;

  document.body.appendChild(popup);

  const closeBtn = popup.querySelector('.close-popup');

  function closePopup() {
    popup.classList.remove('bounce-in');
    popup.classList.add('bounce-out');
    setTimeout(() => {
      popup.cleanup?.();
      popup.remove();
      if(activePopup === popup) activePopup = null;
    }, 400);
  }

  // Close popup on Escape key
  function keyHandler(e) {
    if (e.key === 'Escape') closePopup();
  }

  document.addEventListener('keydown', keyHandler);

  // Cleanup handler on close
  popup.cleanup = () => {
    document.removeEventListener('keydown', keyHandler);
  };

  popup.addEventListener('click', e => {
    if (e.target === popup) closePopup();
  });

  closeBtn.onclick = closePopup;
}
/* ==========================
   LOAD MARKETPLACE PANEL
========================== */
async function loadMarketplace(el) {
  indicatorDisabled = false;
  setActive(el);

  // Fetch marketplace items
  const res = await fetch('data/marketplace.json');
  const marketplaceData = await res.json();

  const grid = document.getElementById('marketplaceGrid');
  grid.innerHTML = '';

  marketplaceData.forEach(item => {
    const card = document.createElement('div');
    card.className = 'marketplace-card';
    card.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <h3>${item.name}</h3>
      
    `;
    card.onclick = () => {
      if (item.url) window.open(item.url, '_blank'); // open in new tab
    };
    grid.appendChild(card);
  });

  showPanel('panel-marketplace', 7);
  closeMobileMenu();
}

/* ==========================
   IMAGE CAROUSEL AUTO-SLIDE
========================== */
const carouselTrack = document.querySelector('.carousel-track');
const slides = document.querySelectorAll('.carousel-slide');
let currentIndex = 0;

function updateCarousel() {
  slides.forEach((s,i) => s.classList.remove('active'));
  slides[currentIndex].classList.add('active');

  const slideWidth = slides[0].getBoundingClientRect().width + 24; // slide width + gap
  const offset = slideWidth * currentIndex - (carouselTrack.offsetWidth - slideWidth)/2;
  carouselTrack.style.transform = `translateX(-${offset}px)`;
}

function nextSlide() {
  currentIndex = (currentIndex + 1) % slides.length;
  updateCarousel();
}

// auto-slide every 3 seconds
setInterval(nextSlide, 3000);

// initialize
updateCarousel();
