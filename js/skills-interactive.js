document.addEventListener('DOMContentLoaded', () => {
    // === Part 1: Animate cards on scroll ===
    const skillCards = document.querySelectorAll('.skill-card');

    if (skillCards.length) {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        skillCards.forEach(card => {
            observer.observe(card);
        });
    }

    // === Power in-card interactive showcases ===
    const interactiveShowcases = document.querySelectorAll('.interactive-showcase');

    interactiveShowcases.forEach(showcase => {
        const mediaContent = showcase.querySelectorAll('.media-content');
        const navDots = showcase.querySelectorAll('.nav-dot');

        if (mediaContent.length === 0 || navDots.length === 0) return;

        navDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                // Remove active class from all items
                mediaContent.forEach(content => content.classList.remove('active'));
                navDots.forEach(d => d.classList.remove('active'));

                // Add active class to the clicked item
                mediaContent[index].classList.add('active');
                dot.classList.add('active');
            });
        });
    });
});
