// Curtain Intro
document.addEventListener('DOMContentLoaded', function() {
    const curtain = document.getElementById('curtainOverlay');
    if (curtain) {
        setTimeout(() => {
            curtain.classList.add('hidden');
        }, 2200);
    }
});

// Copy Address
function copyAddress() {
    const address = '경기 수원시 권선구 세화로 116 2층';
    navigator.clipboard.writeText(address).then(() => {
        const toast = document.getElementById('copyToast');
        toast.classList.remove('show');
        void toast.offsetWidth;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    });
}

// Copy Account
function copyAccount(account) {
    navigator.clipboard.writeText(account).then(() => {
        const toast = document.getElementById('accountToast');
        toast.classList.remove('show');
        void toast.offsetWidth;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    });
}

// Toggle Accordion
function toggleAccordion(button) {
    const accordion = button.parentElement;
    accordion.classList.toggle('active');
}

// Guestbook
const GUESTBOOK_API = 'https://script.google.com/macros/s/AKfycbwHw51HDXV_RUrVonLZCs5nGpuysU26yG4p_es1bBW8Mp2mNfgqT79bTrVpD5U757C-Yg/exec';
const ITEMS_PER_PAGE = 5;
let allGuestbookData = [];
let currentPage = 1;

// Load guestbook entries
function loadGuestbook() {
    const listEl = document.getElementById('guestbookList');
    listEl.innerHTML = '<p class="guestbook-loading">메시지를 불러오는 중...</p>';

    fetch(GUESTBOOK_API)
        .then(res => res.json())
        .then(data => {
            allGuestbookData = data;
            currentPage = 1;
            renderGuestbook();
        })
        .catch(err => {
            listEl.innerHTML = '<p class="guestbook-empty">메시지를 불러오지 못했습니다.</p>';
        });
}

// Render guestbook with pagination
function renderGuestbook() {
    const listEl = document.getElementById('guestbookList');

    if (allGuestbookData.length === 0) {
        listEl.innerHTML = '<p class="guestbook-empty">아직 메시지가 없습니다. 첫 번째로 축하 메시지를 남겨주세요!</p>';
        return;
    }

    const totalPages = Math.ceil(allGuestbookData.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const pageData = allGuestbookData.slice(startIndex, endIndex);

    let html = pageData.map(item => `
        <div class="guestbook-item">
            <div class="guestbook-item-header">
                <span class="guestbook-item-name">${escapeHtml(item.name)}</span>
                <span class="guestbook-item-date">${escapeHtml(item.date)}</span>
            </div>
            <p class="guestbook-item-message">${escapeHtml(item.message)}</p>
            <button class="guestbook-delete-btn" onclick="deleteGuestbook(${item.id})">삭제</button>
        </div>
    `).join('');

    // Pagination UI
    if (totalPages > 1) {
        html += '<div class="guestbook-pagination">';
        html += `<button class="page-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>이전</button>`;
        html += `<span class="page-info">${currentPage} / ${totalPages}</span>`;
        html += `<button class="page-btn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>다음</button>`;
        html += '</div>';
    }

    listEl.innerHTML = html;
}

// Change page
function changePage(page) {
    const totalPages = Math.ceil(allGuestbookData.length / ITEMS_PER_PAGE);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderGuestbook();

    // Scroll to guestbook section
    document.querySelector('.section-guestbook').scrollIntoView({ behavior: 'smooth' });
}

// Submit guestbook entry
function submitGuestbook() {
    const nameEl = document.getElementById('guestName');
    const passwordEl = document.getElementById('guestPassword');
    const messageEl = document.getElementById('guestMessage');
    const submitBtn = document.querySelector('.guestbook-submit');

    const name = nameEl.value.trim();
    const password = passwordEl.value.trim();
    const message = messageEl.value.trim();

    if (!name || !password || !message) {
        alert('이름, 비밀번호, 메시지를 모두 입력해주세요.');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = '등록 중...';

    fetch(GUESTBOOK_API, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, password, message })
    })
    .then(() => {
        nameEl.value = '';
        passwordEl.value = '';
        messageEl.value = '';
        alert('메시지가 등록되었습니다!');
        loadGuestbook();
    })
    .catch(err => {
        alert('등록에 실패했습니다. 다시 시도해주세요.');
    })
    .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = '등록하기';
    });
}

// Delete guestbook entry
function deleteGuestbook(id) {
    const password = prompt('삭제하려면 비밀번호를 입력하세요:');
    if (password === null) return; // 취소 클릭

    if (!password.trim()) {
        alert('비밀번호를 입력해주세요.');
        return;
    }

    fetch(GUESTBOOK_API, {
        method: 'POST',
        redirect: 'follow',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: JSON.stringify({ action: 'delete', id, password: password.trim() })
    })
    .then(res => res.text())
    .then(text => {
        console.log('Response:', text);
        try {
            const data = JSON.parse(text);
            if (data.success) {
                alert('삭제되었습니다.');
                loadGuestbook();
            } else if (data.error === 'wrong_password') {
                alert('비밀번호가 일치하지 않습니다.');
            } else {
                alert('삭제 실패: ' + (data.error || 'unknown'));
            }
        } catch (e) {
            console.error('Parse error:', e, text);
            alert('응답 파싱 실패');
        }
    })
    .catch(err => {
        console.error('Fetch error:', err);
        alert('삭제 요청 실패: ' + err.message);
    });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load guestbook on page load
document.addEventListener('DOMContentLoaded', loadGuestbook);

// Download ICS for Apple Calendar
function downloadICS() {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Wedding Invitation//EN
BEGIN:VEVENT
DTSTART:20260509T133000
DTEND:20260509T153000
SUMMARY:박현수 ♥ 신하정 결혼식
DESCRIPTION:박현수 ♥ 신하정 결혼식에 초대합니다.
LOCATION:수원 메리빌리아 가든홀, 경기 수원시 권선구 세화로 116 2층
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'wedding.ics';
    link.click();
}

// Photo Viewer
(function() {
    'use strict';

    let currentIndex = 0;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let galleryImages = [];
    let isDragging = false;
    let dragStartY = 0;
    let currentTranslateY = 0;

    // DOM Elements
    const photoViewer = document.getElementById('photoViewer');
    const viewerImage = document.getElementById('viewerImage');
    const viewerContent = document.getElementById('viewerContent');
    const viewerLoading = document.getElementById('viewerLoading');
    const viewerClose = document.getElementById('viewerClose');
    const viewerPrev = document.getElementById('viewerPrev');
    const viewerNext = document.getElementById('viewerNext');
    const currentIndexEl = document.getElementById('currentIndex');
    const totalCountEl = document.getElementById('totalCount');
    const galleryItems = document.querySelectorAll('.gallery-item');

    // Initialize
    function init() {
        // Get original image sources from data-original attribute
        galleryImages = Array.from(galleryItems).map(item => {
            const original = item.dataset.original;
            if (original) {
                const a = document.createElement('a');
                a.href = original;
                return a.href;
            }
            return item.querySelector('img').src;
        });
        totalCountEl.textContent = galleryImages.length;

        // Gallery item click events
        galleryItems.forEach((item, index) => {
            item.addEventListener('click', () => openViewer(index));
        });

        // Viewer controls
        viewerClose.addEventListener('click', closeViewer);
        viewerPrev.addEventListener('click', () => navigateImage('prev'));
        viewerNext.addEventListener('click', () => navigateImage('next'));

        // Keyboard navigation
        document.addEventListener('keydown', handleKeydown);

        // Touch events for horizontal swipe
        viewerContent.addEventListener('touchstart', handleTouchStart, { passive: true });
        viewerContent.addEventListener('touchend', handleTouchEnd);

        // Image load event
        viewerImage.addEventListener('load', hideLoading);
        viewerImage.addEventListener('error', hideLoading);
    }

    // Show loading spinner
    function showLoading() {
        viewerLoading.classList.remove('hidden');
        viewerImage.style.opacity = '0';
    }

    // Hide loading spinner
    function hideLoading() {
        viewerLoading.classList.add('hidden');
        viewerImage.style.opacity = '1';
    }

    // Open photo viewer
    function openViewer(index) {
        currentIndex = index;
        showLoading();
        updateImage();
        photoViewer.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Close photo viewer
    function closeViewer() {
        photoViewer.classList.remove('active');
        document.body.style.overflow = '';
        viewerImage.style.transform = '';
    }

    // Update displayed image
    function updateImage() {
        viewerImage.src = galleryImages[currentIndex];
        currentIndexEl.textContent = currentIndex + 1;
    }

    // Navigate with animation
    function navigateImage(direction) {
        viewerImage.classList.add('fade-out');

        setTimeout(() => {
            showLoading();
            if (direction === 'prev') {
                currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
            } else {
                currentIndex = (currentIndex + 1) % galleryImages.length;
            }
            updateImage();
            viewerImage.classList.remove('fade-out');
        }, 200);
    }

    // Keyboard navigation
    function handleKeydown(e) {
        if (!photoViewer.classList.contains('active')) return;

        switch (e.key) {
            case 'Escape':
                closeViewer();
                break;
            case 'ArrowLeft':
                navigateImage('prev');
                break;
            case 'ArrowRight':
                navigateImage('next');
                break;
        }
    }

    // Touch start handler
    let isSingleTouch = false;

    function handleTouchStart(e) {
        // Only track single touch for swipe
        if (e.touches.length === 1) {
            isSingleTouch = true;
            touchStartX = e.touches[0].clientX;
        } else {
            isSingleTouch = false;
        }
    }

    // Touch end handler
    function handleTouchEnd(e) {
        // Only handle swipe if it was a single touch
        if (!isSingleTouch) return;

        touchEndX = e.changedTouches[0].clientX;

        const diffX = touchStartX - touchEndX;
        const swipeThreshold = 50;

        if (Math.abs(diffX) > swipeThreshold) {
            if (diffX > 0) {
                navigateImage('next');
            } else {
                navigateImage('prev');
            }
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
        const size = Math.random() * 8 + 8; // 8-16px
        const duration = Math.random() * 4 + 6; // 6-10s (slower)
        const delay = Math.random() * 0.5; // small delay variation

        petal.style.left = startX + 'vw';
        petal.style.width = size + 'px';
        petal.style.height = size + 'px';
        petal.style.animationDuration = duration + 's';
        petal.style.animationDelay = delay + 's';

        container.appendChild(petal);

        // Remove petal after animation
        setTimeout(() => {
            petal.remove();
        }, (duration + delay) * 1000 + 100);
    }

    function startPetalAnimation() {
        const container = createPetalsContainer();

        // Gradually create petals (no initial burst)
        let petalCount = 0;
        const maxPetals = 40;

        const interval = setInterval(() => {
            if (petalCount >= maxPetals) {
                clearInterval(interval);
                // Remove container after all petals are done
                setTimeout(() => {
                    container.remove();
                }, 12000);
                return;
            }
            // Create 1-2 petals at a time
            createPetal(container);
            if (Math.random() > 0.5) createPetal(container);
            petalCount++;
        }, 400);
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
        const locationTitle = document.querySelector('.location-title');
        const locationInfo = document.querySelector('.location-info');
        const locationMap = document.querySelector('.location-map-container');

        if (storyImage) storyImage.classList.add('fade-in-left');
        if (storyText) storyText.classList.add('fade-in-right');
        if (galleryTitle) galleryTitle.classList.add('fade-in');
        if (gallerySubtitle) gallerySubtitle.classList.add('fade-in');
        if (locationTitle) locationTitle.classList.add('fade-in');
        if (locationInfo) locationInfo.classList.add('fade-in');
        if (locationMap) locationMap.classList.add('scale-in');

        const accountTitle = document.querySelector('.account-title');
        const accountSubtitle = document.querySelector('.account-subtitle');
        const accountCards = document.querySelectorAll('.account-card');

        if (accountTitle) accountTitle.classList.add('fade-in');
        if (accountSubtitle) accountSubtitle.classList.add('fade-in');
        accountCards.forEach((card, index) => {
            card.classList.add('fade-in');
            card.style.transitionDelay = (index * 0.2) + 's';
        });

        const guestbookTitle = document.querySelector('.guestbook-title');
        const guestbookSubtitle = document.querySelector('.guestbook-subtitle');
        const guestbookForm = document.querySelector('.guestbook-form');
        const guestbookList = document.querySelector('.guestbook-list');

        if (guestbookTitle) guestbookTitle.classList.add('fade-in');
        if (guestbookSubtitle) guestbookSubtitle.classList.add('fade-in');
        if (guestbookForm) guestbookForm.classList.add('fade-in');
        if (guestbookList) guestbookList.classList.add('fade-in');

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
