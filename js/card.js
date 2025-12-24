/**
 * Creates a DOM element representing a card.
 */
export function createCard(cat, index, total) {
    const card = document.createElement('div');
    card.classList.add('card');

    // Create Image
    const img = document.createElement('img');
    img.src = cat.url;
    img.alt = "A cute cat";
    img.draggable = false; // Disable native drag

    // Add to card
    card.appendChild(img);

    // Initial Stacking Visuals
    // We reverse the index so the first one is on top
    // (Managed by the Deck, but we can set z-index here if we want)
    card.style.zIndex = total - index;

    // Store data on the element for easy access
    card.dataset.id = cat.id;

    return card;
}
