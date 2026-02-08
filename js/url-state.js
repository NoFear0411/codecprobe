/**
 * URL State Management Module
 *
 * Handles hash-based routing for shareable filter/search states
 * Format: #filter=video&search=hevc
 */

/**
 * Parse URL hash into state object
 * @returns {Object} State object with filter and search
 */
function parseURLState() {
    const hash = window.location.hash.slice(1); // Remove #
    const params = new URLSearchParams(hash);

    return {
        filter: params.get('filter') || 'all',
        search: params.get('search') || ''
    };
}

/**
 * Update URL hash with current state
 * @param {string} filter - Current filter
 * @param {string} search - Current search query
 */
function updateURLState(filter, search) {
    const params = new URLSearchParams();

    if (filter && filter !== 'all') {
        params.set('filter', filter);
    }

    if (search && search.trim()) {
        params.set('search', search.trim());
    }

    const newHash = params.toString();
    const newURL = newHash ? `#${newHash}` : window.location.pathname;

    // Only update if changed (avoid unnecessary history entries)
    if (window.location.hash !== `#${newHash}`) {
        history.replaceState(null, '', newURL);
    }
}

/**
 * Apply URL state to UI
 */
function applyURLState() {
    const urlState = parseURLState();

    // Apply filter
    if (urlState.filter !== 'all') {
        const filterBtn = document.querySelector(`[data-filter="${urlState.filter}"]`);
        if (filterBtn) {
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
            });
            filterBtn.classList.add('active');
            filterBtn.setAttribute('aria-pressed', 'true');
        }
    }

    // Apply search
    const searchInput = document.getElementById('search-input');
    if (searchInput && urlState.search) {
        searchInput.value = urlState.search;
    }

    return urlState;
}

/**
 * Initialize URL state management
 */
function initURLState() {
    // Apply state from URL on load
    const initialState = applyURLState();

    // Listen for hash changes (browser back/forward)
    window.addEventListener('hashchange', () => {
        const urlState = applyURLState();

        // Update app state and re-render
        if (typeof state !== 'undefined') {
            state.currentFilter = urlState.filter;
            state.searchQuery = urlState.search;

            if (state.testResults) {
                renderResults(state.testResults);
            }
        }
    });

    return initialState;
}

