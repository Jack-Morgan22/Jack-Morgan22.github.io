document.addEventListener('DOMContentLoaded', function() {

    // ===================================
    // Part 1: Carousel Logic
    // ===================================
    const carouselGroups = document.querySelectorAll('.carousel-group');
    if (carouselGroups.length > 1) {
        let currentGroupIndex = 0;
        const rotationInterval = 6000;

        function rotateCarousel() {
            carouselGroups[currentGroupIndex].classList.remove('active');
            currentGroupIndex = (currentGroupIndex + 1) % carouselGroups.length;
            carouselGroups[currentGroupIndex].classList.add('active');
        }

        setInterval(rotateCarousel, rotationInterval);
    }

    // ===================================
    // Part 2: Lightbox Logic
    // ===================================
    const lightboxOverlay = document.querySelector('.lightbox-overlay');
    if (!lightboxOverlay) return; // Exit if no lightbox on the page

    const lightboxImage = lightboxOverlay.querySelector('.lightbox-image');
    const lightboxCaption = lightboxOverlay.querySelector('.lightbox-caption');
    const closeButton = lightboxOverlay.querySelector('.lightbox-close');
    const prevButton = lightboxOverlay.querySelector('.lightbox-prev');
    const nextButton = lightboxOverlay.querySelector('.lightbox-next');
    const showcaseLinks = document.querySelectorAll('.showcase-item a');

    let currentImageIndex;
    let currentImageSet;

    // This gives screen readers context for the buttons.
    if (prevButton) prevButton.setAttribute('aria-label', 'Previous image');
    if (nextButton) nextButton.setAttribute('aria-label', 'Next image');
    if (closeButton) closeButton.setAttribute('aria-label', 'Close image viewer');


    function openLightbox(imageSet, index) {
        currentImageSet = imageSet;
        currentImageIndex = index;
        updateLightboxImage();
        lightboxOverlay.classList.add('active');

        document.body.style.overflow = 'hidden';

        document.addEventListener('keydown', handleKeydown);
    }

    function closeLightbox() {
        lightboxOverlay.classList.remove('active');

        document.body.style.overflow = '';

        document.removeEventListener('keydown', handleKeydown);
    }

    function updateLightboxImage() {
        if (!currentImageSet || currentImageSet.length === 0) return;
        const link = currentImageSet[currentImageIndex];
        const image = link.querySelector('img');
        lightboxImage.src = link.href;
        lightboxCaption.textContent = image.alt;

        prevButton.style.display = (currentImageIndex === 0) ? 'none' : 'block';
        nextButton.style.display = (currentImageIndex === currentImageSet.length - 1) ? 'none' : 'block';
    }

    function navigateLightbox(direction) {
        const newIndex = currentImageIndex + direction;
        if (newIndex >= 0 && newIndex < currentImageSet.length) {
            currentImageIndex = newIndex;
            updateLightboxImage();
        }
    }

    function handleKeydown(e) {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') navigateLightbox(1); // Use the new function
        if (e.key === 'ArrowLeft') navigateLightbox(-1); // Use the new function
    }

    showcaseLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const activeGroup = link.closest('.carousel-group');
            const linksInGroup = Array.from(activeGroup.querySelectorAll('.showcase-item a'));
            const indexInGroup = linksInGroup.indexOf(link);
            openLightbox(linksInGroup, indexInGroup);
        });
    });

    closeButton.addEventListener('click', closeLightbox);
    prevButton.addEventListener('click', () => navigateLightbox(-1)); // Use the new function
    nextButton.addEventListener('click', () => navigateLightbox(1)); // Use the new function

    lightboxOverlay.addEventListener('click', (e) => {
        if (e.target === lightboxOverlay) {
            closeLightbox();
        }
    });
});
