import { fetchCats } from './api.js';
import { Deck } from './deck.js';

// State
const state = {
    likedCats: [],
    cats: []
};

// Select elements from the HTML page
const deckContainer = document.getElementById('card-stack');
const btnLike = document.getElementById('btn-like');
const btnNope = document.getElementById('btn-nope');
const summaryView = document.getElementById('summary-view');
const likedCatsGrid = document.getElementById('liked-cats-grid');
const likedCountSpan = document.getElementById('liked-count');
const btnRestart = document.getElementById('btn-restart');

async function init() {
    console.log("Initializing Paws & Preferences...");

    // Create Deck
    const deck = new Deck(
        deckContainer,
        handleSwipeEnd,
        handleDeckEmpty
    );

    // Initial Load
    await loadCats(deck);

    // Button Listeners
    btnLike.addEventListener('click', () => deck.swipe(true));
    btnNope.addEventListener('click', () => deck.swipe(false));
    btnRestart.addEventListener('click', () => resetApp(deck));
}

async function loadCats(deck) {
    deckContainer.innerHTML = '<div class="loading">Loading purr-fect cats...</div>';

    // Fetch Data
    const cats = await fetchCats(10); // 10 cats for the demo
    state.cats = cats;

    // Add to Deck
    deck.addCards(cats);

    // Preload images for better UX
    preloadImages(cats);
}

function preloadImages(cats) {
    cats.forEach(cat => {
        const img = new Image();
        img.src = cat.url;
    });
}

function handleSwipeEnd(cat, liked) {
    if (liked) {
        state.likedCats.push(cat);
        console.log("Liked:", cat.id);
    } else {
        console.log("Nope:", cat.id);
    }
}

function handleDeckEmpty() {
    console.log("Deck finished!");
    showSummary();
}

function showSummary() {
    summaryView.classList.remove('hidden');
    likedCountSpan.textContent = state.likedCats.length;

    likedCatsGrid.innerHTML = '';

    if (state.likedCats.length === 0) {
        likedCatsGrid.innerHTML = '<p>You didn\'t like any cats? Impossible!</p>';
        return;
    }

    state.likedCats.forEach(cat => {
        const div = document.createElement('div');
        div.classList.add('liked-cat-item');
        const img = document.createElement('img');
        img.src = cat.url;
        div.appendChild(img);
        likedCatsGrid.appendChild(div);
    });
}

async function resetApp(deck) {
    state.likedCats = [];
    summaryView.classList.add('hidden');
    await loadCats(deck);
}

// Start
init();
