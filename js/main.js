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
    // Events - Load and render dynamically
    // ==========================================

    // NOTE: fetch() calls to local files will fail when opening via file://
    // Use a local dev server (e.g., python -m http.server, VS Code Live Server) during development
    // This is not an issue once deployed to a real web host

    const eventsContainer = document.querySelector('.events__grid');
    const filters = document.querySelectorAll('.events__filter');
    let allEvents = [];

    // Pagination constants
    const INITIAL_EVENTS_COUNT = 5;
    const EVENTS_PER_LOAD = 5;

    // Pagination state
    let visibleEventsCount = INITIAL_EVENTS_COUNT;
    let currentFilter = 'all';

    // Month names for display
    const monthNames = {
        gr: ['Ιαν', 'Φεβ', 'Μαρ', 'Απρ', 'Μάι', 'Ιουν', 'Ιουλ', 'Αυγ', 'Σεπ', 'Οκτ', 'Νοε', 'Δεκ'],
        en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    };

    // Helper to get current language
    function getCurrentLang() {
        return document.body.classList.contains('lang-en') ? 'en' : 'gr';
    }

    // Helper to create date display HTML
    function createDateHTML(event) {
        const date = new Date(event.date);
        const day = date.getDate();
        const monthIndex = date.getMonth();
        const year = date.getFullYear();
        
        return `
            <div class="event-card__date">
                <span class="event-card__day">${day}</span>
                <span class="event-card__month">
                    <span data-lang="gr">${monthNames.gr[monthIndex]}</span>
                    <span data-lang="en">${monthNames.en[monthIndex]}</span>
                </span>
                <span class="event-card__year">${year}</span>
            </div>
        `;
    }

    // Helper to create location HTML
    function createLocationHTML(event) {
        if (!event.location && !event.mapsUrl) return '';
        
        const locationText = event.location ? `
            <span data-lang="gr">${event.location.gr || ''}</span>
            <span data-lang="en">${event.location.en || ''}</span>
        ` : 'Koufalia, Thessaloniki';
        
        const mapsUrl = event.mapsUrl || 'https://maps.google.com/?q=Koufalia,+Thessaloniki,+Greece';
        
        return `
            <a href="${mapsUrl}" target="_blank" rel="noopener" class="event-card__location">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                ${locationText}
            </a>
        `;
    }

    // Helper to determine if event is upcoming
    function isUpcoming(event) {
        const eventDate = new Date(event.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return eventDate >= today;
    }

    // Get the year display value for an event (used for filtering)
    function getEventYearDisplay(event) {
        return isUpcoming(event) ? 'upcoming' : String(event.year);
    }

    // Get filtered events based on current filter
    function getFilteredEvents(filter) {
        return allEvents.filter(event => {
            if (filter === 'all') return true;
            if (filter === 'upcoming') return isUpcoming(event);
            // For year filters, match against the year display value
            return getEventYearDisplay(event) === filter;
        });
    }

    // Update pagination button visibility
    function updatePaginationButtons() {
        const filteredEvents = getFilteredEvents(currentFilter);
        const showMoreBtn = document.getElementById('showMoreEvents');
        const showLessBtn = document.getElementById('showLessEvents');

        if (!showMoreBtn || !showLessBtn) return;

        const totalEvents = filteredEvents.length;

        // Rule: If 5 or fewer events total, show neither button
        if (totalEvents <= INITIAL_EVENTS_COUNT) {
            showMoreBtn.style.display = 'none';
            showLessBtn.style.display = 'none';
            return;
        }

        // Rule: Show "Show More" if visible count < total
        if (visibleEventsCount < totalEvents) {
            showMoreBtn.style.display = 'flex';
        } else {
            showMoreBtn.style.display = 'none';
        }

        // Rule: Show "Show Less" if visible count > initial count
        if (visibleEventsCount > INITIAL_EVENTS_COUNT) {
            showLessBtn.style.display = 'flex';
        } else {
            showLessBtn.style.display = 'none';
        }
    }

    // Render visible events with pagination
    function renderVisibleEvents() {
        const filteredEvents = getFilteredEvents(currentFilter);
        const visibleEvents = filteredEvents.slice(0, visibleEventsCount);

        // Clear and re-render only the visible slice
        if (!eventsContainer) return;

        eventsContainer.innerHTML = '';

        visibleEvents.forEach(event => {
            const cardHtml = renderEventCard(event);
            eventsContainer.insertAdjacentHTML('beforeend', cardHtml);
        });

        // Re-apply reveal animations
        const newCards = eventsContainer.querySelectorAll('.event-card');
        newCards.forEach(card => {
            revealObserver.observe(card);
        });

        // Update button visibility
        updatePaginationButtons();
    }

    // Render a single event card
    function renderEventCard(event) {
        const isUpcomingEvent = isUpcoming(event);
        const yearDisplay = isUpcomingEvent ? 'upcoming' : String(event.year);
        
        // Build gallery data attributes - use the full event path which includes year folder
        const eventBasePath = `assets/events/${event.path}`;
        const galleryPath = event.gallery && event.gallery.length > 0 
            ? `${eventBasePath}/gallery/` 
            : null;
        const galleryImages = event.gallery ? event.gallery.map(img => img.replace('gallery/', '')).join(', ') : '';
        const thumbPath = event.thumb ? `${eventBasePath}/${event.thumb}` : null;
        
        // Description container
        const descHtml = event.descriptionHtml ? `
            <div class="event-card__description-full">
                ${event.descriptionHtml}
            </div>
        ` : '';
        
        // Upcoming tag
        const upcomingTag = isUpcomingEvent ? `
            <span class="event-card__tag upcoming">
                <span data-lang="gr">Επερχόμενη</span>
                <span data-lang="en">Upcoming</span>
            </span>
        ` : '';
        
        const cardHtml = `
            <div class="event-card reveal" 
                 data-year="${yearDisplay}" 
                 data-gallery="${galleryPath || ''}" 
                 data-gallery-images="${galleryImages}" 
                 data-thumb="${thumbPath || ''}"
                 data-event-id="${event.id}">
                ${createDateHTML(event)}
                <div class="event-card__info">
                    ${upcomingTag}
                    <h3>
                        <span data-lang="gr">${event.title.gr}</span>
                        <span data-lang="en">${event.title.en}</span>
                    </h3>
                    ${createLocationHTML(event)}
                    ${descHtml}
                    <div class="event-card__more">
                        <span data-lang="gr">Διαβάστε περισσότερα</span>
                        <span data-lang="en">Read more</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </div>
                </div>
            </div>
        `;
        
        return cardHtml;
    }

    // Load all events from JSON files
    async function loadEvents() {
        try {
            // Fetch the index of event paths
            const indexResponse = await fetch('assets/events/index.json');
            if (!indexResponse.ok) {
                console.error('Failed to load events index:', indexResponse.status);
                return;
            }
            const eventPaths = await indexResponse.json();
            
            // Fetch all event.json files in parallel
            const eventPromises = eventPaths.map(async (path) => {
                try {
                    const eventResponse = await fetch(`assets/events/${path}/event.json`);
                    if (!eventResponse.ok) {
                        console.error(`Failed to load event at ${path}:`, eventResponse.status);
                        return null;
                    }
                    const eventData = await eventResponse.json();
                    return {
                        path: path,
                        eventData: eventData
                    };
                } catch (error) {
                    console.error(`Error loading event ${path}:`, error);
                    return null;
                }
            });
            
            const eventResults = await Promise.all(eventPromises);
            
            // Filter out nulls (failed fetches) and build events array
            const events = eventResults
                .filter(result => result !== null)
                .map(result => {
                    const { path, eventData } = result;
                    return {
                        id: eventData.id,
                        path: path,
                        title: eventData.title,
                        date: eventData.date,
                        year: eventData.year,
                        thumb: eventData.thumb,
                        gallery: eventData.gallery || [],
                        descriptionHtml: null, // Will be loaded on demand
                        descriptionFile: eventData.descriptionFile,
                        location: eventData.location,
                        mapsUrl: eventData.mapsUrl
                    };
                });
            
            // Sort by date descending (most recent first)
            events.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            allEvents = events;
            currentFilter = 'all';
            visibleEventsCount = INITIAL_EVENTS_COUNT;
            renderVisibleEvents();
            setupEventListeners();
            
        } catch (error) {
            console.error('Failed to load events:', error);
        }
    }

    // Set up event listeners after rendering
    function setupEventListeners() {
        // Filter functionality
        filters.forEach(filter => {
            filter.addEventListener('click', () => {
                const target = filter.dataset.filter;
                
                // Update active filter state
                filters.forEach(f => f.classList.remove('active'));
                filter.classList.add('active');
                
                // Reset pagination when filter changes
                currentFilter = target;
                visibleEventsCount = INITIAL_EVENTS_COUNT;
                
                // Re-render with new filter
                renderVisibleEvents();
            });
        });
        
        // Modal open functionality - using event delegation
        eventsContainer.addEventListener('click', (e) => {
            const moreBtn = e.target.closest('.event-card__more');
            if (moreBtn) {
                const card = moreBtn.closest('.event-card');
                if (card) {
                    openModal(card);
                }
            }
        });

        // Show More button
        const showMoreBtn = document.getElementById('showMoreEvents');
        if (showMoreBtn) {
            showMoreBtn.addEventListener('click', () => {
                const filteredEvents = getFilteredEvents(currentFilter);
                visibleEventsCount = Math.min(
                    visibleEventsCount + EVENTS_PER_LOAD,
                    filteredEvents.length
                );
                renderVisibleEvents();
            });
        }

        // Show Less button
        const showLessBtn = document.getElementById('showLessEvents');
        if (showLessBtn) {
            showLessBtn.addEventListener('click', () => {
                visibleEventsCount = INITIAL_EVENTS_COUNT;
                renderVisibleEvents();

                // Optional: scroll to top of events section
                const eventsSection = document.getElementById('events');
                if (eventsSection) {
                    const offset = nav.offsetHeight + 20;
                    const top = eventsSection.getBoundingClientRect().top + window.scrollY - offset;
                    window.scrollTo({ top, behavior: 'smooth' });
                }
            });
        }
    }

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
        // Get event ID from data attribute
        const eventId = card.dataset.eventId;
        const event = allEvents.find(e => e.id === eventId);
        
        if (!event) {
            console.error('Event not found:', eventId);
            return;
        }

        // Create date HTML
        const date = new Date(event.date);
        const day = date.getDate();
        const monthIndex = date.getMonth();
        const year = date.getFullYear();
        const lang = getCurrentLang();
        const monthName = lang === 'en' ? monthNames.en[monthIndex] : monthNames.gr[monthIndex];
        
        const dateHtml = `
            <span class="event-card__day">${day}</span>
            <span class="event-card__month">${monthName}</span>
            <span class="event-card__year">${year}</span>
        `;
        
        modalDate.innerHTML = dateHtml;
        modalTitle.innerHTML = lang === 'en' ? event.title.en : event.title.gr;
        
        // Set loading state for description
        modalBody.innerHTML = `
            <p>
                <span data-lang="gr">Φόρτωση περιγραφής...</span>
                <span data-lang="en">Loading description...</span>
            </p>
        `;

        // Load description on demand if not already cached
        async function loadDescription() {
            if (event.descriptionHtml) {
                modalBody.innerHTML = event.descriptionHtml;
                return;
            }
            
            if (!event.descriptionFile) {
                modalBody.innerHTML = '';
                return;
            }
            
            try {
                const descResponse = await fetch(`assets/events/${event.path}/${event.descriptionFile}`);
                if (descResponse.ok) {
                    event.descriptionHtml = await descResponse.text();
                    modalBody.innerHTML = event.descriptionHtml;
                } else {
                    console.error(`Failed to load description for ${event.id}:`, descResponse.status);
                    modalBody.innerHTML = '';
                }
            } catch (error) {
                console.error(`Error loading description for ${event.id}:`, error);
                modalBody.innerHTML = '';
            }
        }
        
        loadDescription();

        // Load Thumbnail
        modalHeaderImg.innerHTML = '';
        if (event.thumb) {
            const thumbImg = document.createElement('img');
            const thumbPath = `assets/events/${event.path}/${event.thumb}`;
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

        // Load Gallery
        loadGalleryFromEvent(event);

        eventModal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    // Helper to set object-position for portrait images
    function applyPortraitObjectPosition(img) {
        if (img.naturalHeight > img.naturalWidth) {
            img.style.objectPosition = 'center 20%';
        }
    }

    function loadGalleryFromEvent(event) {
        if (!event.gallery || event.gallery.length === 0) {
            modalGallery.style.display = 'none';
            return;
        }
        
        const galleryPath = `assets/events/${event.path}/`;
        let foundAny = false;
        
        galleryGrid.innerHTML = '';
        currentGalleryImages = [];

        event.gallery.forEach((imgPath, index) => {
            const imgSrc = encodeURI(`${galleryPath}${imgPath}`);
            currentGalleryImages.push(imgSrc);

            const item = document.createElement('div');
            item.className = 'gallery__item';

            const img = document.createElement('img');
            img.src = imgSrc;
            img.className = 'gallery__img';
            img.loading = 'lazy';
            img.alt = 'Event photo';

            // Handle cached images (complete before load listener attached)
            if (img.complete) {
                applyPortraitObjectPosition(img);
            } else {
                img.addEventListener('load', () => applyPortraitObjectPosition(img));
            }

            item.appendChild(img);
            
            item.addEventListener('click', () => openLightbox(index));
            
            galleryGrid.appendChild(item);
            foundAny = true;
        });

        modalGallery.style.display = foundAny ? 'block' : 'none';
    }

    function closeModal() {
        eventModal.classList.remove('open');
        document.body.style.overflow = '';
    }

    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);

    function checkImageExists(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
    }

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

    // ==========================================
    // Initialize Events
    // ==========================================
    // Load events when DOM is ready
    // Note: For local development, use a local server (file:// won't work with fetch)
    if (eventsContainer) {
        loadEvents();
    }

})();
