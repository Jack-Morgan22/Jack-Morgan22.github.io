// --- XML Data Loading and Parsing ---
async function loadProjectsData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "application/xml");
        return parseProjectsXML(xmlDoc);
    } catch (error) {
        console.error("Failed to load or parse projects data:", error);
        return [];
    }
}

function parseProjectsXML(xmlDoc) {
    const projectNodes = xmlDoc.querySelectorAll("project");
    const projects = [];
    const getText = (node, selector) => node.querySelector(selector)?.textContent.trim() ?? null;
    const getArray = (node, selector) => Array.from(node.querySelectorAll(selector)).map(el => el.textContent.trim());

    projectNodes.forEach(node => {
        const stores = Array.from(node.querySelectorAll("storeLinks > store")).map(storeNode => ({ name: getText(storeNode, "name"), url: getText(storeNode, "url") }));
        const tags = {};
        node.querySelectorAll("tags > *").forEach(category => {
            const tagValues = getArray(category, "tag");
            if (tagValues.length > 0) tags[category.tagName] = tagValues;
        });
        projects.push({
            title: getText(node, "title"), description: getText(node, "description"), thumbnail: getText(node, "thumbnail"), gallery: getArray(node, "gallery > image"), trailer: getText(node, "trailer"),
            stores: stores.length > 0 ? stores : [], Website: getText(node, "website"), projectCategory: getText(node, "projectCategory"), projectType: getText(node, "projectType"),
            collaborationType: getText(node, "collaborationType"), engine: getArray(node, "engines > engine"), platform: getArray(node, "platforms > platform"), language: getArray(node, "languages > language"),
            tags: tags, startDate: getText(node, "startDate"), endDate: getText(node, "endDate"),
        });
    });
    return projects;
}

// --- Project View Categorization ---
function assignProjectViews(project) {
    const views = new Set();
    const searchableText = `${project.title.toLowerCase()} ${project.description.toLowerCase()}`;
    if (project.projectType === 'Game' || project.projectType === 'Game Design') views.add('Game Development');
    const itKeywords = ['website', 'e-commerce', 'software', 'api', 'cloud', 'aws', 'automation', 'robotics', 'app', 'database'];
    if (itKeywords.some(kw => searchableText.includes(kw)) || ['Website', 'E-commerce', 'Software', 'Robotics'].includes(project.projectType)) {
        views.add('IT & Infrastructure');
    }
    const cyberKeywords = ['security', 'cyber', 'encryption', 'cipher', 'validation', 'testing', 'quality assurance'];
    if (cyberKeywords.some(kw => searchableText.includes(kw)) || (project.thumbnail && project.thumbnail.includes('Circuit_Design_Mini_Project'))) {
        views.add('Cybersecurity');
    }
    project.views = Array.from(views);
}

// --- Main Application Logic ---
document.addEventListener('DOMContentLoaded', () => {
    loadProjectsData('projects-data.xml').then(projectsData => {
        if (!projectsData || projectsData.length === 0) {
            document.getElementById('project-grid').innerHTML = '<p class="no-results">Error: Could not load project data.</p>';
            return;
        }
        projectsData.forEach(assignProjectViews);
        initializePage(projectsData);
    });
});

function initializePage(projectsData) {
    // --- DOM Element References ---
    const projectGrid = document.getElementById('project-grid');
    if (!projectGrid) return;
    const viewSwitcher = document.getElementById('view-switcher');
    let currentView = 'all';
    const gameFiltersContainer = document.getElementById('game-filters-container');
    const itFiltersContainer = document.getElementById('it-filters-container');
    const cyberFiltersContainer = document.getElementById('cyber-filters-container');
    const searchBar = document.getElementById('search-bar');
    const projectCategoryFilter = document.getElementById('filter-project-category');
    const languageFilter = document.getElementById('filter-language');
    const resetFiltersBtn = document.getElementById('reset-filters-btn');
    const projectCount = document.getElementById('project-count');
    const engineFilter = document.getElementById('filter-engine');
    const platformFilter = document.getElementById('filter-platform');
    const gameTechFilter = document.getElementById('filter-game-tech');
    const itTechFilter = document.getElementById('filter-it-tech');
    const itPlatformFilter = document.getElementById('filter-it-platform');
    const cyberConceptFilter = document.getElementById('filter-cyber-concept');
    const itSkillFilter = document.getElementById('filter-it-skill');
    const cyberSkillFilter = document.getElementById('filter-cyber-skill');

    const parseDate = (dateString) => (dateString.toLowerCase() === 'present') ? new Date(8640000000000000) : new Date(dateString);
    projectsData.sort((a, b) => parseDate(b.endDate) - parseDate(a.endDate) || parseDate(b.startDate) - parseDate(a.startDate));

    function populateFilters() {
        const categories = new Set(), languages = new Set(), engines = new Set(), platforms = new Set();
        const gameMechanics = new Set(), itSoftware = new Set(), itSkills = new Set(), cyberConcepts = new Set(), itPlatforms = new Set(), cyberSkills = new Set();

        projectsData.forEach(p => {
            if (p.projectCategory) categories.add(p.projectCategory);
            p.language.forEach(l => languages.add(l));

            if (p.views.includes('Game Development')) {
                p.engine.forEach(e => engines.add(e));
                p.platform.forEach(pl => platforms.add(pl.split(' (')[0]));
                p.tags.Mechanics?.forEach(tag => gameMechanics.add(tag));
            }
            if (p.views.includes('IT & Infrastructure')) {
                p.platform.forEach(pl => itPlatforms.add(pl.split(' (')[0]));
                p.tags.Software?.forEach(tag => itSoftware.add(tag));
                p.tags.Skills?.forEach(tag => itSkills.add(tag));
            }
            if (p.views.includes('Cybersecurity')) {
                p.tags.Mechanics?.forEach(tag => cyberConcepts.add(tag));
                p.tags.Skills?.forEach(tag => cyberSkills.add(tag));
            }
        });

        const populate = (select, options) => {
            if (!select) return;
            const sorted = [...options].sort((a, b) => a.localeCompare(b));
            select.innerHTML = `<option value="all">${select.firstElementChild.textContent}</option>`;
            sorted.forEach(opt => select.innerHTML += `<option value="${opt}">${opt}</option>`);
        };

        populate(projectCategoryFilter, categories);
        populate(languageFilter, languages);
        populate(engineFilter, engines);
        populate(platformFilter, platforms);
        populate(gameTechFilter, gameMechanics);
        populate(itTechFilter, itSoftware);
        populate(itPlatformFilter, itPlatforms);
        populate(itSkillFilter, itSkills);
        populate(cyberConceptFilter, cyberConcepts);
        populate(cyberSkillFilter, cyberSkills);
    }

    function renderProjects(filteredProjects) {
        projectGrid.innerHTML = '';
        if (filteredProjects.length === 0) { projectGrid.innerHTML = `<p class="no-results">No projects match the selected filters. Try a different view or reset the filters.</p>`; return; }
        const sanitizeForCss = (str) => str.toLowerCase().replace('c#', 'csharp').replace('c++', 'cpp').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        filteredProjects.forEach(project => {
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';
            let headerHTML;
            if (project.gallery && project.gallery.length > 1) {
                const images = project.gallery.map((img, index) => `<img src="${img}" alt="${project.title} screenshot ${index + 1}" class="carousel-image ${index === 0 ? 'active' : ''}">`).join('');
                const dots = project.gallery.map((_, index) => `<span class="dot ${index === 0 ? 'active' : ''}" data-index="${index}"></span>`).join('');
                headerHTML = `<div class="image-carousel"><div class="carousel-images">${images}</div><div class="carousel-dots">${dots}</div></div>`;
            } else { headerHTML = `<img src="${project.thumbnail}" alt="${project.title}" class="project-thumbnail">`; }
            const categoryPill = project.projectCategory ? `<span class="type-pill ${sanitizeForCss(project.projectCategory)}">${project.projectCategory}</span>` : '';
            const typePill = project.projectType ? `<span class="type-pill ${sanitizeForCss(project.projectType)}">${project.projectType}</span>` : '';
            const collabPill = project.collaborationType ? `<span class="type-pill">${project.collaborationType}</span>` : '';
            const languages = (project.language || []).map(lang => `<span class="language-pill lang-${sanitizeForCss(lang)}">${lang}</span>`).join('');
            const languageSection = languages ? `<div class="project-languages">${languages}</div>` : '';
            const descriptionHTML = `<div class="description-wrapper"><p class="project-description">${project.description}</p></div>`;
            const tagSections = Object.entries(project.tags).map(([category, tags]) => {
                if (!tags || tags.length === 0) return '';
                const formattedCategoryName = category.replace(/-/g, ' ');
                const categoryClass = `tag-${sanitizeForCss(category)}`;
                const tagPills = tags.map(tag => `<span class="tag-pill ${categoryClass}">${tag}</span>`).join('');
                return `<div class="project-details-section"><h6>${formattedCategoryName}</h6><div class="project-tags">${tagPills}</div></div>`;
            }).join('');
            const footerButtons = [];
            if (project.trailer) footerButtons.push(`<a href="#" class="action-button trailer-button" data-trailer-url="${project.trailer}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4V20L20 12L7 4Z"></path></svg> Watch Trailer</a>`);
            if (project.stores && project.stores.length > 0) {
                project.stores.forEach(store => footerButtons.push(`<a href="${store.url}" target="_blank" rel="noopener noreferrer" class="action-button store-button"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12.0006 18.26L4.94715 22.2082L6.52248 14.2799L0.587891 8.7918L8.61483 7.84006L12.0006 0.5L15.3864 7.84006L23.4133 8.7918L17.4787 14.2799L19.054 22.2082L12.0006 18.26Z"></path></svg> ${store.name}</a>`));
            }
            if (project.Website) {
                if (project.Website.endsWith('.pdf')) footerButtons.push(`<a href="${project.Website}" class="action-button website-button pdf-link" data-pdf-src="${project.Website}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM16 18H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"></path></svg> View Document</a>`);
                else footerButtons.push(`<a href="${project.Website}" target="_blank" rel="noopener noreferrer" class="action-button website-button"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"></path></svg> Visit Website</a>`);
            }
            const footerHTML = footerButtons.join('');
            const cardFooter = footerHTML ? `<div class="project-card-footer">${footerHTML}</div>` : '';
            projectCard.innerHTML = `<div class="project-card-header">${headerHTML}<div class="project-date">${project.startDate} &ndash; ${project.endDate}</div></div><div class="project-info"><div class="project-types">${categoryPill}${typePill}${collabPill}</div><h3 class="project-title">${project.title}</h3>${languageSection}${descriptionHTML}${tagSections}</div>${cardFooter}`;
            projectGrid.appendChild(projectCard);
        });
        initDescriptionExpanders();
    }

    function applyFilters() {
        let viewFilteredProjects = (currentView === 'all') ? projectsData : projectsData.filter(p => p.views.includes(currentView));
        const searchTerm = searchBar.value.toLowerCase();
        const selectedCategory = projectCategoryFilter.value;
        const selectedLang = languageFilter.value;
        const selectedEngine = engineFilter.value;
        const selectedPlatform = platformFilter.value;
        const selectedGameTech = gameTechFilter.value;
        const selectedItTech = itTechFilter.value;
        const selectedItPlatform = itPlatformFilter.value;
        const selectedItSkill = itSkillFilter.value;
        const selectedCyberConcept = cyberConceptFilter.value;
        const selectedCyberSkill = cyberSkillFilter.value;

        const finalFilteredProjects = viewFilteredProjects.filter(p => {
            const allTags = Object.values(p.tags).flat();
            const categoryMatch = selectedCategory === 'all' || p.projectCategory === selectedCategory;
            const langMatch = selectedLang === 'all' || p.language.includes(selectedLang);
            const searchMatch = !searchTerm || p.title.toLowerCase().includes(searchTerm) || p.description.toLowerCase().includes(searchTerm) || allTags.some(t => t.toLowerCase().includes(searchTerm));
            const engineMatch = currentView !== 'Game Development' || selectedEngine === 'all' || p.engine.includes(selectedEngine);
            const platformMatch = currentView !== 'Game Development' || selectedPlatform === 'all' || p.platform.some(pl => pl.includes(selectedPlatform));
            const gameTechMatch = currentView !== 'Game Development' || selectedGameTech === 'all' || allTags.includes(selectedGameTech);
            const itTechMatch = currentView !== 'IT & Infrastructure' || selectedItTech === 'all' || (p.tags.Software && p.tags.Software.includes(selectedItTech));
            const itPlatformMatch = currentView !== 'IT & Infrastructure' || selectedItPlatform === 'all' || p.platform.some(pl => pl.includes(selectedItPlatform));
            const itSkillMatch = currentView !== 'IT & Infrastructure' || selectedItSkill === 'all' || (p.tags.Skills && p.tags.Skills.includes(selectedItSkill));
            const cyberConceptMatch = currentView !== 'Cybersecurity' || selectedCyberConcept === 'all' || (p.tags.Mechanics && p.tags.Mechanics.includes(selectedCyberConcept));
            const cyberSkillMatch = currentView !== 'Cybersecurity' || selectedCyberSkill === 'all' || (p.tags.Skills && p.tags.Skills.includes(selectedCyberSkill));

            return categoryMatch && langMatch && searchMatch && engineMatch && platformMatch && gameTechMatch && itTechMatch && itPlatformMatch && itSkillMatch && cyberConceptMatch && cyberSkillMatch;
        });
        projectCount.textContent = `Showing ${finalFilteredProjects.length} of ${projectsData.length} total projects`;
        renderProjects(finalFilteredProjects);
        updateURLWithFilters();
    }

    function updateFilterVisibility() {
        gameFiltersContainer.classList.toggle('hidden', currentView !== 'Game Development');
        itFiltersContainer.classList.toggle('hidden', currentView !== 'IT & Infrastructure');
        cyberFiltersContainer.classList.toggle('hidden', currentView !== 'Cybersecurity');
    }

    function resetAllFilters() {
        document.querySelectorAll('.filter-select').forEach(sel => sel.value = 'all');
        searchBar.value = '';
        currentView = 'all';
        viewSwitcher.querySelector('.view-button.active')?.classList.remove('active');
        viewSwitcher.querySelector('[data-view="all"]').classList.add('active');
        updateFilterVisibility();
        applyFilters();
    }

    function updateURLWithFilters() {
        const params = new URLSearchParams();
        if (currentView !== 'all') params.set('view', currentView);
        const setParam = (key, el) => { if (el?.value && el.value !== 'all' && el.value.trim() !== '') params.set(key, el.value); };
        setParam('search', searchBar); setParam('category', projectCategoryFilter); setParam('lang', languageFilter);
        if (currentView === 'Game Development') { setParam('engine', engineFilter); setParam('platform', platformFilter); setParam('gametech', gameTechFilter); }
        if (currentView === 'IT & Infrastructure') { setParam('ittech', itTechFilter); setParam('itplatform', itPlatformFilter); setParam('itskill', itSkillFilter); }
        if (currentView === 'Cybersecurity') { setParam('cyberconcept', cyberConceptFilter); setParam('cyberskill', cyberSkillFilter); }
        const newUrl = params.toString() ? `${window.location.pathname}?${params}` : window.location.pathname;
        history.pushState({ path: newUrl }, '', newUrl);
    }

    function applyFiltersFromURL() {
        const params = new URLSearchParams(window.location.search);
        if (params.has('view')) {
            const viewFromURL = params.get('view');
            const targetButton = viewSwitcher.querySelector(`[data-view="${viewFromURL}"]`);
            if (targetButton) {
                viewSwitcher.querySelector('.view-button.active')?.classList.remove('active');
                targetButton.classList.add('active');
                currentView = viewFromURL;
            }
        }
        updateFilterVisibility();
        const setFilter = (key, el) => { if (params.has(key) && el) el.value = params.get(key); };
        setFilter('search', searchBar); setFilter('category', projectCategoryFilter); setFilter('lang', languageFilter);
        setFilter('engine', engineFilter); setFilter('platform', platformFilter); setFilter('gametech', gameTechFilter);
        setFilter('ittech', itTechFilter); setFilter('itplatform', itPlatformFilter); setFilter('itskill', itSkillFilter);
        setFilter('cyberconcept', cyberConceptFilter); setFilter('cyberskill', cyberSkillFilter);
    }

    viewSwitcher.addEventListener('click', (e) => {
        const targetButton = e.target.closest('.view-button');
        if (targetButton && targetButton.dataset.view !== currentView) {
            currentView = targetButton.dataset.view;
            viewSwitcher.querySelector('.view-button.active')?.classList.remove('active');
            targetButton.classList.add('active');
            updateFilterVisibility();
            applyFilters();
        }
    });

    document.querySelectorAll('.search-input, .filter-select').forEach(el => el.addEventListener('input', applyFilters));
    resetFiltersBtn?.addEventListener('click', resetAllFilters);

    const modalHTML = `<div id="trailer-modal" class="modal-overlay"><div class="modal-content"><button id="modal-close" class="modal-close-button">&times;</button><div class="video-container"><iframe id="trailer-iframe" src="" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div></div></div>`;
    if (!document.getElementById('trailer-modal')) document.body.insertAdjacentHTML('beforeend', modalHTML);

    const trailerModal = document.getElementById('trailer-modal'), modalCloseBtn = document.getElementById('modal-close'), trailerIframe = document.getElementById('trailer-iframe');
    const pdfViewerOverlay = document.getElementById('pdf-viewer-overlay'), pdfViewerContainer = document.getElementById('pdf-embed-container'), pdfCloseButton = document.getElementById('pdf-viewer-close');

    const openTrailerModal = (url) => {
        let embedUrl = url;
        if (url.includes("youtube.com/playlist")) { const listId = new URL(url).searchParams.get("list"); if (listId) embedUrl = `https://www.youtube.com/embed/videoseries?list=${listId}`; }
        else if (url.includes("youtu.be/")) { const videoId = url.split("youtu.be/")[1].split("?")[0]; if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`; }
        trailerIframe.src = embedUrl;
        trailerModal.style.display = 'flex';
        setTimeout(() => trailerModal.classList.add('visible'), 10);
        document.addEventListener('keydown', handleEscKey);
    };
    const closeTrailerModal = () => {
        trailerModal.classList.remove('visible');
        setTimeout(() => { trailerModal.style.display = 'none'; trailerIframe.src = ''; }, 300);
        document.removeEventListener('keydown', handleEscKey);
    };
    const openPdfViewer = (pdfPath) => {
        pdfViewerContainer.innerHTML = `<iframe src="${pdfPath}"></iframe>`;
        pdfViewerOverlay.style.display = 'flex';
        setTimeout(() => pdfViewerOverlay.classList.add('visible'), 10);
        document.addEventListener('keydown', handleEscKey);
    };
    const closePdfViewer = () => {
        pdfViewerOverlay.classList.remove('visible');
        setTimeout(() => { pdfViewerOverlay.style.display = 'none'; pdfViewerContainer.innerHTML = ''; }, 300);
        document.removeEventListener('keydown', handleEscKey);
    };
    const handleEscKey = (e) => { if (e.key === 'Escape') { closeTrailerModal(); closePdfViewer(); } };

    modalCloseBtn.addEventListener('click', closeTrailerModal);
    trailerModal.addEventListener('click', (e) => e.target === trailerModal && closeTrailerModal());
    pdfCloseButton.addEventListener('click', closePdfViewer);
    pdfViewerOverlay.addEventListener('click', (e) => e.target === pdfViewerOverlay && closePdfViewer());

    projectGrid.addEventListener('click', e => {
        const trailerBtn = e.target.closest('.trailer-button');
        if (trailerBtn) { e.preventDefault(); openTrailerModal(trailerBtn.dataset.trailerUrl); }
        const pdfLink = e.target.closest('.pdf-link');
        if (pdfLink) {
            e.preventDefault();
            if (window.innerWidth <= 768) { window.open(pdfLink.href, '_blank'); }
            else { openPdfViewer(pdfLink.dataset.pdfSrc); }
        }
        const dot = e.target.closest('.dot');
        if (dot) {
            const cardHeader = dot.closest('.project-card-header');
            const newIndex = parseInt(dot.dataset.index, 10);
            cardHeader.querySelector('.carousel-image.active')?.classList.remove('active');
            cardHeader.querySelector('.dot.active')?.classList.remove('active');
            cardHeader.querySelectorAll('.carousel-image')[newIndex].classList.add('active');
            dot.classList.add('active');
        }
    });

    projectGrid.addEventListener('mousemove', e => {
        for (const card of projectGrid.getElementsByClassName("project-card")) {
            const rect = card.getBoundingClientRect();
            card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
            card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
        }
    });

    populateFilters();
    applyFiltersFromURL();
    applyFilters();
}
