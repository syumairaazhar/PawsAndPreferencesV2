import { createCard } from './card.js';

/**
 * Configuration for Deck interactions
 */
const DECK_CONFIG = {
    THRESHOLD: 100, // Pixels to drag to count as swipe
    ROTATION_FACTOR: 0.1, // Rotation per pixel dragged
    ANIMATION_DURATION: 300 // ms
};

/**
 * Class representing the card deck
 */
export class Deck {
    /**
     * @param {HTMLElement} container - The DOM element to append cards to
     * @param {Function} onSwipeEnd - Callback(data, liked)
     * @param {Function} onEmpty - Callback when deck is empty
     */
    constructor(container, onSwipeEnd, onEmpty) {
        this.container = container;
        this.onSwipeEnd = onSwipeEnd;
        this.onEmpty = onEmpty;

        this.cats = [];
        this.cards = [];
    }

    /**
     * Adds new cards to the deck
     * @param {Array} newCats 
     */
    addCards(newCats) {
        this.cats = newCats;
        this.render();
    }

    render() {
        this.container.innerHTML = '';
        this.cards = [];

        this.cats.forEach((cat, index) => {
            const card = createCard(cat, index, this.cats.length);
            this.container.appendChild(card);
            this.cards.push({ element: card, data: cat });
        });

        // Initialize swipe for the top card
        this.enableSwipe();
    }

    enableSwipe() {
        if (this.cards.length === 0) {
            this.onEmpty();
            return;
        }

        // The card at index 0 is the "top" card because we reverse-stack z-indexes.
        const currentCardObj = this.cards[0];
        if (!currentCardObj) return;

        this.initSwipeListeners(currentCardObj);
    }

    initSwipeListeners(cardObj) {
        const card = cardObj.element;
        let startX = 0;
        let currentX = 0;
        let isDragging = false;

        const onPointerDown = (e) => {
            isDragging = true;
            startX = e.clientX || e.touches[0].clientX;
            card.style.transition = 'none'; // Remove transition for instant drag
            card.setPointerCapture(e.pointerId); // Capture pointer
        };

        const onPointerMove = (e) => {
            if (!isDragging) return;

            const x = (e.clientX || e.touches[0].clientX);
            currentX = x - startX;

            const rotate = currentX * DECK_CONFIG.ROTATION_FACTOR;

            card.style.transform = `translateX(${currentX}px) rotate(${rotate}deg)`;

            // Visual feedback
            if (currentX > 0) {
                // Like
                card.style.boxShadow = `0 10px 20px rgba(78, 205, 196, ${Math.min(Math.abs(currentX) / 200, 0.5)})`;
            } else {
                // Nope
                card.style.boxShadow = `0 10px 20px rgba(255, 107, 107, ${Math.min(Math.abs(currentX) / 200, 0.5)})`;
            }
        };

        const onPointerUp = (e) => {
            if (!isDragging) return;
            isDragging = false;
            card.style.transition = `transform ${DECK_CONFIG.ANIMATION_DURATION / 1000}s ease`;
            card.releasePointerCapture(e.pointerId);

            if (Math.abs(currentX) > DECK_CONFIG.THRESHOLD) {
                const liked = currentX > 0;
                this.dismissCard(cardObj, liked);
            } else {
                card.style.transform = '';
                card.style.boxShadow = '';
            }
        };

        card.onpointerdown = onPointerDown;
        card.onpointermove = onPointerMove;
        card.onpointerup = onPointerUp;
        card.onpointercancel = onPointerUp;
    }

    dismissCard(cardObj, liked) {
        const card = cardObj.element;
        const direction = liked ? 1 : -1;
        const screenWidth = window.innerWidth;

        // Fly out animation
        card.style.transform = `translateX(${direction * screenWidth * 1.5}px) rotate(${direction * 30}deg)`;

        // Remove from our list (top card is at index 0)
        this.cards.shift();

        // Callback
        this.onSwipeEnd(cardObj.data, liked);

        // Remove from DOM after animation
        setTimeout(() => {
            card.remove();
            this.enableSwipe(); // Enable next card
        }, DECK_CONFIG.ANIMATION_DURATION);
    }

    /**
     * Programmatic swipe
     * @param {boolean} liked 
     */
    swipe(liked) {
        if (this.cards.length === 0) return;
        const cardObj = this.cards[0];
        this.dismissCard(cardObj, liked);
    }
}
