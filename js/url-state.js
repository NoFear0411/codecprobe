/**
 * URL State Management Module
 *
 * Handles hash-based routing for shareable filter/search states
 * Format: #filter=video&search=hevc
 */

export function parseURLState() {
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);

    return {
        filter: params.get('filter') || 'all',
        search: params.get('search') || ''
    };
}

export function updateURLState(filter, search) {
    const params = new URLSearchParams();

    if (filter && filter !== 'all') {
        params.set('filter', filter);
    }

    if (search && search.trim()) {
        params.set('search', search.trim());
    }

    const newHash = params.toString();
    const newURL = newHash ? `#${newHash}` : window.location.pathname;

    if (window.location.hash !== `#${newHash}`) {
        history.replaceState(null, '', newURL);
    }
}

export function applyURLState() {
    const urlState = parseURLState();

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

    const searchInput = document.getElementById('search-input');
    if (searchInput && urlState.search) {
        searchInput.value = urlState.search;
    }

    return urlState;
}

/**
 * Initialize URL state management.
 * @param {Function} onHashChange - Callback receiving parsed URL state on hash changes
 */
export function initURLState(onHashChange) {
    const initialState = applyURLState();

    window.addEventListener('hashchange', () => {
        const urlState = applyURLState();
        if (onHashChange) onHashChange(urlState);
    });

    return initialState;
}
