// Photo Viewer
(function() {
    'use strict';

    // Gallery images array
    const galleryImages = [
        'images/sources/KJJ03185.jpg',
        'images/sources/KJJ03656.jpg',
        'images/sources/KJJ04688.jpg',
        'images/sources/KJJ04730.jpg',
        'images/sources/KJJ04962.jpg',
        'images/sources/KJJ05008.jpg',
        'images/sources/KJJ05070.jpg',
        'images/sources/KJJ05195.jpg',
        'images/sources/KJJ05226.jpg',
        'images/sources/KJJ05263.jpg',
        'images/sources/KJJ05385.jpg',
        'images/sources/KJJ05569.jpg',
        'images/sources/KJJ05665.jpg',
        'images/sources/SON08265.jpg',
        'images/sources/SON08333.jpg',
        'images/sources/SON08494.jpg',
        'images/sources/SON08674.jpg',
        'images/sources/SON08723.jpg',
        'images/sources/SON08731.jpg',
        'images/sources/SON08783.jpg'
    ];

    let currentIndex = 0;
    let touchStartX = 0;
    let touchEndX = 0;

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
