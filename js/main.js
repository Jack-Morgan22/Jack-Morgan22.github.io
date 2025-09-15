document.addEventListener('DOMContentLoaded', () => {
    const navButtons = document.querySelectorAll('.panel-nav-button');
    const contentPanels = document.querySelectorAll('.content-panel');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active state from all buttons and panels
            navButtons.forEach(btn => btn.classList.remove('active'));
            contentPanels.forEach(panel => panel.classList.remove('active'));

            // Add active state to the clicked button
            button.classList.add('active');

            // Find and display the target panel
            const targetPanelId = button.getAttribute('data-target');
            const targetPanel = document.getElementById(targetPanelId);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });
});
