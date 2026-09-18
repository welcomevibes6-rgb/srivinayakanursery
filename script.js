/* ==========================================
   SRI VINAYAKA NURSERY - INTERACTIVE SCRIPT
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Drawer Toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileDrawerCloseBtn = document.getElementById('mobileDrawerCloseBtn');
  const mobileDrawerOverlay = document.getElementById('mobileDrawerOverlay') || document.getElementById('mobileNavOverlay');
  const mainNav = document.getElementById('mainNav');

  function openMobileDrawer() {
    if (mobileDrawer) mobileDrawer.classList.add('open');
    if (mobileDrawerOverlay) mobileDrawerOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileDrawer() {
    if (mobileDrawer) mobileDrawer.classList.remove('open');
    if (mobileDrawerOverlay) mobileDrawerOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openMobileDrawer();
    });
  }

  if (mobileDrawerCloseBtn) {
    mobileDrawerCloseBtn.addEventListener('click', closeMobileDrawer);
  }

  if (mobileDrawerOverlay) {
    mobileDrawerOverlay.addEventListener('click', closeMobileDrawer);
  }

  // Mobile Submenu Toggle Handler
  const submenuToggles = document.querySelectorAll('.mobile-submenu-toggle');
  submenuToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
      const targetId = toggle.getAttribute('aria-controls');
      const submenu = targetId ? document.getElementById(targetId) : toggle.nextElementSibling;
      
      toggle.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
      if (submenu) {
        submenu.classList.toggle('open');
      }
    });
  });

  // Close drawer on clicking navigation links (excluding toggle buttons)
  const drawerNavLinks = document.querySelectorAll('.mobile-nav-link:not(.mobile-submenu-toggle), .mobile-submenu-link, .main-nav a');
  drawerNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMobileDrawer();
    });
  });

  // 2. Cart Manager & Shopping Bag Interaction
  const CART_STORAGE_KEY = 'sri_vinayaka_cart';

  const CartManager = {
    getCart() {
      try {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        return [];
      }
    },

    saveCart(cart) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      } catch (e) {}
      this.updateUI();
    },

    addItem(product) {
      const cart = this.getCart();
      const existing = cart.find(item => item.id === product.id);

      if (existing) {
        existing.quantity += (product.quantity || 1);
      } else {
        cart.push({
          id: product.id,
          name: product.name || 'Sri Vinayaka Plant',
          category: product.category || 'Nursery Plant',
          img: product.img,
          price: product.price || 299,
          quantity: product.quantity || 1
        });
      }

      this.saveCart(cart);
      this.showToast(`Added "${product.name || 'Plant'}" to cart!`);

      // Meta Pixel AddToCart Event
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'AddToCart', {
          content_name: product.name || 'Sri Vinayaka Plant',
          content_category: product.category || 'Nursery Plant',
          content_ids: product.id ? [String(product.id)] : [],
          content_type: 'product',
          value: (product.price || 0) * (product.quantity || 1),
          currency: 'INR'
        });
      }
    },

    updateQuantity(id, change) {
      let cart = this.getCart();
      const item = cart.find(i => i.id === id);
      if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
          cart = cart.filter(i => i.id !== id);
        }
      }
      this.saveCart(cart);
    },

    removeItem(id) {
      let cart = this.getCart();
      cart = cart.filter(i => i.id !== id);
      this.saveCart(cart);
    },

    getTotalCount() {
      const cart = this.getCart();
      return cart.reduce((sum, i) => sum + i.quantity, 0);
    },

    getTotalPrice() {
      const cart = this.getCart();
      return cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    },

    showToast(msg) {
      const toast = document.getElementById('cartToast');
      const toastMsg = document.getElementById('cartToastMsg');
      if (toast && toastMsg) {
        toastMsg.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2800);
      }
    },

    updateUI() {
      const totalCount = this.getTotalCount();
      const totalPrice = this.getTotalPrice();

      // Navbar badge counts across pages
      const bagBadgeCounts = document.querySelectorAll('#bagBadgeCount');
      bagBadgeCounts.forEach(el => el.textContent = totalCount);

      // Cart drawer header item count
      const cartDrawerItemCount = document.getElementById('cartDrawerItemCount');
      if (cartDrawerItemCount) {
        cartDrawerItemCount.textContent = `${totalCount} item${totalCount !== 1 ? 's' : ''}`;
        cartDrawerItemCount.style.display = totalCount > 0 ? 'inline-block' : 'none';
      }

      // Subtotal & Total in drawer footer (No actual product pricing displayed)
      const cartSubtotal = document.getElementById('cartSubtotal');
      const cartTotal = document.getElementById('cartTotal');
      if (cartSubtotal) cartSubtotal.textContent = `₹0`;
      if (cartTotal) cartTotal.textContent = `₹0`;

      const cartDrawerFooter = document.getElementById('cartDrawerFooter');
      const cartDrawerBody = document.getElementById('cartDrawerBody');

      if (cartDrawerBody) {
        const cart = this.getCart();
        if (cart.length === 0) {
          if (cartDrawerFooter) cartDrawerFooter.style.display = 'none';
          cartDrawerBody.innerHTML = `
            <div class="cart-empty-state">
              <svg class="cart-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <h4 class="cart-empty-title">Your cart is empty</h4>
              <p>Explore our plant catalog and add your favorite plants to order!</p>
              <a href="catalog.html" class="btn-browse-plants" id="cartBrowseBtn">Browse Plants</a>
            </div>
          `;
          const cartBrowseBtn = document.getElementById('cartBrowseBtn');
          if (cartBrowseBtn) {
            cartBrowseBtn.addEventListener('click', () => {
              closeCartDrawer();
            });
          }
        } else {
          if (cartDrawerFooter) cartDrawerFooter.style.display = 'flex';
          cartDrawerBody.innerHTML = cart.map(item => `
            <div class="cart-item-row" data-id="${item.id}">
              <div class="cart-item-img-box">
                <img src="${item.img}" alt="${item.name}" class="cart-item-img" />
              </div>
              <div class="cart-item-details">
                <strong class="cart-item-name">${item.name}</strong>
                <div class="cart-qty-controls">
                  <button class="cart-qty-btn btn-qty-minus" data-id="${item.id}">-</button>
                  <span class="cart-qty-val">${item.quantity}</span>
                  <button class="cart-qty-btn btn-qty-plus" data-id="${item.id}">+</button>
                </div>
              </div>
              <button class="cart-item-remove-btn" data-id="${item.id}" aria-label="Remove item">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          `).join('');

          // Attach listeners to qty +/- and remove buttons inside drawer
          cartDrawerBody.querySelectorAll('.btn-qty-minus').forEach(btn => {
            btn.addEventListener('click', () => {
              this.updateQuantity(btn.getAttribute('data-id'), -1);
            });
          });

          cartDrawerBody.querySelectorAll('.btn-qty-plus').forEach(btn => {
            btn.addEventListener('click', () => {
              this.updateQuantity(btn.getAttribute('data-id'), 1);
            });
          });

          cartDrawerBody.querySelectorAll('.cart-item-remove-btn').forEach(btn => {
            btn.addEventListener('click', () => {
              this.removeItem(btn.getAttribute('data-id'));
            });
          });
        }
      }
    }
  };

  // Initial cart UI update on page load
  CartManager.updateUI();

  // Cart Drawer open/close listeners
  const shoppingBagBtn = document.getElementById('shoppingBagBtn');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartDrawerOverlay = document.getElementById('cartDrawerOverlay');
  const cartCloseBtn = document.getElementById('cartCloseBtn');
  const btnCheckoutWhatsapp = document.getElementById('btnCheckoutWhatsapp');

  function openCartDrawer() {
    if (cartDrawer && cartDrawerOverlay) {
      cartDrawer.classList.add('open');
      cartDrawerOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeCartDrawer() {
    if (cartDrawer && cartDrawerOverlay) {
      cartDrawer.classList.remove('open');
      cartDrawerOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (shoppingBagBtn) {
    shoppingBagBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openCartDrawer();
    });
  }

  if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCartDrawer);
  if (cartDrawerOverlay) cartDrawerOverlay.addEventListener('click', closeCartDrawer);

  // Cart Drawer WhatsApp Complete Order Checkout Listener
  if (btnCheckoutWhatsapp) {
    btnCheckoutWhatsapp.addEventListener('click', () => {
      const cart = CartManager.getCart();
      if (cart.length === 0) {
        CartManager.showToast('Your cart is empty!');
        return;
      }

      let msgLines = ['Hello Sri Vinayaka Nursery! I would like to order the following items from my cart:\n'];
      cart.forEach((item, idx) => {
        msgLines.push(`${idx + 1}. ${item.name} - Qty: ${item.quantity}`);
      });
      msgLines.push('\nPlease confirm availability and doorstep delivery details.');

      const encodedMsg = encodeURIComponent(msgLines.join('\n'));

      // Meta Pixel Lead Event for Cart Drawer WhatsApp Checkout
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'Lead', {
          content_name: cart.map(i => i.name).join(', ') || 'WhatsApp Cart Order',
          content_ids: cart.map(i => String(i.id)),
          content_type: 'product',
          value: CartManager.getTotalPrice(),
          currency: 'INR',
          num_items: CartManager.getTotalCount()
        });
      }

      window.open(`https://wa.me/919959536499?text=${encodedMsg}`, '_blank');
    });
  }

  // 3. Real-Time Alphabetical (A-Z) Search Dropdown Interaction
  function escapeHtmlStr(str) {
    if (!str) return '';
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function getMasterPlantList() {
    if (window.ALL_CATALOG_PLANTS && Array.isArray(window.ALL_CATALOG_PLANTS) && window.ALL_CATALOG_PLANTS.length > 0) {
      return window.ALL_CATALOG_PLANTS;
    }
    return [];
  }

  const searchContainers = document.querySelectorAll('.search-container');
  searchContainers.forEach(container => {
    const searchInput = container.querySelector('.search-input');
    const searchForm = container.querySelector('.search-bar-form');

    if (!searchInput) return;

    let dropdown = container.querySelector('.search-results-dropdown');
    if (!dropdown) {
      dropdown = document.createElement('div');
      dropdown.className = 'search-results-dropdown';
      container.appendChild(dropdown);
    }

    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim().toLowerCase();
      if (!query) {
        dropdown.classList.remove('active');
        dropdown.innerHTML = '';
        return;
      }

      const allPlants = getMasterPlantList();
      if (allPlants.length === 0) {
        dropdown.classList.remove('active');
        return;
      }

      // Filter matching plants (by name, subName, or category)
      let matches = allPlants.filter(plant => {
        const nameMatch = plant.name && plant.name.toLowerCase().includes(query);
        const subMatch = plant.subName && plant.subName.toLowerCase().includes(query);
        const catMatch = plant.category && plant.category.toLowerCase().includes(query);
        return nameMatch || subMatch || catMatch;
      });

      // Sort matching results in ALPHABETICAL (A-Z) order, prioritizing startsWith matches
      matches.sort((a, b) => {
        const aName = (a.name || '').toLowerCase();
        const bName = (b.name || '').toLowerCase();
        const aStarts = aName.startsWith(query);
        const bStarts = bName.startsWith(query);

        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;

        return aName.localeCompare(bName);
      });

      if (matches.length > 0) {
        const displayMatches = matches.slice(0, 18);
        let html = `
          <div class="search-results-header">
            <span>Alphabetical Plant Results A–Z (${matches.length})</span>
          </div>
          <div class="search-results-list">
        `;

        displayMatches.forEach(plant => {
          const imgPath = plant.img || 'image.png';
          const fallbackPath = plant.fallbackImg || 'image.png';
          const subText = plant.subName || plant.category || 'Nursery Plant';

          html += `
            <a href="catalog.html?search=${encodeURIComponent(plant.name)}" class="search-result-item">
              <div class="search-result-thumb">
                <img src="${imgPath}" alt="${escapeHtmlStr(plant.name)}" onerror="this.onerror=null; this.src='${fallbackPath}';" loading="lazy" decoding="async" />
              </div>
              <div class="search-result-info">
                <span class="search-result-title">${escapeHtmlStr(plant.name)}</span>
                <span class="search-result-desc">${escapeHtmlStr(subText)}</span>
              </div>
              <span class="search-result-arrow">→</span>
            </a>
          `;
        });

        html += `</div>`;
        if (matches.length > 18) {
          html += `
            <div class="search-results-footer">
              <a href="catalog.html?search=${encodeURIComponent(query)}">View all ${matches.length} matching plants in catalog →</a>
            </div>
          `;
        }

        dropdown.innerHTML = html;
        dropdown.classList.add('active');
      } else {
        dropdown.innerHTML = `
          <div class="search-no-results">
            <p>🌿 No plants found matching "<strong>${escapeHtmlStr(query)}</strong>"</p>
            <a href="catalog.html" class="search-browse-btn">Browse Complete Plant Catalog →</a>
          </div>
        `;
        dropdown.classList.add('active');
      }
    });

    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        const query = searchInput.value.trim();
        if (query) {
          window.location.href = `catalog.html?search=${encodeURIComponent(query)}`;
          e.preventDefault();
        }
      });
    }

    document.addEventListener('click', (e) => {
      if (!container.contains(e.target)) {
        dropdown.classList.remove('active');
      }
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        dropdown.classList.remove('active');
      }
    });
  });

  // 4. Shop Now CTA Smooth Interaction
  const shopNowBtn = document.getElementById('shopNowBtn');
  if (shopNowBtn && !shopNowBtn.getAttribute('href').includes('catalog.html')) {
    shopNowBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const categoriesSection = document.getElementById('categories');
      if (categoriesSection) {
        categoriesSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // 5. Trending Nursery Collection Carousel Scroll
  const trendingCarouselTrack = document.getElementById('trendingCarouselTrack');
  const trendingPrevBtn = document.getElementById('trendingPrevBtn');
  const trendingNextBtn = document.getElementById('trendingNextBtn');

  if (trendingCarouselTrack && trendingPrevBtn && trendingNextBtn) {
    const scrollAmount = 300;
    trendingPrevBtn.addEventListener('click', () => {
      trendingCarouselTrack.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });
    trendingNextBtn.addEventListener('click', () => {
      trendingCarouselTrack.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });
  }

  // 6. Trusted Testimonials Carousel Navigation
  const testimonialCarouselTrack = document.getElementById('testimonialCarouselTrack');
  const testimonialPrevBtn = document.getElementById('testimonialPrevBtn');
  const testimonialNextBtn = document.getElementById('testimonialNextBtn');

  if (testimonialCarouselTrack && testimonialPrevBtn && testimonialNextBtn) {
    const scrollAmountTestimonial = 360;
    testimonialPrevBtn.addEventListener('click', () => {
      testimonialCarouselTrack.scrollBy({ left: -scrollAmountTestimonial, behavior: 'smooth' });
    });
    testimonialNextBtn.addEventListener('click', () => {
      testimonialCarouselTrack.scrollBy({ left: scrollAmountTestimonial, behavior: 'smooth' });
    });

    let autoScrollInterval = setInterval(() => {
      if (testimonialCarouselTrack.scrollLeft + testimonialCarouselTrack.clientWidth >= testimonialCarouselTrack.scrollWidth - 10) {
        testimonialCarouselTrack.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        testimonialCarouselTrack.scrollBy({ left: 360, behavior: 'smooth' });
      }
    }, 5500);

    testimonialCarouselTrack.addEventListener('mouseenter', () => clearInterval(autoScrollInterval));
    testimonialCarouselTrack.addEventListener('mouseleave', () => {
      clearInterval(autoScrollInterval);
      autoScrollInterval = setInterval(() => {
        if (testimonialCarouselTrack.scrollLeft + testimonialCarouselTrack.clientWidth >= testimonialCarouselTrack.scrollWidth - 10) {
          testimonialCarouselTrack.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          testimonialCarouselTrack.scrollBy({ left: 360, behavior: 'smooth' });
        }
      }, 5500);
    });
  }

  // 7. Catalog Page Category Filtering & Two-Button Product Cards Logic
  const categoryPillsGrid = document.getElementById('categoryPillsGrid');
  const catalogProductsGrid = document.getElementById('catalogProductsGrid');
  const currentCategoryHeading = document.getElementById('currentCategoryHeading');
  const currentCategorySubtitle = document.getElementById('currentCategorySubtitle');

  // Helper generator for range of numbered image files
  function generateRangeItems(start, end, categoryLabel, priceBase) {
    const items = [];
    for (let i = start; i <= end; i++) {
      const itemPrice = priceBase + ((i * 17) % 300);
      items.push({
        id: `plant-${i}`,
        name: `${categoryLabel} #${i}`,
        category: categoryLabel,
        img: `${i}.png`,
        fallbackImg: `image copy ${i}.png`,
        price: itemPrice
      });
    }
    return items;
  }

    // 1. Indoor Plants: Exact 71 Mappings (95.png to 165.png)
    const indoorItems = [
      { id: 'indoor-95', name: 'Spider Plant', subName: 'Chlorophytum comosum · Telugu: స్పైడర్ ప్లాంట్', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '95.png', fallbackImg: 'image copy 95.png', price: 249 },
      { id: 'indoor-96', name: 'Variegated Schefflera', subName: 'Schefflera arboricola · Telugu: అంబ్రెల్లా ప్లాంట్', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '96.png', fallbackImg: 'image copy 96.png', price: 299 },
      { id: 'indoor-97', name: 'Schefflera Arboricola', subName: 'Dwarf Umbrella Tree · Telugu: అంబ్రెల్లా ప్లాంట్', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '97.png', fallbackImg: 'image copy 97.png', price: 299 },
      { id: 'indoor-98', name: 'Areca Palm', subName: 'Dypsis lutescens · Telugu: ఎరికా పామ్', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '98.png', fallbackImg: 'image copy 98.png', price: 349 },
      { id: 'indoor-99', name: 'Massangeana Corn Plant', subName: 'Dracaena fragrans · Telugu: కార్న్ ప్లాంట్', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '99.png', fallbackImg: 'image copy 99.png', price: 399 },
      { id: 'indoor-100', name: 'Peacock Calathea', subName: 'Calathea makoyana · Telugu: నెమలి కాళ్ళ మొక్క', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '100.png', fallbackImg: 'image copy 100.png', price: 349 },
      { id: 'indoor-101', name: 'China Doll Plant', subName: 'Radermachera sinica · Telugu: చైనా డాల్ ప్లాంట్', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '101.png', fallbackImg: 'image copy 101.png', price: 299 },
      { id: 'indoor-102', name: 'Peace Lily', subName: 'Spathiphyllum · Telugu: పీస్ లిల్లీ', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '102.png', fallbackImg: 'image copy 102.png', price: 299 },
      { id: 'indoor-103', name: 'Parlour Palm', subName: 'Chamaedorea elegans · Telugu: పార్లర్ పామ్', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '103.png', fallbackImg: 'image copy 103.png', price: 349 },
      { id: 'indoor-104', name: 'Rattlesnake Calathea', subName: 'Calathea insignis · Telugu: కలాథియా', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '104.png', fallbackImg: 'image copy 104.png', price: 349 },
      { id: 'indoor-105', name: 'N-Joy Pothos', subName: 'Epipremnum aureum N-Joy · Telugu: మనీ ప్లాంట్ ఎన్‌జాయ్', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '105.png', fallbackImg: 'image copy 105.png', price: 199 },
      { id: 'indoor-106', name: 'Golden Pothos', subName: 'Epipremnum aureum · Telugu: మనీ ప్లాంట్', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '106.png', fallbackImg: 'image copy 106.png', price: 199 },
      { id: 'indoor-107', name: 'Neon Pothos', subName: 'Epipremnum aureum Neon · Telugu: నియాన్ మనీ ప్లాంట్', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '107.png', fallbackImg: 'image copy 107.png', price: 249 },
      { id: 'indoor-108', name: 'Satin Pothos', subName: 'Scindapsus pictus · Telugu: సిల్వర్ మనీ ప్లాంట్', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '108.png', fallbackImg: 'image copy 108.png', price: 299 },
      { id: 'indoor-109', name: 'Golden Pothos Pole', subName: 'Epipremnum aureum · Telugu: స్టిక్ మనీ ప్లాంట్', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '109.png', fallbackImg: 'image copy 109.png', price: 349 },
      { id: 'indoor-110', name: 'Pink Aglaonema', subName: 'Aglaonema Chinese Evergreen · Telugu: అగ్లోనెమా పింక్', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '110.png', fallbackImg: 'image copy 110.png', price: 349 },
      { id: 'indoor-111', name: 'Aglaonema Lipstick', subName: 'Aglaonema SIAM Aurora · Telugu: లిప్‌స్టిక్ అగ్లోనెమా', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '111.png', fallbackImg: 'image copy 111.png', price: 349 },
      { id: 'indoor-112', name: 'Red Aglaonema', subName: 'Aglaonema Red Valentine · Telugu: రెడ్ అగ్లోనెమా', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '112.png', fallbackImg: 'image copy 112.png', price: 399 },
      { id: 'indoor-113', name: 'Aglaonema White Rain', subName: 'Aglaonema Super White · Telugu: వైట్ అగ్లోనెమా', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '113.png', fallbackImg: 'image copy 113.png', price: 399 },
      { id: 'indoor-114', name: 'Aglaonema Snow White', subName: 'Aglaonema Snow White · Telugu: స్నో వైట్ అగ్లోనెమా', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '114.png', fallbackImg: 'image copy 114.png', price: 349 },
      { id: 'indoor-115', name: 'Aglaonema Cutlass', subName: 'Aglaonema Silver Bay · Telugu: సిల్వర్ అగ్లోనెమా', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '115.png', fallbackImg: 'image copy 115.png', price: 349 },
      { id: 'indoor-116', name: 'Aglaonema Anyamanee', subName: 'Aglaonema Tricolor · Telugu: త్రివర్ణ అగ్లోనెమా', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '116.png', fallbackImg: 'image copy 116.png', price: 399 },
      { id: 'indoor-117', name: 'Aglaonema Spring Snow', subName: 'Aglaonema Spring Snow · Telugu: స్ప్రింగ్ అగ్లోనెమా', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '117.png', fallbackImg: 'image copy 117.png', price: 349 },
      { id: 'indoor-118', name: 'Aglaonema Lady Valentine', subName: 'Aglaonema Pink Star · Telugu: పింక్ స్టార్ అగ్లోనెమా', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '118.png', fallbackImg: 'image copy 118.png', price: 399 },
      { id: 'indoor-119', name: 'Monstera Deliciosa', subName: 'Swiss Cheese Plant · Telugu: మోన్‌స్టెరా', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '119.png', fallbackImg: 'image copy 119.png', price: 499 },
      { id: 'indoor-120', name: 'Monstera Peru', subName: 'Karstenianum · Telugu: మోన్‌స్టెరా పెరూ', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '120.png', fallbackImg: 'image copy 120.png', price: 499 },
      { id: 'indoor-121', name: 'Alocasia Silver Dragon', subName: 'Alocasia baginda · Telugu: అలోకేసియా', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '121.png', fallbackImg: 'image copy 121.png', price: 449 },
      { id: 'indoor-122', name: 'Caladium Variegated', subName: 'Heart of Jesus · Telugu: కలాడియం', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '122.png', fallbackImg: 'image copy 122.png', price: 299 },
      { id: 'indoor-123', name: 'Echeveria Elegans', subName: 'Mexican Snow Rose · Telugu: సక్యులెంట్', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '123.png', fallbackImg: 'image copy 123.png', price: 199 },
      { id: 'indoor-124', name: 'Haworthia Zebra', subName: 'Zebra Cactus · Telugu: జీబ్రా కాక్టస్', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '124.png', fallbackImg: 'image copy 124.png', price: 199 },
      { id: 'indoor-125', name: 'Haworthia Limifolia', subName: 'Fairy Elephant Feet · Telugu: సక్యులెంట్', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '125.png', fallbackImg: 'image copy 125.png', price: 199 },
      { id: 'indoor-126', name: 'Echeveria Purple Pearl', subName: 'Echeveria Purple Pearl · Telugu: పర్పల్ సక్యులెంట్', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '126.png', fallbackImg: 'image copy 126.png', price: 199 },
      { id: 'indoor-127', name: 'Echeveria Agavoides', subName: 'Molded Wax Succulent · Telugu: సక్యులెంట్', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '127.png', fallbackImg: 'image copy 127.png', price: 199 },
      { id: 'indoor-128', name: 'Moon Cactus Red', subName: 'Gymnocalycium mihanovichii · Telugu: రెడ్ కాక్టస్', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '128.png', fallbackImg: 'image copy 128.png', price: 249 },
      { id: 'indoor-129', name: 'Sedum Morganianum', subName: 'Donkey Tail · Telugu: డంకీ టైల్ సక్యులెంట్', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '129.png', fallbackImg: 'image copy 129.png', price: 249 },
      { id: 'indoor-130', name: 'Echeveria Black Prince', subName: 'Black Succulent · Telugu: బ్లాక్ ప్రిన్స్ సక్యులెంట్', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '130.png', fallbackImg: 'image copy 130.png', price: 199 },
      { id: 'indoor-131', name: 'ZZ Plant Green', subName: 'Zamioculcas zamiifolia · Telugu: జి జి ప్లాంట్', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '131.png', fallbackImg: 'image copy 131.png', price: 349 },
      { id: 'indoor-132', name: 'Raven ZZ Plant', subName: 'Black ZZ Plant · Telugu: నల్ల జి జి ప్లాంట్', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '132.png', fallbackImg: 'image copy 132.png', price: 499 },
      { id: 'indoor-133', name: 'Syngonium Pink', subName: 'Pink Arrowhead · Telugu: పింక్ సింగోనియం', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '133.png', fallbackImg: 'image copy 133.png', price: 249 },
      { id: 'indoor-134', name: 'Syngonium White Butterfly', subName: 'Arrowhead Vine · Telugu: వైట్ సింగోనియం', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '134.png', fallbackImg: 'image copy 134.png', price: 199 },
      { id: 'indoor-135', name: 'Syngonium Pixie', subName: 'Mini Arrowhead · Telugu: మినీ సింగోనియం', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '135.png', fallbackImg: 'image copy 135.png', price: 199 },
      { id: 'indoor-136', name: 'Ficus Microcarpa Bonsai', subName: 'Ginseng Ficus · Telugu: ఫైకస్ బోన్సాయ్', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '136.png', fallbackImg: 'image copy 136.png', price: 699 },
      { id: 'indoor-137', name: 'Ficus Bonsai Braided', subName: 'Ficus Retusa · Telugu: ఫైకస్ అల్లిక బోన్సాయ్', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '137.png', fallbackImg: 'image copy 137.png', price: 799 },
      { id: 'indoor-138', name: 'Thuja Orientalis Cypress', subName: 'Morpankhi · Telugu: నెమలి పింఛం చెట్టు', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '138.png', fallbackImg: 'image copy 138.png', price: 349 },
      { id: 'indoor-139', name: 'Pachira Aquatica', subName: 'Money Tree Braided · Telugu: మనీ ట్రీ', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '139.png', fallbackImg: 'image copy 139.png', price: 599 },
      { id: 'indoor-140', name: 'Anthurium Red', subName: 'Flamingo Flower · Telugu: ఆంథూరియం ఎరుపు', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '140.png', fallbackImg: 'image copy 140.png', price: 449 },
      { id: 'indoor-141', name: 'Anthurium Pink', subName: 'Flamingo Flower · Telugu: ఆంథూరియం పింక్', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '141.png', fallbackImg: 'image copy 141.png', price: 449 },
      { id: 'indoor-142', name: 'Crassula Ovata Jade', subName: 'Jade Plant · Telugu: జేడ్ ప్లాంట్', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '142.png', fallbackImg: 'image copy 142.png', price: 249 },
      { id: 'indoor-143', name: 'Crassula Campfire', subName: 'Campfire Succulent · Telugu: క్యాంప్‌ఫైర్ సక్యులెంట్', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '143.png', fallbackImg: 'image copy 143.png', price: 249 },
      { id: 'indoor-144', name: 'Sansveria Trifasciata', subName: 'Snake Plant · Telugu: స్నేక్ ప్లాంట్', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '144.png', fallbackImg: 'image copy 144.png', price: 299 },
      { id: 'indoor-145', name: 'Sansevieria Laurentii', subName: 'Yellow Variegated Snake Plant · Telugu: స్నేక్ ప్లాంట్', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '145.png', fallbackImg: 'image copy 145.png', price: 349 },
      { id: 'indoor-146', name: 'Sansevieria Hahnii', subName: 'Bird Nest Snake Plant · Telugu: డా్వర్ఫ్ స్నేక్ ప్లాంట్', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '146.png', fallbackImg: 'image copy 146.png', price: 249 },
      { id: 'indoor-147', name: 'Sansevieria Cylindrica', subName: 'Cylindrical Snake Plant · Telugu: సిలిండ్రికల్ స్నేక్ ప్లాంట్', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '147.png', fallbackImg: 'image copy 147.png', price: 349 },
      { id: 'indoor-148', name: 'Sansevieria Moonshine', subName: 'Silver Snake Plant · Telugu: సిల్వర్ స్నేక్ ప్లాంట్', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '148.png', fallbackImg: 'image copy 148.png', price: 349 },
      { id: 'indoor-149', name: 'Philodendron Oxycardium Green', subName: 'Heartleaf Philodendron · Telugu: హార్ట్‌లీఫ్ ఫిలోడెండ్రాన్', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '149.png', fallbackImg: 'image copy 149.png', price: 249 },
      { id: 'indoor-150', name: 'Philodendron Brasil', subName: 'Variegated Heartleaf · Telugu: బ్రెజిల్ ఫిలోడెండ్రాన్', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '150.png', fallbackImg: 'image copy 150.png', price: 299 },
      { id: 'indoor-151', name: 'Philodendron Lime Lemon', subName: 'Neon Philodendron · Telugu: నియాన్ ఫిలోడెండ్రాన్', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '151.png', fallbackImg: 'image copy 151.png', price: 299 },
      { id: 'indoor-152', name: 'Philodendron Xanadu', subName: 'Winterbourn · Telugu: జనాడూ ఫిలోడెండ్రాన్', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '152.png', fallbackImg: 'image copy 152.png', price: 349 },
      { id: 'indoor-153', name: 'Philodendron Birkin', subName: 'White Stripe Philodendron · Telugu: బిర్కిన్ ఫిలోడెండ్రాన్', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '153.png', fallbackImg: 'image copy 153.png', price: 399 },
      { id: 'indoor-154', name: 'Philodendron Pink Princess', subName: 'Pink Variegated · Telugu: పింక్ ప్రిన్సెస్ ఫిలోడెండ్రాన్', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '154.png', fallbackImg: 'image copy 154.png', price: 599 },
      { id: 'indoor-155', name: 'Philodendron Ring of Fire', subName: 'Hendersonii Variegated · Telugu: రింగ్ ఆఫ్ ఫైర్ ఫిలోడెండ్రాన్', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '155.png', fallbackImg: 'image copy 155.png', price: 649 },
      { id: 'indoor-156', name: 'Philodendron Prince of Orange', subName: 'Orange Leaf Philodendron · Telugu: ప్రిన్స్ ఆఫ్ ఆరెంజ్', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '156.png', fallbackImg: 'image copy 156.png', price: 449 },
      { id: 'indoor-157', name: 'Philodendron Ceylon Gold', subName: 'Golden Philodendron · Telugu: గోల్డెన్ ఫిలోడెండ్రాన్', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '157.png', fallbackImg: 'image copy 157.png', price: 349 },
      { id: 'indoor-158', name: 'Peperomia obtusifolia Green', subName: 'Baby Rubber Plant · Telugu: పెపెరోమియా', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '158.png', fallbackImg: 'image copy 158.png', price: 249 },
      { id: 'indoor-159', name: 'Peperomia Variegated', subName: 'Marble Baby Rubber · Telugu: మార్బుల్ పెపెరోమియా', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '159.png', fallbackImg: 'image copy 159.png', price: 249 },
      { id: 'indoor-160', name: 'Peperomia Watermelon', subName: 'Peperomia argyreia · Telugu: వాటర్‌మెలన్ పెపెరోమియా', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '160.png', fallbackImg: 'image copy 160.png', price: 299 },
      { id: 'indoor-161', name: 'Ctenanthe Burle-Marxii', subName: 'Fishbone Prayer Plant · Telugu: ఫిష్‌బోన్ కలాథియా', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '161.png', fallbackImg: 'image copy 161.png', price: 349 },
      { id: 'indoor-162', name: 'Calathea Ornata', subName: 'Pinstripe Calathea · Telugu: పిన్‌స్ట్రైప్ కలాథియా', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '162.png', fallbackImg: 'image copy 162.png', price: 349 },
      { id: 'indoor-163', name: 'Calathea Triostar', subName: 'Stromanthe sanguinea · Telugu: ట్రైకలర్ కలాథియా', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '163.png', fallbackImg: 'image copy 163.png', price: 399 },
      { id: 'indoor-164', name: 'Ficus Lyrata', subName: 'Fiddle Leaf Fig · Telugu: ఫిడేల్ లీఫ్ ఫిగ్', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '164.png', fallbackImg: 'image copy 164.png', price: 499 },
      { id: 'indoor-165', name: 'Ficus Elastica Burgundy', subName: 'Rubber Plant Burgundy · Telugu: రబ్బర్ ప్లాంట్', overlayTag: 'Indoor Plants', category: 'Indoor Plant', img: '165.png', fallbackImg: 'image copy 165.png', price: 349 }
    ];

    // 2. Palms: Exact 20 Mappings (29.png to 48.png)
    const palmsItems = [
      { id: 'palm-29', name: 'Foxtail Palm', overlayTag: 'Palm', category: 'Palm Variety', img: '29.png', fallbackImg: 'image copy 29.png', price: 399 },
      { id: 'palm-30', name: 'Red Latan Palm', overlayTag: 'Palm', category: 'Palm Variety', img: '30.png', fallbackImg: 'image copy 30.png', price: 399 },
      { id: 'palm-31', name: 'Cardboard Palm', overlayTag: 'Palm', category: 'Palm Variety', img: '31.png', fallbackImg: 'image copy 31.png', price: 399 },
      { id: 'palm-32', name: 'Royal Palm', overlayTag: 'Palm', category: 'Palm Variety', img: '32.png', fallbackImg: 'image copy 32.png', price: 399 },
      { id: 'palm-33', name: 'Areca Palm', overlayTag: 'Palm', category: 'Palm Variety', img: '33.png', fallbackImg: 'image copy 33.png', price: 399 },
      { id: 'palm-34', name: 'Bottle Palm', overlayTag: 'Palm', category: 'Palm Variety', img: '34.png', fallbackImg: 'image copy 34.png', price: 399 },
      { id: 'palm-35', name: 'Champion / Chinese Fan Palm', overlayTag: 'Palm', category: 'Palm Variety', img: '35.png', fallbackImg: 'image copy 35.png', price: 399 },
      { id: 'palm-36', name: 'Wild Date Palm (Silver)', overlayTag: 'Palm', category: 'Palm Variety', img: '36.png', fallbackImg: 'image copy 36.png', price: 399 },
      { id: 'palm-37', name: 'Travellers Palm', overlayTag: 'Palm', category: 'Palm Variety', img: '37.png', fallbackImg: 'image copy 37.png', price: 399 },
      { id: 'palm-38', name: 'Fishtail Palm', overlayTag: 'Palm', category: 'Palm Variety', img: '38.png', fallbackImg: 'image copy 38.png', price: 399 },
      { id: 'palm-39', name: 'Washingtonia Palm', overlayTag: 'Palm', category: 'Palm Variety', img: '39.png', fallbackImg: 'image copy 39.png', price: 399 },
      { id: 'palm-40', name: 'Sylvester Dwarf Date', overlayTag: 'Palm', category: 'Palm Variety', img: '40.png', fallbackImg: 'image copy 40.png', price: 399 },
      { id: 'palm-41', name: 'Bismarck Palm', overlayTag: 'Palm', category: 'Palm Variety', img: '41.png', fallbackImg: 'image copy 41.png', price: 399 },
      { id: 'palm-42', name: 'Spindle Palm', overlayTag: 'Palm', category: 'Palm Variety', img: '42.png', fallbackImg: 'image copy 42.png', price: 399 },
      { id: 'palm-43', name: 'Sago Palm (Cycas)', overlayTag: 'Palm', category: 'Palm Variety', img: '43.png', fallbackImg: 'image copy 43.png', price: 399 },
      { id: 'palm-44', name: 'Coconut Palm (Landscape)', overlayTag: 'Palm', category: 'Palm Variety', img: '44.png', fallbackImg: 'image copy 44.png', price: 399 },
      { id: 'palm-45', name: 'Veitchia Merrillii (Christmas Palm)', overlayTag: 'Palm', category: 'Palm Variety', img: '45.png', fallbackImg: 'image copy 45.png', price: 399 },
      { id: 'palm-46', name: 'Veitchia Golden Palm', overlayTag: 'Palm', category: 'Palm Variety', img: '46.png', fallbackImg: 'image copy 46.png', price: 399 },
      { id: 'palm-47', name: 'Rhapis Excelsa (Lady Palm)', overlayTag: 'Palm', category: 'Palm Variety', img: '47.png', fallbackImg: 'image copy 47.png', price: 479 },
      { id: 'palm-48', name: 'Palmyra Palm', overlayTag: 'Palm', category: 'Palm Variety', img: '48.png', fallbackImg: 'image copy 48.png', price: 489 }
    ];

    // 3. Flowering Plants: Exact 32 Mappings (49.png to 80.png)
    const floweringItems = [
      { id: 'flower-49', name: 'Ylang Ylang', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '49.png', fallbackImg: 'image copy 49.png', price: 199 },
      { id: 'flower-50', name: 'Euphorbia Milii', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '50.png', fallbackImg: 'image copy 50.png', price: 199 },
      { id: 'flower-51', name: 'Euphorbia Punicea (Jamaican Poinsettia)', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '51.png', fallbackImg: 'image copy 51.png', price: 199 },
      { id: 'flower-52', name: 'Coleus (Assorted Colours)', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '52.png', fallbackImg: 'image copy 52.png', price: 199 },
      { id: 'flower-53', name: 'Bougainvillea (All Colours)', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '53.png', fallbackImg: 'image copy 53.png', price: 199 },
      { id: 'flower-54', name: 'Hibiscus (Assorted)', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '54.png', fallbackImg: 'image copy 54.png', price: 199 },
      { id: 'flower-55', name: 'Texas Sage (Purple Sage)', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '55.png', fallbackImg: 'image copy 55.png', price: 199 },
      { id: 'flower-56', name: 'Orange Jasmine (Kamini)', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '56.png', fallbackImg: 'image copy 56.png', price: 199 },
      { id: 'flower-57', name: 'Blue Daze (Dwarf Morning Glory)', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '57.png', fallbackImg: 'image copy 57.png', price: 199 },
      { id: 'flower-58', name: 'Portulaca (Moss Rose)', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '58.png', fallbackImg: 'image copy 58.png', price: 199 },
      { id: 'flower-59', name: 'Ruellia Simplex (Mexican Petunia)', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '59.png', fallbackImg: 'image copy 59.png', price: 199 },
      { id: 'flower-60', name: 'Plumeria (Frangipani)', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '60.png', fallbackImg: 'image copy 60.png', price: 199 },
      { id: 'flower-61', name: 'Plumeria Alba (White Frangipani)', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '61.png', fallbackImg: 'image copy 61.png', price: 199 },
      { id: 'flower-62', name: 'Plumeria Singaporensis (Singapore Frangipani)', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '62.png', fallbackImg: 'image copy 62.png', price: 199 },
      { id: 'flower-63', name: 'Plumeria Gold (Golden Frangipani)', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '63.png', fallbackImg: 'image copy 63.png', price: 199 },
      { id: 'flower-64', name: 'Ixora Mini (Dwarf)', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '64.png', fallbackImg: 'image copy 64.png', price: 199 },
      { id: 'flower-65', name: 'Thai Ixora', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '65.png', fallbackImg: 'image copy 65.png', price: 199 },
      { id: 'flower-66', name: 'Crape Jasmine (Nandivardanam)', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '66.png', fallbackImg: 'image copy 66.png', price: 199 },
      { id: 'flower-67', name: 'Raat Ki Rani', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '67.png', fallbackImg: 'image copy 67.png', price: 199 },
      { id: 'flower-68', name: 'Marigold Hybrid', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '68.png', fallbackImg: 'image copy 68.png', price: 199 },
      { id: 'flower-69', name: 'Rose Desi Gulab', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '69.png', fallbackImg: 'image copy 69.png', price: 199 },
      { id: 'flower-70', name: 'Button Rose Mini', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '70.png', fallbackImg: 'image copy 70.png', price: 199 },
      { id: 'flower-71', name: 'Camellia', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '71.png', fallbackImg: 'image copy 71.png', price: 199 },
      { id: 'flower-72', name: 'Hydrangea', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '72.png', fallbackImg: 'image copy 72.png', price: 199 },
      { id: 'flower-73', name: 'Russelia', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '73.png', fallbackImg: 'image copy 73.png', price: 199 },
      { id: 'flower-74', name: 'Pentas Mixed Colours', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '74.png', fallbackImg: 'image copy 74.png', price: 199 },
      { id: 'flower-75', name: 'Kanakambaram', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '75.png', fallbackImg: 'image copy 75.png', price: 199 },
      { id: 'flower-76', name: 'Champa (Sampangi)', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '76.png', fallbackImg: 'image copy 76.png', price: 199 },
      { id: 'flower-77', name: 'Tecoma Yellow Bells', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '77.png', fallbackImg: 'image copy 77.png', price: 199 },
      { id: 'flower-78', name: 'Parijatham (Night Jasmine)', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '78.png', fallbackImg: 'image copy 78.png', price: 199 },
      { id: 'flower-79', name: 'Water Heliconia', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '79.png', fallbackImg: 'image copy 79.png', price: 199 },
      { id: 'flower-80', name: 'Peacock Flower (Caesalpinia pulcherrima)', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '80.png', fallbackImg: 'image copy 80.png', price: 199 }
    ];

    // 4. Ornamental Plants: Exact 14 Mappings (81.png to 94.png)
    const ornamentalItems = [
      { id: 'ornamental-81', name: 'Calathea Lutea (Cuban Cigar)', overlayTag: 'Ornamental Plant', category: 'Ornamental Plant', img: '81.png', fallbackImg: 'image copy 81.png', price: 279 },
      { id: 'ornamental-82', name: 'Bird of Paradise (Orange)', overlayTag: 'Ornamental Plant', category: 'Ornamental Plant', img: '82.png', fallbackImg: 'image copy 82.png', price: 279 },
      { id: 'ornamental-83', name: 'Ornamental Banana (Red)', overlayTag: 'Ornamental Plant', category: 'Ornamental Plant', img: '83.png', fallbackImg: 'image copy 83.png', price: 279 },
      { id: 'ornamental-84', name: 'Hibiscus Tiliaceus Rubra', overlayTag: 'Ornamental Plant', category: 'Ornamental Plant', img: '84.png', fallbackImg: 'image copy 84.png', price: 279 },
      { id: 'ornamental-85', name: 'Ficus Starlight', overlayTag: 'Ornamental Plant', category: 'Ornamental Plant', img: '85.png', fallbackImg: 'image copy 85.png', price: 279 },
      { id: 'ornamental-86', name: 'Ficus Black', overlayTag: 'Ornamental Plant', category: 'Ornamental Plant', img: '86.png', fallbackImg: 'image copy 86.png', price: 279 },
      { id: 'ornamental-87', name: 'Ficus Panda', overlayTag: 'Ornamental Plant', category: 'Ornamental Plant', img: '87.png', fallbackImg: 'image copy 87.png', price: 279 },
      { id: 'ornamental-88', name: 'Croton Assorted', overlayTag: 'Ornamental Plant', category: 'Ornamental Plant', img: '88.png', fallbackImg: 'image copy 88.png', price: 279 },
      { id: 'ornamental-89', name: 'Song of India', overlayTag: 'Ornamental Plant', category: 'Ornamental Plant', img: '89.png', fallbackImg: 'image copy 89.png', price: 279 },
      { id: 'ornamental-90', name: 'Thuja Golden', overlayTag: 'Ornamental Plant', category: 'Ornamental Plant', img: '90.png', fallbackImg: 'image copy 90.png', price: 279 },
      { id: 'ornamental-91', name: 'Golden Cypress', overlayTag: 'Ornamental Plant', category: 'Ornamental Plant', img: '91.png', fallbackImg: 'image copy 91.png', price: 279 },
      { id: 'ornamental-92', name: 'Terminalia Mantaly Variegated', overlayTag: 'Ornamental Plant', category: 'Ornamental Plant', img: '92.png', fallbackImg: 'image copy 92.png', price: 279 },
      { id: 'ornamental-93', name: 'Terminalia Mantaly Green', overlayTag: 'Ornamental Plant', category: 'Ornamental Plant', img: '93.png', fallbackImg: 'image copy 93.png', price: 279 },
      { id: 'ornamental-94', name: 'Spanish Cherry Variegated', overlayTag: 'Ornamental Plant', category: 'Ornamental Plant', img: '94.png', fallbackImg: 'image copy 94.png', price: 279 }
    ];

    // 5. Ficus / Bonsai Plants: Exact 10 Mappings (166.png to 175.png)
    const bonsaiItems = [
      { id: 'ficus-166', name: 'Ficus Plant', hideName: true, overlayTag: 'Ficus Plants', category: 'Ficus Plants', img: '166.png', fallbackImg: 'image copy 166.png', price: 699 },
      { id: 'ficus-167', name: 'Ficus Plant', hideName: true, overlayTag: 'Ficus Plants', category: 'Ficus Plants', img: '167.png', fallbackImg: 'image copy 167.png', price: 699 },
      { id: 'ficus-168', name: 'Ficus Plant', hideName: true, overlayTag: 'Ficus Plants', category: 'Ficus Plants', img: '168.png', fallbackImg: 'image copy 168.png', price: 699 },
      { id: 'ficus-169', name: 'Ficus Plant', hideName: true, overlayTag: 'Ficus Plants', category: 'Ficus Plants', img: '169.png', fallbackImg: 'image copy 169.png', price: 699 },
      { id: 'ficus-170', name: 'Ficus Plant', hideName: true, overlayTag: 'Ficus Plants', category: 'Ficus Plants', img: '170.png', fallbackImg: 'image copy 170.png', price: 699 },
      { id: 'ficus-171', name: 'Ficus Plant', hideName: true, overlayTag: 'Ficus Plants', category: 'Ficus Plants', img: '171.png', fallbackImg: 'image copy 171.png', price: 699 },
      { id: 'ficus-172', name: 'Ficus Plant', hideName: true, overlayTag: 'Ficus Plants', category: 'Ficus Plants', img: '172.png', fallbackImg: 'image copy 172.png', price: 699 },
      { id: 'ficus-173', name: 'Ficus Plant', hideName: true, overlayTag: 'Ficus Plants', category: 'Ficus Plants', img: '173.png', fallbackImg: 'image copy 173.png', price: 699 },
      { id: 'ficus-174', name: 'Ficus Plant', hideName: true, overlayTag: 'Ficus Plants', category: 'Ficus Plants', img: '174.png', fallbackImg: 'image copy 174.png', price: 699 },
      { id: 'ficus-175', name: 'Ficus Plant', hideName: true, overlayTag: 'Ficus Plants', category: 'Ficus Plants', img: '175.png', fallbackImg: 'image copy 175.png', price: 699 }
    ];

    // 6. Fruit Plants: Complete 46 Mappings (178.png to 190.png + image copy 197.png to 229.png)
    const fruitItems = [
      { id: 'fruit-178', name: 'Rambutan Yellow', subName: 'Nephelium lappaceum · Telugu: ఎల్లో రాంబుటాన్', overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: '178.png', fallbackImg: 'image copy 178.png', price: 499 },
      { id: 'fruit-179', name: 'Taiwan Red Papaya', subName: 'Carica papaya · Telugu: పొట్టి బొప్పాయి', overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: '179.png', fallbackImg: 'image copy 179.png', price: 199 },
      { id: 'fruit-180', name: 'Jamun (Black Plum)', subName: 'Syzygium cumini · Telugu: నేరేడు', overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: '180.png', fallbackImg: 'image copy 180.png', price: 299 },
      { id: 'fruit-181', name: 'White Jamun', subName: 'Syzygium samarangense · Telugu: తెల్ల నేరేడు', overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: '181.png', fallbackImg: 'image copy 181.png', price: 349 },
      { id: 'fruit-182', name: 'Custard Apple (Seethaphal)', subName: 'Annona squamosa · Telugu: సీతాఫలం', overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: '182.png', fallbackImg: 'image copy 182.png', price: 249 },
      { id: 'fruit-183', name: 'Water Apple (Rose Apple)', subName: 'Syzygium aqueum · Telugu: గులాబి జామ / వాటర్ ఆపిల్', overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: '183.png', fallbackImg: 'image copy 183.png', price: 299 },
      { id: 'fruit-184', name: 'Jackfruit Grafted', subName: 'Artocarpus heterophyllus · Telugu: పనస', overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: '184.png', fallbackImg: 'image copy 184.png', price: 349 },
      { id: 'fruit-185', name: 'Engkala Fruit', subName: 'Litsea garciae · Telugu: ఎంగ్ కాల', overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: '185.png', fallbackImg: 'image copy 185.png', price: 499 },
      { id: 'fruit-186', name: 'Seedless Jackfruit', subName: 'Artocarpus heterophyllus · Telugu: పనస సీడ్ లెస్', overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: '186.png', fallbackImg: 'image copy 186.png', price: 449 },
      { id: 'fruit-187', name: 'Bobbili Pichu Mango', subName: 'Mangifera indica · Telugu: బొబ్బిలి పీచు మామిడి', overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: '187.png', fallbackImg: 'image copy 187.png', price: 399 },
      { id: 'fruit-188', name: 'Swethamrutam Mango', subName: 'Mangifera indica · Telugu: శ్వేతామృతం మామిడి', overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: '188.png', fallbackImg: 'image copy 188.png', price: 399 },
      { id: 'fruit-189', name: 'Amrutam Mango', subName: 'Mangifera indica · Telugu: అమృతం మామిడి', overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: '189.png', fallbackImg: 'image copy 189.png', price: 399 },
      { id: 'fruit-190', name: 'Black Sapote (Chocolate Pudding Fruit)', subName: 'Diospyros nigra · Telugu: సపోటా - బ్లాక్', overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: '190.png', fallbackImg: 'image copy 190.png', price: 499 },
      { id: 'fruit-197', name: 'Longan (Dragon Eye)', subName: 'Dimocarpus longan · Telugu: లాంగన్ ఫ్రూట్', overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: 'image copy 197.png', fallbackImg: 'image copy 197.png', price: 499 },
      { id: 'fruit-198', name: 'Mamey Sapote', subName: 'Pouteria sapota · Telugu: మామే సపోటా', overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: 'image copy 198.png', fallbackImg: 'image copy 198.png', price: 599 },
      { id: 'fruit-199', name: 'Avocado (Butter Fruit)', subName: 'Persea americana · Telugu: ఆవకాడో / వెన్న పండు', overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: 'image copy 199.png', fallbackImg: 'image copy 199.png', price: 399 },
      { id: 'fruit-200', name: 'Abiu Fruit', subName: 'Pouteria caimito · Telugu: అబియు ఫ్రూట్', overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: 'image copy 200.png', fallbackImg: 'image copy 200.png', price: 549 },
      { id: 'fruit-201', name: 'HRMN-99 Red Apple', subName: 'Warm Climate Apple · Telugu: HRMN-99 రెడ్ ఆపిల్', overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: 'image copy 201.png', fallbackImg: 'image copy 201.png', price: 449 },
      { id: 'fruit-202', name: 'Green Avocado Grafted', subName: 'Persea americana · Telugu: గ్రీన్ ఆవకాడో', overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: 'image copy 202.png', fallbackImg: 'image copy 202.png', price: 399 },
      { id: 'fruit-203', name: 'Acai Berry', subName: 'Euterpe oleracea · Telugu: అసాయ్ బెర్రీ', overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: 'image copy 203.png', fallbackImg: 'image copy 203.png', price: 499 },
      { id: 'fruit-204', name: 'Allspice Tree', subName: 'Pimenta dioica · Telugu: ఆల్‌స్పైస్ మొక్క', overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: 'image copy 204.png', fallbackImg: 'image copy 204.png', price: 349 },
      { id: 'fruit-205', name: 'Orange Custard Apple', subName: 'Annona squamosa · Telugu: ఆరెంజ్ సీతాఫలం', overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: 'image copy 205.png', fallbackImg: 'image copy 205.png', price: 349 },
      { id: 'fruit-206', name: 'Red Dragon Fruit', subName: 'Hylocereus costaricensis · Telugu: రెడ్ డ్రాగన్ ఫ్రూట్', overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: 'image copy 206.png', fallbackImg: 'image copy 206.png', price: 299 },
      { id: 'fruit-207', name: 'Durian Fruit', subName: 'Durio zibethinus · Telugu: డురియాన్', overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: 'image copy 207.png', fallbackImg: 'image copy 207.png', price: 799 },
      { id: 'fruit-208', name: 'Miyazaki Red Mango', subName: 'World Most Expensive Mango · Telugu: మియాజాకి మామిడి', overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: 'image copy 208.png', fallbackImg: 'image copy 208.png', price: 899 },
      { id: 'fruit-209', name: 'Red Custard Apple (Anona)', subName: 'Annona reticulata · Telugu: ఎర్ర సీతాఫలం', overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: 'image copy 209.png', fallbackImg: 'image copy 209.png', price: 399 },
      { id: 'fruit-210', name: 'Golden Jackfruit (Vietnamese)', subName: 'Artocarpus heterophyllus · Telugu: బంగారు పనస', overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: 'image copy 210.png', fallbackImg: 'image copy 210.png', price: 449 },
      { id: 'fruit-211', name: 'Australian Finger Lime', subName: 'Citrus australasica · Telugu: ఫింగర్ లైమ్', overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: 'image copy 211.png', fallbackImg: 'image copy 211.png', price: 599 },
      { id: 'fruit-212', name: 'Gac Fruit', subName: 'Momordica cochinchinensis · Telugu: గాక్ ఫ్రూట్', overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: 'image copy 212.png', fallbackImg: 'image copy 212.png', price: 499 },
      { id: 'fruit-213', name: 'All-Season Red Jackfruit', subName: 'Super Early Jackfruit · Telugu: రెడ్ పనస', overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: 'image copy 213.png', fallbackImg: 'image copy 213.png', price: 499 },
      { id: 'fruit-214', name: 'Soursop (Laxman Phal)', subName: 'Annona muricata · Telugu: లక్ష్మణ ఫలం', overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: 'image copy 214.png', fallbackImg: 'image copy 214.png', price: 399 },
      { id: 'fruit-215', name: 'Purple Mango (Tommy Atkins)', subName: 'Mangifera indica · Telugu: పర్పల్ మామిడి', overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: 'image copy 215.png', fallbackImg: 'image copy 215.png', price: 499 },
      { id: 'fruit-216', name: 'Anna Apple Grafted', subName: 'Low-Chill Apple Variety · Telugu: అన్నా ఆపిల్', overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: 'image copy 216.png', fallbackImg: 'image copy 216.png', price: 449 },
      { id: 'fruit-217', name: 'Green Olive Tree', subName: 'Olea europaea · Telugu: ఆలివ్ చెట్టు', overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: 'image copy 217.png', fallbackImg: 'image copy 217.png', price: 499 },
      { id: 'fruit-218', name: 'Taiwan Pink Guava', subName: 'Psidium guajava · Telugu: తైవాన్ పింక్ జామ', overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: 'image copy 218.png', fallbackImg: 'image copy 218.png', price: 249 },
      { id: 'fruit-219', name: 'Kaffir Lime (Makrut Lime)', subName: 'Citrus hystrix · Telugu: కెఫిర్ లైమ్', overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: 'image copy 219.png', fallbackImg: 'image copy 219.png', price: 349 },
      { id: 'fruit-220', name: 'Cashew Fruit Tree', subName: 'Anacardium occidentale · Telugu: జీడిమామిడి', overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: 'image copy 220.png', fallbackImg: 'image copy 220.png', price: 299 },
      { id: 'fruit-221', name: 'Royal Mango Grafted', subName: 'Mangifera indica · Telugu: రాయల్ మామిడి', overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: 'image copy 221.png', fallbackImg: 'image copy 221.png', price: 399 },
      { id: 'fruit-222', name: 'Purple Hass Avocado', subName: 'Persea americana Hass · Telugu: పర్పల్ ఆవకాడో', overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: 'image copy 222.png', fallbackImg: 'image copy 222.png', price: 499 },
      { id: 'fruit-223', name: 'Langsat (Duku Fruit)', subName: 'Lansium domesticum · Telugu: లాంగ్సాట్', overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: 'image copy 223.png', fallbackImg: 'image copy 223.png', price: 499 },
      { id: 'fruit-224', name: 'Clove Tree (Laung)', subName: 'Syzygium aromaticum · Telugu: లవంగాల చెట్టు', overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: 'image copy 224.png', fallbackImg: 'image copy 224.png', price: 349 },
      { id: 'fruit-225', name: 'Governor’s Plum', subName: 'Flacourtia indica · Telugu: కనుగు పండు', overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: 'image copy 225.png', fallbackImg: 'image copy 225.png', price: 349 },
      { id: 'fruit-226', name: 'Macadamia Nut Tree', subName: 'Macadamia integrifolia · Telugu: మెకాడమియా నట్', overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: 'image copy 226.png', fallbackImg: 'image copy 226.png', price: 599 },
      { id: 'fruit-227', name: 'Malay Apple (Water Apple)', subName: 'Syzygium malaccense · Telugu: మలై ఆపిల్', overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: 'image copy 227.png', fallbackImg: 'image copy 227.png', price: 399 },
      { id: 'fruit-228', name: 'Citron Fruit (Narthangai)', subName: 'Citrus medica · Telugu: దబ్బకాయ', overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: 'image copy 228.png', fallbackImg: 'image copy 228.png', price: 299 },
      { id: 'fruit-229', name: 'Dragon Fruit (White Flesh)', subName: 'Hylocereus undatus · Telugu: తెల్ల డ్రాగన్ ఫ్రూట్', overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: 'image copy 229.png', fallbackImg: 'image copy 229.png', price: 299 }
    ];

    // 7. Avenue Plants: Exact 29 Mappings as requested
    const avenueItems = [
      { id: 'avenue-1', name: 'Melia dubia', subName: 'Telugu: Malabar Vepa', category: 'Avenue Tree', img: 'image.png', fallbackImg: 'image.png', price: 349 },
      { id: 'avenue-2', name: 'Pongamia pinnata', subName: 'Telugu: Kanuga', category: 'Avenue Tree', img: 'image copy.png', fallbackImg: 'image copy.png', price: 349 },
      { id: 'avenue-3', name: 'Casuarina equisetifolia', subName: 'Telugu: Sarugudu', category: 'Avenue Tree', img: '2.png', fallbackImg: 'image copy 2.png', price: 349 },
      { id: 'avenue-4', name: 'Terminalia arjuna', subName: 'Telugu: Tella Maddi', category: 'Avenue Tree', img: '3.png', fallbackImg: 'image copy 3.png', price: 349 },
      { id: 'avenue-5', name: 'Prosopis cineraria', subName: 'Telugu: Jammi Chettu', category: 'Avenue Tree', img: '4.png', fallbackImg: 'image copy 4.png', price: 349 },
      { id: 'avenue-6', name: 'Samanea saman', subName: 'Telugu: Nidra Ganneru', category: 'Avenue Tree', img: '5.png', fallbackImg: 'image copy 5.png', price: 349 },
      { id: 'avenue-7', name: 'Delonix regia', subName: 'Telugu: Turai', category: 'Avenue Tree', img: '6.png', fallbackImg: 'image copy 6.png', price: 349 },
      { id: 'avenue-8', name: 'Butea monosperma', subName: 'Telugu: Modugu', category: 'Avenue Tree', img: '7.png', fallbackImg: 'image copy 7.png', price: 349 },
      { id: 'avenue-9', name: 'Neem', subName: 'Azadirachta indica · Telugu: Vepa', category: 'Avenue Tree', img: '8.png', fallbackImg: 'image copy 8.png', price: 349 },
      { id: 'avenue-10', name: 'Copper Pod', subName: 'Peltophorum pterocarpum · Telugu: Konda Chinta', category: 'Avenue Tree', img: '9.png', fallbackImg: 'image copy 9.png', price: 349 },
      { id: 'avenue-11', name: 'Indian Almond (Badam)', subName: 'Terminalia catappa · Telugu: Badam', category: 'Avenue Tree', img: '10.png', fallbackImg: 'image copy 10.png', price: 349 },
      { id: 'avenue-12', name: 'Mahogany', subName: 'Swietenia mahagoni', category: 'Avenue Tree', img: '11.png', fallbackImg: 'image copy 11.png', price: 349 },
      { id: 'avenue-13', name: 'Silver Oak', subName: 'Grevillea robusta', category: 'Avenue Tree', img: '12.png', fallbackImg: 'image copy 12.png', price: 349 },
      { id: 'avenue-14', name: 'Cassia Fistula (Golden Shower)', subName: 'Cassia fistula · Telugu: Rela', category: 'Avenue Tree', img: '13.png', fallbackImg: 'image copy 13.png', price: 349 },
      { id: 'avenue-15', name: 'Tabebuia Rosea', subName: 'Tabebuia rosea', category: 'Avenue Tree', img: '14.png', fallbackImg: 'image copy 14.png', price: 349 },
      { id: 'avenue-16', name: 'Tabebuia Argentea', subName: 'Tabebuia argentea', category: 'Avenue Tree', img: '15.png', fallbackImg: 'image copy 15.png', price: 349 },
      { id: 'avenue-17', name: 'Bignonia Megapotamica', subName: 'Bignonia megapotamica', category: 'Avenue Tree', img: '16.png', fallbackImg: 'image copy 16.png', price: 349 },
      { id: 'avenue-18', name: 'Jacaranda', subName: 'Jacaranda mimosifolia', category: 'Avenue Tree', img: '17.png', fallbackImg: 'image copy 17.png', price: 349 },
      { id: 'avenue-19', name: 'Spathodea (African Tulip)', subName: 'Spathodea campanulata', category: 'Avenue Tree', img: '18.png', fallbackImg: 'image copy 18.png', price: 349 },
      { id: 'avenue-20', name: 'Millingtonia (Tree Jasmine)', subName: 'Millingtonia hortensis', category: 'Avenue Tree', img: '19.png', fallbackImg: 'image copy 19.png', price: 349 },
      { id: 'avenue-21', name: 'Banyan Tree', subName: 'Ficus benghalensis', category: 'Avenue Tree', img: '20.png', fallbackImg: 'image copy 20.png', price: 349 },
      { id: 'avenue-22', name: 'Peepal Tree', subName: 'Ficus religiosa', category: 'Avenue Tree', img: '21.png', fallbackImg: 'image copy 21.png', price: 349 },
      { id: 'avenue-23', name: 'Ashoka Tree (Sita Ashok)', subName: 'Saraca asoca', category: 'Avenue Tree', img: '22.png', fallbackImg: 'image copy 22.png', price: 349 },
      { id: 'avenue-24', name: 'Mast Tree (False Ashoka)', subName: 'Polyalthia longifolia', category: 'Avenue Tree', img: '23.png', fallbackImg: 'image copy 23.png', price: 349 },
      { id: 'avenue-25', name: 'Teak', subName: 'Tectona grandis', category: 'Avenue Tree', img: '24.png', fallbackImg: 'image copy 24.png', price: 349 },
      { id: 'avenue-26', name: 'Red Sanders (Red Sandal)', subName: 'Pterocarpus santalinus', category: 'Avenue Tree', img: '25.png', fallbackImg: 'image copy 25.png', price: 349 },
      { id: 'avenue-27', name: 'Sandalwood', subName: 'Santalum album', category: 'Avenue Tree', img: '26.png', fallbackImg: 'image copy 26.png', price: 349 },
      { id: 'avenue-28', name: 'Amaltas Neelamohar (Pride of India)', subName: 'Lagerstroemia speciosa', category: 'Avenue Tree', img: '27.png', fallbackImg: 'image copy 27.png', price: 349 },
      { id: 'avenue-29', name: 'Kadamba', subName: 'Neolamarckia cadamba', category: 'Avenue Tree', img: '28.png', fallbackImg: 'image copy 28.png', price: 349 }
    ];

    // 8. All Plants: Complete combined collection of all categories
    const allItems = [
      ...indoorItems,
      ...palmsItems,
      ...floweringItems,
      ...ornamentalItems,
      ...bonsaiItems,
      ...fruitItems,
      ...avenueItems
    ];

    window.ALL_CATALOG_PLANTS = allItems;

  // 7. Catalog Page Category Filtering & Two-Button Product Cards Logic (continued — uses variables declared above)

  if (catalogProductsGrid && categoryPillsGrid) {

    const catalogData = {
      'all': {
        title: 'All Plants',
        subtitle: 'Complete collection of indoor, avenue, palms, flowering, ornamental, bonsai & fruit plants',
        items: allItems
      },
      'indoor': {
        title: 'Indoor Plants',
        subtitle: 'Lush air-purifying, decorative and shade-loving indoor flora',
        items: indoorItems
      },
      'avenue': {
        title: 'Avenue Plants',
        subtitle: 'Stately avenue shade trees and landscape garden trees',
        items: avenueItems
      },
      'palms': {
        title: 'Palm Varieties',
        subtitle: 'Majestic tropical palm varieties for indoor and outdoor landscapes',
        items: palmsItems
      },
      'flowering': {
        title: 'Flowering Plants',
        subtitle: 'Vibrant perennial blooms and colorful garden flowering species',
        items: floweringItems
      },
      'ornamental': {
        title: 'Ornamental Plants',
        subtitle: 'Exotic decorative foliage and premium landscape accent plants',
        items: ornamentalItems
      },
      'bonsai': {
        title: 'Bonsai Plants',
        subtitle: 'Artisanal sculpted bonsai trees with aged roots and elegant foliage',
        items: bonsaiItems
      },
      'fruit': {
        title: 'Fruit Plants',
        subtitle: 'High-yield grafted fruit trees straight from Sri Vinayaka Nursery',
        items: fruitItems
      }
    };

    function renderCatalogGrid(categoryKey) {
      const data = catalogData[categoryKey] || catalogData['all'];
      
      if (currentCategoryHeading) currentCategoryHeading.textContent = data.title;
      if (currentCategorySubtitle) currentCategorySubtitle.textContent = data.subtitle;

      // Helper function to build clean product card HTML matching reference image
      function createCardHTML(item) {
        // Category badge top-left
        let categoryBadge = item.overlayTag || item.category || 'Nursery Plant';
        if (categoryBadge === 'Avenue Tree') categoryBadge = 'Avenue Plant';
        if (categoryBadge === 'Palm Variety') categoryBadge = 'Palm Plant';

        // Parse botanical and Telugu names cleanly from subName if present
        let botanicalName = '';
        let teluguName = '';

        if (item.subName) {
          if (item.subName.includes('· Telugu:')) {
            const parts = item.subName.split('· Telugu:');
            botanicalName = parts[0].trim();
            teluguName = parts[1].trim();
          } else if (item.subName.includes('Telugu:')) {
            const parts = item.subName.split('Telugu:');
            botanicalName = parts[0].trim();
            teluguName = parts[1].trim();
          } else {
            botanicalName = item.subName.trim();
          }
        }

        // Generate deterministic rating & review count for consistent realistic ratings
        let hash = 0;
        for (let i = 0; i < item.id.length; i++) {
          hash = (hash << 5) - hash + item.id.charCodeAt(i);
          hash |= 0;
        }
        const posHash = Math.abs(hash);
        const ratingScore = (4.6 + (posHash % 4) * 0.1).toFixed(1);
        const reviewCount = 60 + (posHash % 110);

        // WhatsApp inquiry message without prices
        const waMsg = `Hello Sri Vinayaka Nursery! I am interested in inquiring about:\nPlant: ${item.name}\n${botanicalName ? `Botanical: ${botanicalName}\n` : ''}Category: ${categoryBadge}\n\nPlease confirm availability and ordering details.`;
        const encodedWaMsg = encodeURIComponent(waMsg);

        return `
          <div class="catalog-card" data-id="${item.id}">
            <!-- Card Image Box with Badge & Wishlist Heart -->
            <div class="catalog-img-box">
              <span class="card-category-badge">${categoryBadge}</span>
              <button class="btn-card-wishlist" 
                      data-id="${item.id}" 
                      data-name="${item.name}" 
                      aria-label="Add to Favorites" 
                      title="Add to Favorites">
                <svg class="wishlist-heart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
              <img src="${item.img}" 
                   alt="${item.name}" 
                   class="catalog-card-img" 
                   loading="lazy" 
                   decoding="async"
                   width="300"
                   height="260"
                   onerror="if(!this.dataset.tried){this.dataset.tried='1';this.src='${item.fallbackImg || item.img}';}" />
            </div>

            <!-- Card Content Body -->
            <div class="catalog-card-body">
              <div class="catalog-card-info">
                <h3 class="catalog-card-title">${item.name}</h3>
                ${botanicalName ? `<p class="catalog-botanical-name">${botanicalName}</p>` : ''}
                ${teluguName ? `<p class="catalog-telugu-name">${teluguName}</p>` : ''}
              </div>

              <div class="catalog-card-middle">
                <div class="catalog-status-row">
                  <div class="catalog-badge-tag">
                    <span class="catalog-badge-dot"></span>
                    <span>In Stock · Wholesale</span>
                  </div>
                  <span class="catalog-leaf-accent" title="Fresh Nursery Plant">🌿</span>
                </div>
              </div>

              <!-- Action Row: Add to Cart + Small Eye View Button -->
              <div class="card-actions-row">
                <button class="btn-card-add-cart" 
                        data-id="${item.id}" 
                        data-name="${item.name}" 
                        data-img="${item.img}" 
                        data-price="${item.price || 299}">
                  <svg class="cart-btn-icon" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                  </svg>
                  Add to Cart
                </button>
                <a href="https://wa.me/919959536499?text=${encodedWaMsg}" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   class="btn-card-view-eye" 
                   aria-label="View plant details on WhatsApp"
                   title="Quick View / WhatsApp Inquiry">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        `;
      }

      function attachCartListeners(targetContainer) {
        targetContainer.querySelectorAll('.btn-card-add-cart').forEach(btn => {
          if (btn.dataset.bound) return;
          btn.dataset.bound = 'true';
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            const product = {
              id: btn.getAttribute('data-id'),
              name: btn.getAttribute('data-name'),
              img: btn.getAttribute('data-img'),
              price: parseInt(btn.getAttribute('data-price'), 10) || 299,
              quantity: 1
            };
            CartManager.addItem(product);
          });
        });

        targetContainer.querySelectorAll('.btn-card-wishlist').forEach(btn => {
          if (btn.dataset.wishlistBound) return;
          btn.dataset.wishlistBound = 'true';
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            btn.classList.toggle('active');
            const isLiked = btn.classList.contains('active');
            const pName = btn.getAttribute('data-name') || 'Plant';
            if (isLiked) {
              CartManager.showToast(`Saved "${pName}" to Wishlist! ❤️`);
            } else {
              CartManager.showToast(`Removed "${pName}" from Wishlist`);
            }
          });
        });
      }

      // Fast initial paint: render first 24 items instantly
      const BATCH_SIZE = 24;
      const initialItems = data.items.slice(0, BATCH_SIZE);
      const remainingItems = data.items.slice(BATCH_SIZE);

      catalogProductsGrid.innerHTML = initialItems.map(createCardHTML).join('');
      attachCartListeners(catalogProductsGrid);

      // Asynchronously append remaining items without blocking thread
      if (remainingItems.length > 0) {
        requestAnimationFrame(() => {
          setTimeout(() => {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = remainingItems.map(createCardHTML).join('');
            while (tempDiv.firstChild) {
              catalogProductsGrid.appendChild(tempDiv.firstChild);
            }
            attachCartListeners(catalogProductsGrid);
          }, 30);
        });
      }

      // Sort and Grid View Toggle Controls Initialization
      const catalogSortSelect = document.getElementById('catalogSortSelect');
      const viewGrid4Btn = document.getElementById('viewGrid4Btn');
      const viewGrid2Btn = document.getElementById('viewGrid2Btn');

      if (viewGrid4Btn && viewGrid2Btn) {
        viewGrid4Btn.onclick = () => {
          viewGrid4Btn.classList.add('active');
          viewGrid2Btn.classList.remove('active');
          catalogProductsGrid.classList.remove('grid-cols-2');
        };
        viewGrid2Btn.onclick = () => {
          viewGrid2Btn.classList.add('active');
          viewGrid4Btn.classList.remove('active');
          catalogProductsGrid.classList.add('grid-cols-2');
        };
      }

      if (catalogSortSelect && !catalogSortSelect.dataset.bound) {
        catalogSortSelect.dataset.bound = 'true';
        catalogSortSelect.addEventListener('change', () => {
          const val = catalogSortSelect.value;
          const itemsCopy = [...data.items];
          if (val === 'price-low') {
            itemsCopy.sort((a, b) => (a.price || 0) - (b.price || 0));
          } else if (val === 'price-high') {
            itemsCopy.sort((a, b) => (b.price || 0) - (a.price || 0));
          } else if (val === 'rating') {
            itemsCopy.reverse();
          }
          catalogProductsGrid.innerHTML = itemsCopy.map(createCardHTML).join('');
          attachCartListeners(catalogProductsGrid);
        });
      }
    }

    // URL Query Parameter check for category or search filter
    const urlParams = new URLSearchParams(window.location.search);
    const initialCategory = urlParams.get('category') || 'all';
    const searchQueryParam = urlParams.get('search');

    const pillButtons = categoryPillsGrid.querySelectorAll('.category-pill-btn');
    let matchedPill = false;

    if (!searchQueryParam) {
      pillButtons.forEach(btn => {
        if (btn.getAttribute('data-category') === initialCategory) {
          pillButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          matchedPill = true;
        }
      });
    }

    // Initial render
    renderCatalogGrid(matchedPill ? initialCategory : 'all');

    // Helper search filter function
    function applySearchFilter(query) {
      const q = query.toLowerCase().trim();
      const cards = catalogProductsGrid.querySelectorAll('.catalog-card');
      let visibleCount = 0;
      cards.forEach(card => {
        const titleEl = card.querySelector('.catalog-card-title');
        const catEl = card.querySelector('.catalog-card-category');
        const overlayEl = card.querySelector('.avenue-overlay-tag');
        const imgEl = card.querySelector('.catalog-card-img');
        const addBtn = card.querySelector('.btn-card-add-cart');

        const cardTitle = titleEl ? titleEl.textContent.toLowerCase() : '';
        const cardCategory = catEl ? catEl.textContent.toLowerCase() : '';
        const cardOverlay = overlayEl ? overlayEl.textContent.toLowerCase() : '';
        const imgAlt = imgEl ? (imgEl.getAttribute('alt') || '').toLowerCase() : '';
        const btnName = addBtn ? (addBtn.getAttribute('data-name') || '').toLowerCase() : '';

        if (q === '' || cardTitle.includes(q) || cardCategory.includes(q) || cardOverlay.includes(q) || imgAlt.includes(q) || btnName.includes(q)) {
          card.style.display = 'flex';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });
      return visibleCount;
    }

    // Search bar filter logic on catalog page
    const catalogSearchInput = document.getElementById('catalogSearchInput');
    
    if (searchQueryParam) {
      if (catalogSearchInput) catalogSearchInput.value = searchQueryParam;
      if (currentCategoryHeading) currentCategoryHeading.textContent = `Search Results: "${searchQueryParam}"`;
      if (currentCategorySubtitle) currentCategorySubtitle.textContent = `Showing nursery plants matching "${searchQueryParam}"`;

      // Apply initial filter after DOM paint
      setTimeout(() => {
        applySearchFilter(searchQueryParam);
      }, 50);
    }

    if (catalogSearchInput) {
      catalogSearchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        applySearchFilter(query);
      });
    }

    // Click handler for category pills
    pillButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        pillButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const catKey = btn.getAttribute('data-category');
        if (catalogSearchInput) catalogSearchInput.value = '';
        renderCatalogGrid(catKey);
      });
    });
  }

  // ==========================================
  // CONTACT US SECTION INTERACTION & FORM LOGIC
  // ==========================================
  const contactForm = document.getElementById('contactWhatsappForm');
  const contactFormAlert = document.getElementById('contactFormAlert');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('contactName');
      const phoneInput = document.getElementById('contactPhone');
      const reqInput = document.getElementById('contactRequirement');
      const msgInput = document.getElementById('contactMessage');

      const name = nameInput ? nameInput.value.trim() : '';
      const phone = phoneInput ? phoneInput.value.trim() : '';
      const requirement = reqInput ? reqInput.value.trim() : '';
      const message = msgInput ? msgInput.value.trim() : '';

      // Reset error styles & alert
      if (nameInput) nameInput.classList.remove('input-error');
      if (phoneInput) phoneInput.classList.remove('input-error');

      if (contactFormAlert) {
        contactFormAlert.style.display = 'none';
        contactFormAlert.className = 'contact-form-alert';
        contactFormAlert.textContent = '';
      }

      // Validation check: Name and Phone Number are required
      let isValid = true;
      let errorMsg = '';

      if (!name && !phone) {
        isValid = false;
        errorMsg = '⚠️ Please enter your Name and Phone Number to submit.';
        if (nameInput) nameInput.classList.add('input-error');
        if (phoneInput) phoneInput.classList.add('input-error');
      } else if (!name) {
        isValid = false;
        errorMsg = '⚠️ Please enter your Name.';
        if (nameInput) nameInput.classList.add('input-error');
      } else if (!phone) {
        isValid = false;
        errorMsg = '⚠️ Please enter your Phone Number.';
        if (phoneInput) phoneInput.classList.add('input-error');
      }

      if (!isValid) {
        if (contactFormAlert) {
          contactFormAlert.textContent = errorMsg;
          contactFormAlert.classList.add('error');
          contactFormAlert.style.display = 'block';
        }
        return;
      }

      // Valid: Build formatted WhatsApp message
      const waMessageText = `Hello Sri Vinayaka Nursery,\n\nName: ${name}\nPhone: ${phone}\nPlant / Requirement: ${requirement || 'Not specified'}\nMessage: ${message || 'Not specified'}\n\nI would like to know more about your plants.`;

      const targetWaNumber = '919959536499';
      const waUrl = `https://wa.me/${targetWaNumber}?text=${encodeURIComponent(waMessageText)}`;

      // Meta Pixel Lead Event for Contact Form Enquiry
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'Lead', {
          content_name: `Contact Form Enquiry: ${requirement || 'General'}`,
          lead_type: 'Contact Form WhatsApp'
        });
      }

      // Show success feedback briefly before opening WhatsApp
      if (contactFormAlert) {
        contactFormAlert.textContent = '🌿 Opening WhatsApp with your enquiry...';
        contactFormAlert.classList.add('success');
        contactFormAlert.style.display = 'block';
      }

      setTimeout(() => {
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      }, 300);
    });
  }

  // Smooth Entrance Animation & Scroll Handler for Contact Us section
  const contactSection = document.getElementById('contact-us');
  if (contactSection) {
    contactSection.classList.add('animate-in');
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            contactSection.classList.add('animate-in');
            observer.unobserve(contactSection);
          }
        });
      }, { threshold: 0.05 });
      observer.observe(contactSection);
    }
  }

  // Handle Contact Us links click to close mobile menu & scroll smoothly
  const contactNavLinks = document.querySelectorAll('a[href*="#contact-us"]');
  contactNavLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const mobileNav = document.getElementById('mainNav');
      const mobileOverlay = document.getElementById('mobileNavOverlay');
      if (mobileNav && mobileNav.classList.contains('mobile-active')) {
        mobileNav.classList.remove('mobile-active');
      }
      if (mobileOverlay && mobileOverlay.classList.contains('active')) {
        mobileOverlay.classList.remove('active');
      }
      const targetSection = document.getElementById('contact-us');
      if (targetSection && (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || !window.location.pathname.includes('.html'))) {
        e.preventDefault();
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Handle Indoor Plants / Trending Collection links click to close mobile menu & scroll smoothly
  const trendingNavLinks = document.querySelectorAll('a[href*="#trending-collection"]');
  trendingNavLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const mobileNav = document.getElementById('mainNav');
      const mobileOverlay = document.getElementById('mobileNavOverlay');
      if (mobileNav && mobileNav.classList.contains('mobile-active')) {
        mobileNav.classList.remove('mobile-active');
      }
      if (mobileOverlay && mobileOverlay.classList.contains('active')) {
        mobileOverlay.classList.remove('active');
      }
      const targetSection = document.getElementById('trending-collection');
      if (targetSection && (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || !window.location.pathname.includes('.html'))) {
        e.preventDefault();
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Smooth Scroll Animation for Landscaping Page Cards & Sections
  const landscapingAnimElements = document.querySelectorAll('.service-card, .why-choose-card, .experience-split-grid, .project-grid-card');
  if (landscapingAnimElements.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    landscapingAnimElements.forEach((el, index) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = `opacity 0.6s ease-out ${index % 4 * 0.1}s, transform 0.6s ease-out ${index % 4 * 0.1}s`;
      observer.observe(el);
    });
  }

  // Meta Pixel Lead Event tracking for direct WhatsApp links (e.g. product card WhatsApp order, float button, etc.)
  document.addEventListener('click', (e) => {
    const waLink = e.target.closest('a[href*="wa.me"]');
    if (waLink) {
      const card = waLink.closest('.catalog-card');
      let leadData = { lead_type: 'WhatsApp Link Click' };
      if (card) {
        const addBtn = card.querySelector('.btn-card-add-cart');
        const titleEl = card.querySelector('.catalog-card-title');
        const name = titleEl ? titleEl.textContent.trim() : (addBtn ? addBtn.getAttribute('data-name') : 'Plant');
        const price = addBtn ? parseInt(addBtn.getAttribute('data-price'), 10) : 0;
        const id = addBtn ? addBtn.getAttribute('data-id') : '';
        leadData = {
          content_name: name || 'Plant WhatsApp Order',
          content_ids: id ? [String(id)] : [],
          content_type: 'product',
          value: price || 0,
          currency: 'INR'
        };
      }
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'Lead', leadData);
      }
    }
  });
});


