document.addEventListener('DOMContentLoaded', () => {
    const backgroundContainer = document.getElementById('background-container');
    if (!backgroundContainer) return;

    // --- Configuration ---
    const iconCount = 15; // A good number for a subtle, uncluttered look

    // Array of modern, minimal gaming controller/peripheral SVG strings
    const svgIcons = [

        // Nintendo Switch-style Joy-Cons (more iconic silhouette)
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
     <rect x="3" y="2" width="7" height="20" rx="2"/>
     <rect x="14" y="2" width="7" height="20" rx="2"/>
     <circle cx="6.5" cy="8" r="0.8"/>
     <circle cx="6.5" cy="16" r="0.8"/>
     <circle cx="17.5" cy="12" r="0.8"/>
     <path d="M16 9l2 2-2 2"/>
   </svg>`,

        // Keyboard (block grid layout, clearer than just lines)
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
     <rect x="2" y="6" width="20" height="12" rx="2"/>
     <circle cx="6" cy="10" r="0.7"/>
     <circle cx="10" cy="10" r="0.7"/>
     <circle cx="14" cy="10" r="0.7"/>
     <circle cx="18" cy="10" r="0.7"/>
     <rect x="6" y="14" width="12" height="1.5" rx="0.5"/>
   </svg>`,

// Game Controller (classic silhouette)
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
   <rect x="3" y="8" width="18" height="8" rx="4"/>
   <path d="M8 16l-1.5 2.5a2 2 0 0 1-3.5-1V9a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8.5a2 2 0 0 1-3.5 1L16 16"/>
   <path d="M9 12h.01M15 12h.01"/>
   <path d="M12 10v4"/>
   <circle cx="16.5" cy="11.5" r="0.8"/>
   <circle cx="18.5" cy="13.5" r="0.8"/>
 </svg>`

    ];

    for (let i = 0; i < iconCount; i++) {
        const iconContainer = document.createElement('div');
        iconContainer.classList.add('bg-icon');

        iconContainer.innerHTML = svgIcons[Math.floor(Math.random() * svgIcons.length)];

        iconContainer.style.top = `${Math.random() * 100}vh`;
        iconContainer.style.left = `${Math.random() * 100}vw`;

        const size = Math.random() * 50 + 25; // Size between 25px and 75px
        iconContainer.style.width = `${size}px`;
        iconContainer.style.height = `${size}px`;

        iconContainer.style.opacity = Math.random() * 0.08 + 0.03; // Even more faint: 0.03 to 0.11

        iconContainer.style.animationDuration = `${Math.random() * 30 + 20}s`; // 20s to 50s
        iconContainer.style.animationDelay = `${Math.random() * 10}s`;

        backgroundContainer.appendChild(iconContainer);
    }
});
