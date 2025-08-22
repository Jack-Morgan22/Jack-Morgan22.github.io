/**
 * Fetches and inserts HTML content from a file into a specified element.
 * This function also ensures that any <script> tags within the loaded
 * HTML are executed.
 * @param {string} selector CSS selector for the placeholder element.
 * @param {string} url The path to the HTML component file.
 */
function loadComponent(selector, url) {
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.text();
        })
        .then(data => {
            const placeholder = document.querySelector(selector);
            if (placeholder) {
                placeholder.innerHTML = data;

                // Browsers often don't execute <script> tags inserted via innerHTML.
                // This code finds them, creates new script elements, and appends them
                // to the head to ensure they run.
                Array.from(placeholder.querySelectorAll("script")).forEach(oldScript => {
                    const newScript = document.createElement("script");
                    // Copy attributes
                    Array.from(oldScript.attributes).forEach(attr => {
                        newScript.setAttribute(attr.name, attr.value);
                    });
                    // Copy content
                    newScript.appendChild(document.createTextNode(oldScript.innerHTML));
                    // Replace the old script tag with the new one to execute it
                    oldScript.parentNode.replaceChild(newScript, oldScript);
                });
            }
        })
        .catch(error => console.error(`Error loading component from ${url}:`, error));
}

// When the DOM is ready, load the common components.
document.addEventListener('DOMContentLoaded', () => {
    loadComponent('#navbar-placeholder', 'components/navbar.html');
    loadComponent('#footer-placeholder', 'components/footer.html');
});