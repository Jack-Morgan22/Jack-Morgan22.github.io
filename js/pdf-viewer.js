document.addEventListener('DOMContentLoaded', function() {
    // Select all the necessary elements
    const pdfLinks = document.querySelectorAll('.pdf-link');
    const viewerOverlay = document.querySelector('.pdf-viewer-overlay');
    const viewerContainer = document.querySelector('.pdf-embed-container');
    const closeButton = document.querySelector('.pdf-viewer-close');

    function openPdfViewer(pdfPath) {
        // Clear any previous PDF to ensure the new one loads correctly
        viewerContainer.innerHTML = '';

        // Use an <iframe> for best desktop compatibility
        const iframe = document.createElement('iframe');
        iframe.src = pdfPath;

        // Append the new iframe element to its container
        viewerContainer.appendChild(iframe);

        // Make the viewer visible
        viewerOverlay.classList.add('active');

        // Add keyboard listener for closing
        document.addEventListener('keydown', handleKeydown);
    }

    function closePdfViewer() {
        // Hide the viewer
        viewerOverlay.classList.remove('active');

        // Clear the container to stop the PDF from loading in the background and free up memory
        viewerContainer.innerHTML = '';

        // Remove the keyboard listener
        document.removeEventListener('keydown', handleKeydown);
    }

    function handleKeydown(e) {
        if (e.key === 'Escape') {
            closePdfViewer();
        }
    }

    // Attach click event to each PDF link
    pdfLinks.forEach(link => {
        link.addEventListener('click', function(e) {

            // --- LOGIC FOR MOBILE ---
            // 768px as the breakpoint, consistent with the CSS.
            if (window.innerWidth <= 768) {
                // On mobile-sized screens, don't use the custom viewer.
                // Instead, let the browser handle it.
                // ensure it opens in a new tab.
                link.setAttribute('target', '_blank');
                // By not calling e.preventDefault(), I allow the link's default
                // behavior (opening the href) to proceed.
                return;
            }

            // On desktop, prevent default and open the custom viewer.
            e.preventDefault();
            const pdfSource = this.dataset.pdfSrc;
            if (pdfSource) {
                openPdfViewer(pdfSource);
            }
        });
    });

    // Attach click events for closing the viewer
    closeButton.addEventListener('click', closePdfViewer);
    viewerOverlay.addEventListener('click', function(e) {
        // Close only if the click is on the dark background itself, not on the content
        if (e.target === viewerOverlay) {
            closePdfViewer();
        }
    });

});