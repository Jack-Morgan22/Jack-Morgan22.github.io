document.addEventListener('DOMContentLoaded', () => {
    const backgroundContainer = document.getElementById('background-container');
    if (!backgroundContainer) return;

    // --- Configuration ---
    const iconCount = 15; // Reduced count as SVG outlines take more visual space

    // Array of SVG icon strings. The "currentColor" property means they will inherit their color from the CSS.
    const svgIcons = [
        // Gamepad
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M6.63 8.37a2.5 2.5 0 0 1 0-4.74l3.1-1.12a2.5 2.5 0 0 1 2.54 0l3.1 1.12a2.5 2.5 0 0 1 0 4.74l-3.1 1.12a2.5 2.5 0 0 1-2.54 0z"/><path d="M12 12v3"/><path d="M8 12h8"/><path d="M18 12h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2"/><path d="M6 12H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2"/></svg>`,
        // Mouse
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="7"/><path d="M12 6v4"/></svg>`,
        // Keyboard
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 10h.01"/><path d="M10 10h.01"/><path d="M14 10h.01"/><path d="M18 10h.01"/><path d="M6 14h.01"/><path d="M10 14h8"/></svg>`
    ];

    for (let i = 0; i < iconCount; i++) {
        const iconContainer = document.createElement('div');
        iconContainer.classList.add('bg-icon');

        // Pick a random SVG icon string and inject it
        iconContainer.innerHTML = svgIcons[Math.floor(Math.random() * svgIcons.length)];

        // Random position on the screen
        iconContainer.style.top = `${Math.random() * 100}vh`;
        iconContainer.style.left = `${Math.random() * 100}vw`;

        // Random size
        const size = Math.random() * 50 + 25; // Size between 25px and 75px
        iconContainer.style.width = `${size}px`;
        iconContainer.style.height = `${size}px`;

        // Random, very low opacity to keep it "faint"
        iconContainer.style.opacity = Math.random() * 0.1 + 0.05; // Opacity between 0.05 and 0.15

        // Slower, more ambient animation duration and random delay
        iconContainer.style.animationDuration = `${Math.random() * 30 + 20}s`; // 20s to 50s
        iconContainer.style.animationDelay = `${Math.random() * 10}s`;

        backgroundContainer.appendChild(iconContainer);
    }
});
