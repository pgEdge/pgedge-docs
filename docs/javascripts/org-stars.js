// Fetch and display total GitHub stars across all pgEdge org repos
(function() {
    const ORG_NAME = 'pgEdge';
    const CACHE_KEY = 'pgedge_org_stars';
    const CACHE_DURATION = 3600000; // 1 hour in milliseconds

    async function fetchOrgStars() {
        // Check cache first
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const { stars, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_DURATION) {
                return stars;
            }
        }

        try {
            // Fetch all public repos from the org (paginated)
            let allRepos = [];
            let page = 1;
            let hasMore = true;

            while (hasMore) {
                const response = await fetch(
                    `https://api.github.com/orgs/${ORG_NAME}/repos?type=public&per_page=100&page=${page}`,
                    { headers: { 'Accept': 'application/vnd.github.v3+json' } }
                );

                if (!response.ok) {
                    throw new Error(`GitHub API error: ${response.status}`);
                }

                const repos = await response.json();
                if (repos.length === 0) {
                    hasMore = false;
                } else {
                    allRepos = allRepos.concat(repos);
                    page++;
                }
            }

            // Sum up all stars
            const totalStars = allRepos.reduce((sum, repo) => sum + repo.stargazers_count, 0);

            // Cache the result
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                stars: totalStars,
                timestamp: Date.now()
            }));

            return totalStars;
        } catch (error) {
            console.error('Failed to fetch org stars:', error);
            return null;
        }
    }

    function formatStars(count) {
        if (count >= 1000) {
            return (count / 1000).toFixed(1) + 'k';
        }
        return count.toString();
    }

    // The theme builds its .md-source__facts list only once its own GitHub API
    // call has resolved, which can easily be after we have finished: our result
    // is cached in localStorage, so on a warm cache we run almost immediately
    // and the list does not exist yet. Rather than give up, we watch each source
    // link and append as soon as the theme creates the list.
    const OBSERVER_TIMEOUT = 15000; // stop watching after fifteen seconds

    // Elements we are already watching, so that repeated calls (for instance
    // from document$) never stack a second observer on the same link. A WeakSet
    // means a re-rendered header is watched afresh without us leaking entries
    // for elements that have been discarded.
    const watched = new WeakSet();

    function sourceElements() {
        // The theme renders the repository link twice, once in the header and
        // once in the navigation drawer, and populates both; we therefore update
        // every one of them. We match on the theme's own data-md-component
        // attribute rather than on .md-source alone, because our Discord link in
        // the header borrows the .md-source classes but never gains a facts
        // list, and watching it would leave an observer waiting for nothing.
        return document.querySelectorAll('.md-source[data-md-component="source"]');
    }

    function renderStarFact(factsList, stars) {
        // Reuse any fact we appended earlier so that a second observer callback,
        // a later document$ event or a theme re-render updates the existing
        // entry in place instead of adding a duplicate.
        let starFact = factsList.querySelector('.md-source__fact--stars');
        if (!starFact) {
            starFact = document.createElement('li');
            starFact.className = 'md-source__fact md-source__fact--stars';
            factsList.appendChild(starFact);
        }
        starFact.textContent = formatStars(stars);
        starFact.title = `${stars} stars across all pgEdge repositories`;
    }

    function updateSourceElement(sourceElement, stars) {
        const factsList = sourceElement.querySelector('.md-source__facts');
        if (factsList) {
            // Already there, so no observer is needed at all.
            renderStarFact(factsList, stars);
            return;
        }

        if (watched.has(sourceElement)) return;
        watched.add(sourceElement);

        let timer = null;
        const observer = new MutationObserver(function() {
            const list = sourceElement.querySelector('.md-source__facts');
            if (!list) return;
            renderStarFact(list, stars);
            observer.disconnect();
            if (timer !== null) clearTimeout(timer);
        });
        observer.observe(sourceElement, { childList: true, subtree: true });

        // If the theme's own request fails or is rate limited the facts list is
        // never created, so give up after a bounded wait rather than leaving an
        // observer attached for the lifetime of the page. Dropping the element
        // from the watched set lets a later navigation event have another go.
        timer = setTimeout(function() {
            observer.disconnect();
            watched.delete(sourceElement);
        }, OBSERVER_TIMEOUT);
    }

    async function updateStarCount() {
        const stars = await fetchOrgStars();
        if (stars === null) return;

        sourceElements().forEach(function(sourceElement) {
            updateSourceElement(sourceElement, stars);
        });
    }

    // Run on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateStarCount);
    } else {
        updateStarCount();
    }

    // Re-run after instant navigation (MkDocs Material)
    if (typeof document$ !== 'undefined') {
        document$.subscribe(updateStarCount);
    }
})();
