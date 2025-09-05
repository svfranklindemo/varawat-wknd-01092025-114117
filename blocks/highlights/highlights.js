/**
 * Highlights Block JavaScript
 * Maruti Suzuki Arena Style
 */

console.log('Highlights.js file loaded!');

export default function decorate(block) {
  console.log('Highlights decorate function called with block:', block);
  
  // Function to wrap last two p tags in a parent div
  function wrapLastTwoParagraphs() {
    const highlightCards = block.querySelectorAll('> div > div');
    console.log('Found highlight cards:', highlightCards.length);
    
    highlightCards.forEach((card, index) => {
      // Get all p tags in the card
      const paragraphs = card.querySelectorAll('p');
      console.log(`Card ${index + 1} has ${paragraphs.length} paragraphs`);
      
      // Check if we have at least 2 p tags
      if (paragraphs.length >= 2) {
        // Get the last two p tags
        const lastTwoParagraphs = Array.from(paragraphs).slice(-2);
        
        // Create a wrapper div for the last two paragraphs
        const wrapperDiv = document.createElement('div');
        wrapperDiv.className = 'highlight-bottom-content';
        
        // Move the last two p tags into the wrapper
        lastTwoParagraphs.forEach(p => {
          wrapperDiv.appendChild(p);
        });
        
        // Append the wrapper to the card
        card.appendChild(wrapperDiv);
        console.log(`Card ${index + 1} paragraphs wrapped successfully`);
      }
    });
  }

  // Function to add hover effects and interactions
  function initializeHighlightInteractions() {
    const highlightCards = block.querySelectorAll('> div > div');
    
    highlightCards.forEach((card, index) => {
      // Add click event for accessibility
      card.addEventListener('click', function() {
        // Handle card click if needed
        console.log(`Card ${index + 1} clicked`);
      });
      
      // Add keyboard navigation support
      card.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.click();
        }
      });
      
      // Make cards focusable
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `Highlight card ${index + 1}`);
    });
  }

  // Function to add smooth transitions
  function addSmoothTransitions() {
    const style = document.createElement('style');
    style.textContent = `
      .highlights.block > div > div {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .highlights.block > div > div:hover {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .highlight-bottom-content {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
    `;
    document.head.appendChild(style);
  }

  // Initialize all functions
  function init() {
    console.log('Initializing highlights functionality...');
    wrapLastTwoParagraphs();
    initializeHighlightInteractions();
    addSmoothTransitions();
    console.log('Highlights functionality initialized successfully!');
  }

  // Run initialization
  init();
}
