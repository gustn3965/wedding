// Photo Viewer
(function() {
    'use strict';

    let currentIndex = 0;
    let touchStartX = 0;
    let touchEndX = 0;
    let galleryImages = [];

    // DOM Elements
    const photoViewer = document.getElementById('photoViewer');
    const viewerImage = document.getElementById('viewerImage');
    const viewerClose = document.getElementById('viewerClose');
    const viewerPrev = document.getElementById('viewerPrev');
    const viewerNext = document.getElementById('viewerNext');
    const currentIndexEl = document.getElementById('currentIndex');
    const totalCountEl = document.getElementById('totalCount');
    const galleryItems = document.querySelectorAll('.gallery-item');

    // Initialize
    function init() {
        // Get image sources directly from HTML
        galleryImages = Array.from(galleryItems).map(item => item.querySelector('img').src);
        totalCountEl.textContent = galleryImages.length;

        // Gallery item click events
        galleryItems.forEach((item, index) => {
            item.addEventListener('click', () => openViewer(index));
        });

        // Viewer controls
        viewerClose.addEventListener('click', closeViewer);
        viewerPrev.addEventListener('click', showPrevImage);
        viewerNext.addEventListener('click', showNextImage);

        // Keyboard navigation
        document.addEventListener('keydown', handleKeydown);

        // Touch events for swipe
        photoViewer.addEventListener('touchstart', handleTouchStart, { passive: true });
        photoViewer.addEventListener('touchend', handleTouchEnd, { passive: true });

        // Close on background click
        photoViewer.addEventListener('click', (e) => {
            if (e.target === photoViewer || e.target.classList.contains('viewer-content')) {
                closeViewer();
            }
        });
    }

    // Open photo viewer
    function openViewer(index) {
        currentIndex = index;
        updateImage();
        photoViewer.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Close photo viewer
    function closeViewer() {
        photoViewer.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Update displayed image
    function updateImage() {
        viewerImage.src = galleryImages[currentIndex];
        currentIndexEl.textContent = currentIndex + 1;
    }

    // Show previous image
    function showPrevImage() {
        currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
        updateImage();
    }

    // Show next image
    function showNextImage() {
        currentIndex = (currentIndex + 1) % galleryImages.length;
        updateImage();
    }

    // Keyboard navigation
    function handleKeydown(e) {
        if (!photoViewer.classList.contains('active')) return;

        switch (e.key) {
            case 'Escape':
                closeViewer();
                break;
            case 'ArrowLeft':
                showPrevImage();
                break;
            case 'ArrowRight':
                showNextImage();
                break;
        }
    }

    // Touch start handler
    function handleTouchStart(e) {
        touchStartX = e.changedTouches[0].screenX;
    }

    // Touch end handler
    function handleTouchEnd(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }

    // Handle swipe gesture
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) < swipeThreshold) return;

        if (diff > 0) {
            // Swipe left - next image
            showNextImage();
        } else {
            // Swipe right - previous image
            showPrevImage();
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

// Petal Animation
(function() {
    'use strict';

    function createPetalsContainer() {
        const container = document.createElement('div');
        container.className = 'petals-container';
        document.body.appendChild(container);
        return container;
    }

    function createPetal(container) {
        const petal = document.createElement('div');
        petal.className = 'petal';

        // Random properties
        const startX = Math.random() * 100;
        const size = Math.random() * 10 + 10;
        const duration = Math.random() * 3 + 4;
        const delay = Math.random() * 5;

        petal.style.left = startX + 'vw';
        petal.style.width = size + 'px';
        petal.style.height = size + 'px';
        petal.style.animationDuration = duration + 's';
        petal.style.animationDelay = delay + 's';

        container.appendChild(petal);

        // Remove petal after animation
        setTimeout(() => {
            petal.remove();
        }, (duration + delay) * 1000);
    }

    function startPetalAnimation() {
        const container = createPetalsContainer();

        // Create initial burst of petals
        for (let i = 0; i < 30; i++) {
            createPetal(container);
        }

        // Continue creating petals periodically
        let petalCount = 0;
        const maxPetals = 50;

        const interval = setInterval(() => {
            if (petalCount >= maxPetals) {
                clearInterval(interval);
                // Remove container after all petals are done
                setTimeout(() => {
                    container.remove();
                }, 10000);
                return;
            }
            createPetal(container);
            petalCount++;
        }, 300);
    }

    // Start petals when page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startPetalAnimation);
    } else {
        startPetalAnimation();
    }
})();

// Scroll Animation
(function() {
    'use strict';

    function initScrollAnimations() {
        // Add animation classes to elements
        const storyImage = document.querySelector('.story-image-container');
        const storyText = document.querySelector('.story-text');
        const galleryTitle = document.querySelector('.gallery-title');
        const gallerySubtitle = document.querySelector('.gallery-subtitle');
        const galleryItems = document.querySelectorAll('.gallery-item');

        if (storyImage) storyImage.classList.add('fade-in-left');
        if (storyText) storyText.classList.add('fade-in-right');
        if (galleryTitle) galleryTitle.classList.add('fade-in');
        if (gallerySubtitle) gallerySubtitle.classList.add('fade-in');

        galleryItems.forEach((item, index) => {
            item.classList.add('scale-in');
            item.style.setProperty('--delay', index);
        });

        // Intersection Observer for scroll animations
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        // Observe all animated elements
        document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .scale-in').forEach(el => {
            observer.observe(el);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initScrollAnimations);
    } else {
        initScrollAnimations();
    }
})();
