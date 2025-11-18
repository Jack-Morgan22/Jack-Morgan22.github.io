/*
======================================================
  PROJECT_EXPANDER.JS - Handles "Read More" functionality
======================================================
*/

function initDescriptionExpanders() {
    // Select all project cards that have been rendered to the grid
    const projectCards = document.querySelectorAll('#project-grid .project-card');

    projectCards.forEach(card => {
        const wrapper = card.querySelector('.description-wrapper');
        const description = card.querySelector('.project-description');

        if (!wrapper || !description) return;

        // Check if the text is actually overflowing. scrollHeight is the total height, clientHeight is the visible height.
        const isOverflowing = description.scrollHeight > description.clientHeight;

        if (isOverflowing) {
            // If the text overflows, create and add the "Read More" button
            const readMoreBtn = document.createElement('button');
            readMoreBtn.className = 'read-more-btn';
            readMoreBtn.textContent = 'Read More';
            wrapper.appendChild(readMoreBtn);

            // Add the click event listener
            readMoreBtn.addEventListener('click', () => {
                // Toggle the 'expanded' class on the wrapper
                wrapper.classList.toggle('expanded');

                // Update the button text based on the state
                if (wrapper.classList.contains('expanded')) {
                    readMoreBtn.textContent = 'Read Less';
                } else {
                    readMoreBtn.textContent = 'Read More';
                }
            });
        }
    });
}
