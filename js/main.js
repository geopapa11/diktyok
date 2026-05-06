/* ============================================
   Δίκτυο Κ — Main JavaScript
   ============================================ */

(function () {
    'use strict';

    // ==========================================
    // Language Toggle
    // ==========================================

    const langToggle = document.getElementById('langToggle');
    const langButtons = langToggle.querySelectorAll('[data-lang-btn]');

    function setLanguage(lang) {
        document.body.classList.toggle('lang-en', lang === 'en');
        langButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.langBtn === lang);
        });
        localStorage.setItem('diktyok-lang', lang);
    }

    langButtons.forEach(btn => {
        btn.addEventListener('click', () => setLanguage(btn.dataset.langBtn));
    });

    // Restore saved language
    const savedLang = localStorage.getItem('diktyok-lang');
    if (savedLang) setLanguage(savedLang);

    // ==========================================
    // Navigation — scroll effect
    // ==========================================

    const nav = document.getElementById('nav');

    function onScroll() {
        nav.classList.toggle('scrolled', window.scrollY > 60);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // ==========================================
    // Mobile menu
    // ==========================================

    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('open');
        document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    // Close menu on link click
    navLinks.querySelectorAll('.nav__link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('open');
            document.body.style.overflow = '';
        });
    });

    // ==========================================
    // Scroll reveal animations
    // ==========================================

    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    revealElements.forEach(el => revealObserver.observe(el));

    // ==========================================
    // Animated counters
    // ==========================================

    const counters = document.querySelectorAll('[data-count]');

    const counterObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.5 }
    );

    counters.forEach(el => counterObserver.observe(el));

    function animateCounter(el) {
        const target = parseInt(el.dataset.count, 10);
        const duration = 2000;
        const start = performance.now();

        function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(target * eased);
            if (progress < 1) requestAnimationFrame(update);
        }

        requestAnimationFrame(update);
    }

    // ==========================================
    // About tabs
    // ==========================================

    const tabs = document.querySelectorAll('.about__tab');
    const panels = document.querySelectorAll('.about__panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;

            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            panels.forEach(p => {
                p.classList.remove('active');
                if (p.id === `panel-${target}`) {
                    p.classList.add('active');
                    // Re-trigger reveal animations within the panel
                    p.querySelectorAll('.reveal').forEach(el => {
                        el.classList.remove('visible');
                        setTimeout(() => el.classList.add('visible'), 50);
                    });
                }
            });
        });
    });

    // ==========================================
    // FAQ accordion
    // ==========================================

    document.querySelectorAll('.faq-item__question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.parentElement;
            const isOpen = item.classList.contains('open');

            // Close all
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));

            // Toggle current
            if (!isOpen) item.classList.add('open');
        });
    });

    // ==========================================
    // Events filter
    // ==========================================

    const filters = document.querySelectorAll('.events__filter');
    const eventCards = document.querySelectorAll('.event-card');

    filters.forEach(filter => {
        filter.addEventListener('click', () => {
            const target = filter.dataset.filter;

            filters.forEach(f => f.classList.remove('active'));
            filter.classList.add('active');

            eventCards.forEach(card => {
                const year = card.dataset.year;
                const show = target === 'all' || year === target;
                card.classList.toggle('hidden', !show);

                // Re-trigger animation
                if (show) {
                    card.classList.remove('visible');
                    setTimeout(() => card.classList.add('visible'), 50);
                }
            });
        });
    });

    // ==========================================
    // Event Modal
    // ==========================================

    const eventModal = document.getElementById('eventModal');
    const modalClose = document.getElementById('modalClose');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalDate = document.getElementById('modalDate');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalGallery = document.getElementById('modalGallery');
    const galleryGrid = document.getElementById('galleryGrid');
    const modalHeaderImg = document.getElementById('modalHeaderImg');

    function openModal(card) {
        const date = card.querySelector('.event-card__date').cloneNode(true);
        const title = card.querySelector('h3').cloneNode(true);
        const description = card.querySelector('.event-card__description-full').cloneNode(true);
        const galleryPath = card.dataset.gallery;
        const thumbPath = card.dataset.thumb;

        modalDate.innerHTML = '';
        modalDate.appendChild(date);
        
        modalTitle.innerHTML = '';
        modalTitle.appendChild(title);
        
        modalBody.innerHTML = '';
        modalBody.appendChild(description);

        // Load Thumbnail
        modalHeaderImg.innerHTML = '';
        if (thumbPath) {
            const thumbImg = document.createElement('img');
            thumbImg.src = encodeURI(thumbPath);
            thumbImg.alt = 'Event thumbnail';
            thumbImg.style.cursor = 'pointer';
            
            // Allow clicking thumbnail to open in lightbox
            thumbImg.addEventListener('click', () => {
                const prevGallery = [...currentGalleryImages];
                currentGalleryImages = [encodeURI(thumbPath)];
                openLightbox(0);
                // Restore gallery when lightbox closes (handled by listener)
                lightbox.addEventListener('click', () => { currentGalleryImages = prevGallery; }, { once: true });
            });

            modalHeaderImg.appendChild(thumbImg);
            modalHeaderImg.style.display = 'block';
        } else {
            modalHeaderImg.style.display = 'none';
        }

        // Reset and Load Gallery
        loadGallery(card);

        eventModal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    async function loadGallery(card) {
        const path = card.dataset.gallery;
        const imagesAttr = card.dataset.galleryImages;
        
        if (!path || !imagesAttr) {
            modalGallery.style.display = 'none';
            return;
        }

        // Parse images list (comma-separated)
        const images = imagesAttr.split(',').map(img => img.trim()).filter(img => img !== '');
        let foundAny = false;
        
        galleryGrid.innerHTML = '';
        currentGalleryImages = [];

        images.forEach((imgName, index) => {
            const imgSrc = encodeURI(`${path}${imgName}`);
            currentGalleryImages.push(imgSrc);

            const item = document.createElement('div');
            item.className = 'gallery__item';
            item.innerHTML = `<img src="${imgSrc}" class="gallery__img" loading="lazy" alt="Event photo">`;
            
            item.addEventListener('click', () => openLightbox(index));
            
            galleryGrid.appendChild(item);
            foundAny = true;
        });

        modalGallery.style.display = foundAny ? 'block' : 'none';
    }

    function checkImageExists(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
    }

    function closeModal() {
        eventModal.classList.remove('open');
        document.body.style.overflow = '';
    }

    document.querySelectorAll('.event-card__more').forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.event-card');
            openModal(card);
        });
    });

    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);

    // ==========================================
    // Lightbox
    // ==========================================

    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    let currentGalleryImages = [];
    let currentImageIndex = 0;

    function openLightbox(index) {
        currentImageIndex = index;
        lightboxImg.src = currentGalleryImages[currentImageIndex];
        
        // Show navigation only if there's more than one image
        const hasMultiple = currentGalleryImages.length > 1;
        lightboxPrev.style.display = hasMultiple ? 'flex' : 'none';
        lightboxNext.style.display = hasMultiple ? 'flex' : 'none';
        
        lightbox.classList.add('open');
    }

    function closeLightbox() {
        lightbox.classList.remove('open');
        setTimeout(() => { lightboxImg.src = ''; }, 300);
    }

    function showNext() {
        currentImageIndex = (currentImageIndex + 1) % currentGalleryImages.length;
        lightboxImg.src = currentGalleryImages[currentImageIndex];
    }

    function showPrev() {
        currentImageIndex = (currentImageIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
        lightboxImg.src = currentGalleryImages[currentImageIndex];
    }

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });
    lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });
    lightbox.addEventListener('click', closeLightbox);

    // Keyboard navigation for both Modal and Lightbox
    document.addEventListener('keydown', (e) => {
        if (lightbox.classList.contains('open')) {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') showNext();
            if (e.key === 'ArrowLeft') showPrev();
        } else if (eventModal.classList.contains('open')) {
            if (e.key === 'Escape') closeModal();
        }
    });

    // ==========================================
    // Contact form (basic)
    // ==========================================

    const contactForm = document.getElementById('contactForm');

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = contactForm.querySelector('.btn');
        const originalHTML = btn.innerHTML;
        const formData = new FormData(contactForm);

        // Disable button while submitting
        btn.disabled = true;
        btn.innerHTML = '<span data-lang="gr">Αποστολή...</span><span data-lang="en">Sending...</span>';
        if (document.body.classList.contains('lang-en')) {
            btn.querySelector('[data-lang="gr"]').style.display = 'none';
        } else {
            const en = btn.querySelector('[data-lang="en"]');
            if (en) en.style.display = 'none';
        }

        fetch('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(formData).toString()
        })
        .then(response => {
            if (response.ok) {
                btn.innerHTML = '<span data-lang="gr">Εστάλη!</span><span data-lang="en">Sent!</span>';
                if (document.body.classList.contains('lang-en')) {
                    btn.querySelector('[data-lang="gr"]').style.display = 'none';
                } else {
                    const en = btn.querySelector('[data-lang="en"]');
                    if (en) en.style.display = 'none';
                }
                btn.style.background = '#4CAF50';
                btn.style.borderColor = '#4CAF50';
                contactForm.reset();
            } else {
                throw new Error('Form submission failed');
            }
        })
        .catch(() => {
            btn.innerHTML = '<span data-lang="gr">Σφάλμα — Δοκιμάστε ξανά</span><span data-lang="en">Error — Try again</span>';
            if (document.body.classList.contains('lang-en')) {
                btn.querySelector('[data-lang="gr"]').style.display = 'none';
            } else {
                const en = btn.querySelector('[data-lang="en"]');
                if (en) en.style.display = 'none';
            }
            btn.style.background = '#e74c3c';
            btn.style.borderColor = '#e74c3c';
        })
        .finally(() => {
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.background = '';
                btn.style.borderColor = '';
                btn.disabled = false;
                // Re-apply language
                if (document.body.classList.contains('lang-en')) {
                    btn.querySelectorAll('[data-lang="gr"]').forEach(el => el.style.display = 'none');
                    btn.querySelectorAll('[data-lang="en"]').forEach(el => el.style.display = 'inline');
                }
            }, 3000);
        });
    });

    // ==========================================
    // Smooth scroll for anchor links
    // ==========================================

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                const offset = nav.offsetHeight + 20;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ==========================================
    // Active nav link on scroll
    // ==========================================

    const sections = document.querySelectorAll('section[id]');

    function updateActiveLink() {
        const scrollPos = window.scrollY + 150;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            const link = document.querySelector(`.nav__link[href="#${id}"]`);

            if (link) {
                link.classList.toggle('active', scrollPos >= top && scrollPos < top + height);
            }
        });
    }

    window.addEventListener('scroll', updateActiveLink, { passive: true });

    // ==========================================
    // 3D Globe — globe.gl
    // ==========================================

    const globeContainer = document.getElementById('globe-container');
    if (globeContainer && typeof Globe !== 'undefined') {
        // Member locations: Koufalia + cities where members live
        const locations = [
            { name: 'Koufalia', lat: 40.78, lng: 22.57, isHome: true },
            { name: 'Athens', lat: 37.98, lng: 23.73 },
            { name: 'Thessaloniki', lat: 40.63, lng: 22.94 },
            { name: 'New York', lat: 40.71, lng: -74.01 },
            { name: 'Houston', lat: 29.76, lng: -95.37 },
            { name: 'The Hague', lat: 52.08, lng: 4.30 },
            { name: 'London', lat: 51.51, lng: -0.13 },
            { name: 'Berlin', lat: 52.52, lng: 13.41 },
            { name: 'Melbourne', lat: -37.81, lng: 144.96 },
            { name: 'Dubai', lat: 25.20, lng: 55.27 },
            { name: 'Stockholm', lat: 59.33, lng: 18.07 },
            { name: 'Paris', lat: 48.86, lng: 2.35 },
            { name: 'Toronto', lat: 43.65, lng: -79.38 },
            { name: 'Brussels', lat: 50.85, lng: 4.35 },
            { name: 'Nicosia', lat: 35.17, lng: 33.36 }
        ];

        // Generate arcs from Koufalia to each city
        const koufalia = locations[0];
        const arcsData = locations.slice(1).map(loc => ({
            startLat: koufalia.lat,
            startLng: koufalia.lng,
            endLat: loc.lat,
            endLng: loc.lng
        }));

        // Determine container size
        const containerWidth = globeContainer.offsetWidth || 380;
        const globeSize = Math.min(containerWidth, 420);

        const globe = Globe()
            .globeImageUrl('//unpkg.com/three-globe/example/img/earth-day.jpg')
            .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
            .backgroundColor('rgba(0,0,0,0)')
            .width(globeSize)
            .height(globeSize)
            .showAtmosphere(false)
            // Member dots
            .pointsData(locations)
            .pointLat('lat')
            .pointLng('lng')
            .pointColor(d => d.isHome ? '#C4956A' : '#6B90C7')
            .pointAltitude(0.01)
            .pointRadius(d => d.isHome ? 0.6 : 0.35)
            // Animated arcs
            .arcsData(arcsData)
            .arcColor(() => ['#9BB8DDcc', '#C4956Acc'])
            .arcStroke(1.2)
            .arcDashLength(0.4)
            .arcDashGap(0.2)
            .arcDashAnimateTime(() => 6000 + Math.random() * 4000)
            .arcAltitudeAutoScale(0.4)
            (globeContainer);

        // Auto-rotate and set initial view centered on Greece
        globe.controls().autoRotate = true;
        globe.controls().autoRotateSpeed = 0.8;
        globe.controls().enableZoom = false;
        globe.pointOfView({ lat: 38, lng: 20, altitude: 2.2 });

        // Pause rotation when not visible (performance)
        const globeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                globe.controls().autoRotate = entry.isIntersecting;
            });
        }, { threshold: 0.1 });
        globeObserver.observe(globeContainer);

        // Handle resize
        window.addEventListener('resize', () => {
            const newWidth = globeContainer.offsetWidth || 380;
            const newSize = Math.min(newWidth, 420);
            globe.width(newSize).height(newSize);
        });
    }

})();
