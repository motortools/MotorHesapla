// ========== App Logic ==========

document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initHeader();
    initSearch();
    initFilters();
    renderBrands(motorcycleData);
    animateStats();
    initKeyboardShortcuts();
});

// ========== Background Particles ==========
function initParticles() {
    const container = document.getElementById('bgParticles');
    const colors = ['rgba(108, 92, 231, 0.15)', 'rgba(162, 155, 254, 0.1)', 'rgba(253, 121, 168, 0.08)', 'rgba(0, 206, 201, 0.08)'];
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const size = Math.random() * 4 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.animationDuration = (Math.random() * 20 + 15) + 's';
        particle.style.animationDelay = (Math.random() * 10) + 's';
        container.appendChild(particle);
    }
}

// ========== Header Scroll ==========
function initHeader() {
    const header = document.getElementById('header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        if (scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        lastScroll = scrollY;
    });
}

// ========== Animated Stats ==========
function animateStats() {
    const brandCount = motorcycleData.length;
    let modelCount = 0;
    motorcycleData.forEach(b => modelCount += b.models.length);

    animateNumber('brandCount', brandCount, 600);
    animateNumber('modelCount', modelCount, 1200);
}

function animateNumber(id, target, duration) {
    const el = document.getElementById(id);
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
        const current = Math.round(start + (target - start) * eased);
        el.textContent = current;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// ========== Search ==========
function initSearch() {
    const input = document.getElementById('searchInput');
    let debounceTimer;

    input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            filterAndRender();
        }, 200);
    });
}

// ========== Keyboard Shortcuts ==========
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            document.getElementById('searchInput').focus();
        }
        if (e.key === 'Escape') {
            document.getElementById('searchInput').blur();
        }
    });
}

// ========== Filters ==========
let activeFilter = 'all';

function initFilters() {
    const filterBar = document.getElementById('filterBar');
    filterBar.addEventListener('click', (e) => {
        const chip = e.target.closest('.filter-chip');
        if (!chip) return;

        filterBar.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        activeFilter = chip.dataset.filter;
        filterAndRender();
    });
}

// ========== Filter & Render ==========
function filterAndRender() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    const noResults = document.getElementById('noResults');

    let filteredData = motorcycleData.map(brand => {
        let filteredModels = brand.models;

        // Filter by type
        if (activeFilter !== 'all') {
            filteredModels = filteredModels.filter(m => m.type === activeFilter);
        }

        // Filter by search query
        if (query) {
            const brandMatch = brand.brand.toLowerCase().includes(query);
            if (brandMatch) {
                // If brand matches, show all (type-filtered) models
            } else {
                filteredModels = filteredModels.filter(m =>
                    m.name.toLowerCase().includes(query)
                );
            }
        }

        if (filteredModels.length === 0) return null;

        return { ...brand, models: filteredModels };
    }).filter(Boolean);

    if (filteredData.length === 0) {
        noResults.style.display = 'block';
    } else {
        noResults.style.display = 'none';
    }

    renderBrands(filteredData, !!query);
}

// ========== Render Brands ==========
function renderBrands(data, autoExpand = false) {
    const grid = document.getElementById('brandsGrid');
    grid.innerHTML = '';

    data.forEach((brand, index) => {
        const card = document.createElement('div');
        card.className = 'brand-card' + (autoExpand ? ' open' : '');
        card.dataset.brand = brand.brand;
        card.style.animationDelay = (index * 0.05) + 's';

        card.innerHTML = `
            <div class="brand-header" id="brand-header-${index}">
                <div class="brand-info">
                    <div class="brand-logo" style="background: ${brand.color};">
                        ${brand.icon}
                    </div>
                    <div class="brand-details">
                        <h3>${brand.brand}</h3>
                        <div class="brand-meta">
                            <span class="brand-country">${brand.country}</span>
                            <span class="brand-model-count">${brand.models.length} model</span>
                        </div>
                    </div>
                </div>
                <div class="brand-toggle">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="6 9 12 15 18 9"/>
                    </svg>
                </div>
            </div>
            <div class="models-container">
                <div class="models-list">
                    ${brand.models.map((model, mi) => renderModel(model, index, mi)).join('')}
                </div>
            </div>
        `;

        // Brand toggle
        card.querySelector('.brand-header').addEventListener('click', () => {
            card.classList.toggle('open');
        });

        grid.appendChild(card);
    });

    // Attach model toggle listeners
    document.querySelectorAll('.model-header').forEach(header => {
        header.addEventListener('click', (e) => {
            const modelItem = header.closest('.model-item');
            modelItem.classList.toggle('open');
        });
    });
}

function renderModel(model, brandIndex, modelIndex) {
    const typeLabels = {
        sport: 'Sport',
        naked: 'Naked',
        touring: 'Touring',
        adventure: 'Adventure',
        cruiser: 'Cruiser',
        enduro: 'Enduro/MX'
    };

    const barFront = (model.front * 0.0689476).toFixed(2);
    const barRear = (model.rear * 0.0689476).toFixed(2);

    return `
        <div class="model-item" id="model-${brandIndex}-${modelIndex}">
            <div class="model-header">
                <span class="model-name">
                    ${model.name}
                    <span class="model-type-badge type-${model.type}">${typeLabels[model.type]}</span>
                </span>
                <div class="model-toggle">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="6 9 12 15 18 9"/>
                    </svg>
                </div>
            </div>
            <div class="pressure-container">
                <div class="pressure-details">
                    <div class="pressure-card front">
                        <div class="pressure-label">Ön Lastik</div>
                        <div class="pressure-value">${model.front}</div>
                        <div class="pressure-unit">PSI</div>
                        <div class="pressure-bar-conversion">${barFront} bar</div>
                    </div>
                    <div class="pressure-card rear">
                        <div class="pressure-label">Arka Lastik</div>
                        <div class="pressure-value">${model.rear}</div>
                        <div class="pressure-unit">PSI</div>
                        <div class="pressure-bar-conversion">${barRear} bar</div>
                    </div>
                </div>
                <div class="tire-size">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <circle cx="12" cy="12" r="4"/>
                    </svg>
                    Lastik: Ön ${model.tireF} &bull; Arka ${model.tireR}
                </div>
            </div>
        </div>
    `;
}
