// --- XML Data Loading and Parsing ---
async function loadProjectsData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "application/xml");
        return parseProjectsXML(xmlDoc);
    } catch (error) {
        console.error("Failed to load or parse projects data:", error);
        return []; // Return empty array on failure
    }
}

function parseProjectsXML(xmlDoc) {
    const projectNodes = xmlDoc.querySelectorAll("project");
    const projects = [];

    const getText = (node, selector) => {
        const element = node.querySelector(selector);
        return element && element.textContent ? element.textContent.trim() : null;
    };

    const getArray = (node, selector) => {
        return Array.from(node.querySelectorAll(selector)).map(el => el.textContent.trim());
    };

    projectNodes.forEach(node => {
        const storeNodes = node.querySelectorAll("storeLinks > store");
        const stores = Array.from(storeNodes).map(storeNode => ({
            name: getText(storeNode, "name"),
            url: getText(storeNode, "url")
        }));

        const tags = {};
        const tagCategories = node.querySelectorAll("tags > *");
        tagCategories.forEach(category => {
            const categoryName = category.tagName;
            const tagValues = getArray(category, "tag");
            if (tagValues.length > 0) {
                tags[categoryName] = tagValues;
            }
        });

        const project = {
            title: getText(node, "title"),
            description: getText(node, "description"),
            thumbnail: getText(node, "thumbnail"),
            gallery: getArray(node, "gallery > image"),
            trailer: getText(node, "trailer"),
            storeLink: getText(node, "storeLink"),
            stores: stores.length > 0 ? stores : [],
            Website: getText(node, "website"),
            projectCategory: getText(node, "projectCategory"),
            projectType: getText(node, "projectType"),
            collaborationType: getText(node, "collaborationType"),
            engine: getArray(node, "engines > engine"),
            platform: getArray(node, "platforms > platform"),
            language: getArray(node, "languages > language"),
            tags: tags,
            startDate: getText(node, "startDate"),
            endDate: getText(node, "endDate"),
        };

        projects.push(project);
    });
    return projects;
}


// --- Main Application Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const dataUrl = 'projects-data.xml';

    loadProjectsData(dataUrl).then(projectsData => {
        if (!projectsData || projectsData.length === 0) {
            console.error("No project data loaded. Aborting initialization.");
            document.getElementById('project-grid').innerHTML = '<p class="no-results">Error: Could not load project data.</p>';
            return;
        }
        initializePage(projectsData);
    });
});

function initializePage(projectsData) {
    const projectGrid = document.getElementById('project-grid');
    if (!projectGrid) return;

    const searchBar = document.getElementById('search-bar');
    const projectTypeFilter = document.getElementById('filter-project-type');
    const projectCategoryFilter = document.getElementById('filter-project-category');
    const teamTypeFilter = document.getElementById('filter-team-type');
    const languageFilter = document.getElementById('filter-language');
    const platformFilter = document.getElementById('filter-platform');
    const engineFilter = document.getElementById('filter-engine');
    const technologyFilter = document.getElementById('filter-technology');
    const resetFiltersBtn = document.getElementById('reset-filters-btn');
    const projectCount = document.getElementById('project-count');
    const gameFiltersContainer = document.getElementById('game-filters-container');

    function parseDate(dateString) { if (dateString.toLowerCase() === 'present') return new Date(8640000000000000); return new Date(dateString); }
    projectsData.sort((a, b) => { const dateB = parseDate(b.endDate); const dateA = parseDate(a.endDate); if (dateB !== dateA) return dateB - dateA; return parseDate(b.startDate) - parseDate(a.startDate); });

    function populateFilters() {
        const types = new Set();
        const categories = new Set();
        const teamTypes = new Set();
        const languages = new Set();
        const gamePlatforms = new Set();
        const engines = new Set();
        const technologies = new Set();

        projectsData.forEach(p => {
            if (p.projectType) types.add(p.projectType);
            if (p.projectCategory) categories.add(p.projectCategory);
            if (p.collaborationType) teamTypes.add(p.collaborationType);
            p.language.forEach(l => languages.add(l));
            Object.values(p.tags).flat().forEach(tag => technologies.add(tag));
            if (p.projectType === 'Game') {
                p.engine.forEach(e => engines.add(e));
                p.platform.forEach(pl => gamePlatforms.add(pl.split(' ')[0]));
            }
        });

        const populate = (selectElement, options, sortFn = (a, b) => a.localeCompare(b)) => {
            if (!selectElement) return;
            const sortedOptions = [...options].sort(sortFn);
            selectElement.innerHTML = `<option value="all">${selectElement.firstElementChild.textContent}</option>`;
            sortedOptions.forEach(option => {
                selectElement.innerHTML += `<option value="${option}">${option}</option>`;
            });
        };

        const categoryOrder = ['Professional', 'Personal', 'Academic'];
        populate(projectTypeFilter, types);
        populate(projectCategoryFilter, categories, (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b));
        populate(teamTypeFilter, teamTypes);
        populate(languageFilter, languages);
        populate(platformFilter, gamePlatforms);
        populate(engineFilter, engines);
        populate(technologyFilter, technologies);
    }

    const modalHTML = `<div id="trailer-modal" class="modal-overlay"><div class="modal-content"><button id="modal-close" class="modal-close-button">&times;</button><div class="video-container"><iframe id="trailer-iframe" src="" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div></div></div>`;
    if (!document.getElementById('trailer-modal')) {
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    const trailerModal = document.getElementById('trailer-modal'), modalCloseBtn = document.getElementById('modal-close'), trailerIframe = document.getElementById('trailer-iframe');
    const openTrailerModal = (url) => {let embedUrl; if (url.includes('youtube.com/embed/')) { embedUrl = url; } else if (url.includes('youtube.com/playlist')) {const pId = new URL(url).searchParams.get('list'); if (pId) embedUrl = `https://www.youtube.com/embed/videoseries?list=${pId}`;} else if (url.includes('youtu.be/')) {const vId = url.split('youtu.be/')[1].split('?')[0]; if (vId) embedUrl = `https://www.youtube.com/embed/${vId}`;} else { embedUrl = url;} if (embedUrl) {trailerIframe.src = embedUrl; trailerModal.style.display = 'flex'; setTimeout(() => trailerModal.classList.add('visible'), 10); document.addEventListener('keydown', handleEscKey);}};
    const closeTrailerModal = () => {trailerModal.classList.remove('visible'); setTimeout(() => {trailerModal.style.display = 'none'; trailerIframe.src = '';}, 300); document.removeEventListener('keydown', handleEscKey);};
    modalCloseBtn.addEventListener('click', closeTrailerModal); trailerModal.addEventListener('click', (e) => e.target === trailerModal && closeTrailerModal());

    const pdfViewerOverlay = document.getElementById('pdf-viewer-overlay');
    const pdfViewerContainer = document.getElementById('pdf-embed-container');
    const pdfCloseButton = document.getElementById('pdf-viewer-close');

    function openPdfViewer(pdfPath) {
        pdfViewerContainer.innerHTML = '';
        const iframe = document.createElement('iframe');
        iframe.src = pdfPath;
        pdfViewerContainer.appendChild(iframe);
        pdfViewerOverlay.style.display = 'flex';
        setTimeout(() => pdfViewerOverlay.classList.add('visible'), 10);
        document.addEventListener('keydown', handleEscKey);
    }

    function closePdfViewer() {
        pdfViewerOverlay.classList.remove('visible');
        setTimeout(() => {
            pdfViewerOverlay.style.display = 'none';
            pdfViewerContainer.innerHTML = '';
        }, 300);
        document.removeEventListener('keydown', handleEscKey);
    }

    function handleEscKey(e) { if (e.key === 'Escape') { closePdfViewer(); closeTrailerModal(); } }
    pdfCloseButton.addEventListener('click', closePdfViewer);
    pdfViewerOverlay.addEventListener('click', (e) => e.target === pdfViewerOverlay && closePdfViewer());


    function renderProjects(filteredProjects) {
        projectGrid.innerHTML = '';
        if (filteredProjects.length === 0) { projectGrid.innerHTML = `<p class="no-results">No projects match the selected filters. Try clearing some filters!</p>`; return; }

        // --- FIXED: This function now correctly handles C# and C++ ---
        const sanitizeForCss = (str) => {
            let sanitized = str.toLowerCase();
            // Specific replacements for special characters first
            sanitized = sanitized.replace('c#', 'csharp').replace('c++', 'cpp');
            // Generic cleanup for any other non-standard characters
            return sanitized.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        };

        filteredProjects.forEach(project => {
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';

            let headerHTML;
            if (project.gallery && project.gallery.length > 1) {
                const images = project.gallery.map((img, index) => `<img src="${img}" alt="${project.title} screenshot ${index + 1}" class="carousel-image ${index === 0 ? 'active' : ''}">`).join('');
                const dots = project.gallery.map((_, index) => `<span class="dot ${index === 0 ? 'active' : ''}" data-index="${index}"></span>`).join('');
                headerHTML = `<div class="image-carousel"><div class="carousel-images">${images}</div><div class="carousel-dots">${dots}</div></div>`;
            } else {
                headerHTML = `<img src="${project.thumbnail}" alt="${project.title}" class="project-thumbnail">`;
            }

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
            if (project.trailer) {
                footerButtons.push(`<a href="#" class="action-button trailer-button" data-trailer-url="${project.trailer}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4V20L20 12L7 4Z"></path></svg> Watch Trailer</a>`);
            }
            if (project.stores && project.stores.length > 0) {
                project.stores.forEach(store => {
                    footerButtons.push(`<a href="${store.url}" target="_blank" rel="noopener noreferrer" class="action-button store-button"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12.0006 18.26L4.94715 22.2082L6.52248 14.2799L0.587891 8.7918L8.61483 7.84006L12.0006 0.5L15.3864 7.84006L23.4133 8.7918L17.4787 14.2799L19.054 22.2082L12.0006 18.26Z"></path></svg> ${store.name}</a>`);
                });
            } else if (project.storeLink) {
                footerButtons.push(`<a href="${project.storeLink}" target="_blank" rel="noopener noreferrer" class="action-button store-button"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12.0006 18.26L4.94715 22.2082L6.52248 14.2799L0.587891 8.7918L8.61483 7.84006L12.0006 0.5L15.3864 7.84006L23.4133 8.7918L17.4787 14.2799L19.054 22.2082L12.0006 18.26Z"></path></svg> Store Page</a>`);
            }
            if (project.Website) {
                if (project.Website.endsWith('.pdf')) {
                    footerButtons.push(`<a href="${project.Website}" class="action-button website-button pdf-link" data-pdf-src="${project.Website}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM16 18H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"></path></svg> View Document</a>`);
                } else {
                    footerButtons.push(`<a href="${project.Website}" target="_blank" rel="noopener noreferrer" class="action-button website-button"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"></path></svg> Visit Website</a>`);
                }
            }

            const footerHTML = footerButtons.join('');
            const cardFooter = footerHTML ? `<div class="project-card-footer">${footerHTML}</div>` : '';

            projectCard.innerHTML = `<div class="project-card-header">${headerHTML}<div class="project-date">${project.startDate} &ndash; ${project.endDate}</div></div><div class="project-info"><div class="project-types">${categoryPill}${typePill}${collabPill}</div><h3 class="project-title">${project.title}</h3>${languageSection}${descriptionHTML}${tagSections}</div>${cardFooter}`;
            projectGrid.appendChild(projectCard);
        });

        initDescriptionExpanders();
    }

    function applyFilters() {
        const selectedType = projectTypeFilter.value;
        const selectedCategory = projectCategoryFilter.value;
        const selectedTeamType = teamTypeFilter.value;
        const selectedLang = languageFilter.value;
        const selectedPlatform = platformFilter.value;
        const selectedEngine = engineFilter.value;
        const selectedTech = technologyFilter.value;
        const searchTerm = searchBar.value.toLowerCase();

        const isGameTypeSelected = selectedType === 'Game';
        const showGameFilters = selectedType === 'all' || isGameTypeSelected;
        gameFiltersContainer.classList.toggle('hidden', !showGameFilters);
        const isGameFilterActive = selectedEngine !== 'all' || selectedPlatform !== 'all';

        const filteredProjects = projectsData.filter(project => {
            if (isGameFilterActive && project.projectType !== 'Game') return false;

            const typeMatch = selectedType === 'all' || project.projectType === selectedType;
            const categoryMatch = selectedCategory === 'all' || project.projectCategory === selectedCategory;
            const teamTypeMatch = selectedTeamType === 'all' || project.collaborationType === selectedTeamType;
            const langMatch = selectedLang === 'all' || project.language.includes(selectedLang);
            const platformMatch = selectedPlatform === 'all' || project.platform.some(p => p.includes(selectedPlatform));
            const engineMatch = selectedEngine === 'all' || (project.engine && project.engine.includes(selectedEngine));

            const allTags = Object.values(project.tags).flat();
            const techMatch = selectedTech === 'all' || allTags.includes(selectedTech);

            const searchMatch = searchTerm === '' ||
                project.title.toLowerCase().includes(searchTerm) ||
                project.description.toLowerCase().includes(searchTerm) ||
                (project.projectType && project.projectType.toLowerCase().includes(searchTerm)) ||
                allTags.some(t => t.toLowerCase().includes(searchTerm));

            return typeMatch && categoryMatch && teamTypeMatch && langMatch && platformMatch && engineMatch && techMatch && searchMatch;
        });

        if (projectCount) projectCount.textContent = `Showing ${filteredProjects.length} of ${projectsData.length} projects`;
        renderProjects(filteredProjects);
        updateURLWithFilters();
    }

    function updateURLWithFilters() { const params = new URLSearchParams(); const setParam = (key, el) => { if(el?.value && el.value !== 'all' && el.value.trim() !== '') params.set(key, el.value);}; setParam('search', searchBar); setParam('type', projectTypeFilter); setParam('category', projectCategoryFilter); setParam('team', teamTypeFilter); setParam('lang', languageFilter); setParam('platform', platformFilter); setParam('engine', engineFilter); setParam('tech', technologyFilter); const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname; history.pushState({path: newUrl}, '', newUrl);}
    function applyFiltersFromURL() { const params = new URLSearchParams(window.location.search); const setFilter = (key, el) => { if(params.has(key) && el) el.value = params.get(key);}; setFilter('search', searchBar); setFilter('type', projectTypeFilter); setFilter('category', projectCategoryFilter); setFilter('team', teamTypeFilter); setFilter('lang', languageFilter); setFilter('platform', platformFilter); setFilter('engine', engineFilter); setFilter('tech', technologyFilter); }

    const allFilters = [searchBar, projectTypeFilter, projectCategoryFilter, teamTypeFilter, languageFilter, platformFilter, engineFilter, technologyFilter];
    allFilters.forEach(filter => filter?.addEventListener('input', applyFilters));

    projectGrid.addEventListener('click', e => {
        const trailerBtn = e.target.closest('.trailer-button');
        if(trailerBtn) { e.preventDefault(); openTrailerModal(trailerBtn.dataset.trailerUrl); }

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
            cardHeader.querySelector('.carousel-image.active').classList.remove('active');
            cardHeader.querySelector('.dot.active').classList.remove('active');
            cardHeader.querySelectorAll('.carousel-image')[newIndex].classList.add('active');
            dot.classList.add('active');
        }
    });

    projectGrid.addEventListener('mousemove', e => {
        for(const card of document.getElementsByClassName("project-card")) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty("--mouse-x", `${x}px`);
            card.style.setProperty("--mouse-y", `${y}px`);
        }
    });

    resetFiltersBtn?.addEventListener('click', () => { allFilters.forEach(f => { if(f){ if(f.tagName==='SELECT')f.value='all'; else f.value=''; }}); applyFilters(); });

    populateFilters();
    applyFiltersFromURL();
    applyFilters();
}
