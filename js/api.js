/**
 * Service to fetch cat images.
 * Tries multiple sources to ensure we always have cats.
 */

/**
 * Service to fetch cat images.
 * Tries multiple sources to ensure we always have cats.
 */

/**
 * @typedef {Object} CatData
 * @property {string} id
 * @property {string} url
 */

const API_CONFIG = {
    TIMEOUT_MS: 5000,
    RETRIES: 1
};

const SOURCES = [
    {
        name: 'TheCatAPI',
        url: 'https://api.thecatapi.com/v1/images/search?limit=10',
        transform: (data) => data.map(cat => ({ id: cat.id, url: cat.url }))
    },
    {
        name: 'Cataas',
        url: 'https://cataas.com/api/cats?limit=10',
        transform: (data) => data.map(cat => ({ id: cat._id, url: `https://cataas.com/cat/${cat._id}` }))
    }
];

// Fallback dummy data if everything fails
const FALLBACK_CATS = Array.from({ length: 10 }).map((_, i) => ({
    id: `fallback-${i}`,
    url: `https://loremflickr.com/400/500/cat?lock=${i}` // Consistent random images
}));

/**
 * Fetches data with a timeout.
 * @param {string} url 
 * @param {Object} options 
 * @param {number} timeout 
 * @returns {Promise<Response>}
 */
async function fetchWithTimeout(url, options = {}, timeout = API_CONFIG.TIMEOUT_MS) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(id);
        return response;
    } catch (err) {
        clearTimeout(id);
        throw err;
    }
}

/**
 * main function to get cats.
 * @param {number} limit 
 * @returns {Promise<CatData[]>}
 */
export async function fetchCats(limit = 10) {
    for (const source of SOURCES) {
        let attempts = 0;
        while (attempts <= API_CONFIG.RETRIES) {
            try {
                if (attempts > 0) console.log(`Retrying ${source.name} (Attempt ${attempts + 1})...`);
                else console.log(`Trying to fetch from ${source.name}...`);

                const response = await fetchWithTimeout(source.url, {}, API_CONFIG.TIMEOUT_MS);

                if (!response.ok) throw new Error(`Status: ${response.status}`);

                const data = await response.json();
                const cats = source.transform(data);

                if (cats.length > 0) {
                    console.log(`Successfully fetched ${cats.length} cats from ${source.name}`);
                    return cats;
                }
            } catch (error) {
                console.warn(`Failed to fetch from ${source.name}:`, error);
                attempts++;
            }
        }
    }

    console.warn("All APIs failed. Using fallback cats.");
    return FALLBACK_CATS;
}
