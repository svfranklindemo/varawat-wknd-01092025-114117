import { fetchPlaceholders } from '../../scripts/aem.js';

function updateActiveSlide(slide) {
  const block = slide.closest('.carousel');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.carousel-slide');

  slides.forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    // Only handle links if they exist (for regular carousel)
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) {
        link.setAttribute('tabindex', '-1');
      } else {
        link.removeAttribute('tabindex');
      }
    });
  });

  const indicators = block.querySelectorAll('.carousel-slide-indicator');
  indicators.forEach((indicator, idx) => {
    if (idx !== slideIndex) {
      indicator.querySelector('button').removeAttribute('disabled');
    } else {
      indicator.querySelector('button').setAttribute('disabled', 'true');
    }
  });
}

function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-slide');
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];

  // Update active slide data attribute
  block.dataset.activeSlide = realSlideIndex;
  
  // Update aria-hidden attributes
  slides.forEach((slide, idx) => {
    slide.setAttribute('aria-hidden', idx !== realSlideIndex);
  });

  // For maruti-carousel-multi, we need to handle the flexbox layout differently
  if (block.closest('.maruti-carousel-multi')) {
    // Update indicators
    const indicators = block.querySelectorAll('.carousel-slide-indicator');
    indicators.forEach((indicator, idx) => {
      if (idx !== realSlideIndex) {
        indicator.querySelector('button').removeAttribute('disabled');
      } else {
        indicator.querySelector('button').setAttribute('disabled', 'true');
      }
    });
    
    // For maruti-carousel-multi, we'll use scrollIntoView for smooth scrolling
    activeSlide.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    });
  } else {
    // Original scrollTo behavior for regular carousel
    activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
    block.querySelector('.carousel-slides').scrollTo({
      top: 0,
      left: activeSlide.offsetLeft,
      behavior: 'smooth',
    });
  }
}

function bindEvents(block) {
  const slideIndicators = block.querySelector('.carousel-slide-indicators');
  if (!slideIndicators) return;

  slideIndicators.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const slideIndicator = e.currentTarget.parentElement;
      showSlide(block, parseInt(slideIndicator.dataset.targetSlide, 10));
    });
  });

  // Handle navigation buttons for both regular carousel and maruti-carousel-multi
  const prevButton = block.querySelector('.slide-prev') || block.querySelector('button[aria-label="Previous Slide"]');
  const nextButton = block.querySelector('.slide-next') || block.querySelector('button[aria-label="Next Slide"]');
  
  if (prevButton) {
    prevButton.addEventListener('click', () => {
      showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
    });
  }
  
  if (nextButton) {
    nextButton.addEventListener('click', () => {
      showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
    });
  }

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(entry.target);
    });
  }, { threshold: 0.5 });
  block.querySelectorAll('.carousel-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-slide');

  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
    column.classList.add(`carousel-slide-${colIdx === 0 ? 'image' : 'content'}`);
    
    // Check if this is an image column and contains a video URL
    if (colIdx === 0) {
      // Check for links first
      const links = column.querySelectorAll('a');
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && (href.includes('.mp4') || href.includes('.webm') || href.includes('.mov') || href.includes('youtube.com') || href.includes('youtu.be'))) {
          // Create video element
          const videoContainer = document.createElement('div');
          videoContainer.classList.add('carousel-video-container');
          
          if (href.includes('youtube.com') || href.includes('youtu.be')) {
            // Handle YouTube video
            const videoId = extractYouTubeId(href);
            if (videoId) {
              const video = createYouTubeVideo(videoId);
              videoContainer.appendChild(video);
            }
          } else {
            // Handle direct video files
            const video = document.createElement('video');
            video.src = href;
            video.autoplay = true;
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            video.controls = false;
            video.classList.add('carousel-video');
            
            // Ensure video takes full dimensions
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.objectFit = 'cover';
            
            videoContainer.appendChild(video);
          }
          
          // Replace the link with video
          link.replaceWith(videoContainer);
        }
      });
      
      // Check for direct text content (YouTube URLs as text)
      if (links.length === 0) {
        const textContent = column.textContent.trim();
        if (textContent && (textContent.includes('youtube.com') || textContent.includes('youtu.be') || textContent.includes('.mp4') || textContent.includes('.webm') || textContent.includes('.mov'))) {
          // Create video element
          const videoContainer = document.createElement('div');
          videoContainer.classList.add('carousel-video-container');
          
          if (textContent.includes('youtube.com') || textContent.includes('youtu.be')) {
            // Handle YouTube video
            const videoId = extractYouTubeId(textContent);
            if (videoId) {
              const video = createYouTubeVideo(videoId);
              videoContainer.appendChild(video);
            }
          } else {
            // Handle direct video files
            const video = document.createElement('video');
            video.src = textContent;
            video.autoplay = true;
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            video.controls = false;
            video.classList.add('carousel-video');
            
            // Ensure video takes full dimensions
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.objectFit = 'cover';
            
            videoContainer.appendChild(video);
          }
          
          // Replace the text content with video
          column.innerHTML = '';
          column.appendChild(videoContainer);
        }
      }
    }
    
    slide.append(column);
  });

  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy) {
    slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  }

  return slide;
}

// Extract YouTube video ID from various YouTube URL formats
function extractYouTubeId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Create YouTube video element that plays like a regular video
function createYouTubeVideo(videoId) {
  const videoContainer = document.createElement('div');
  videoContainer.classList.add('carousel-youtube-video');
  
  // Create iframe with YouTube embed
  const iframe = document.createElement('iframe');
  iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&start=0&origin=${window.location.origin}`;
  iframe.title = 'Carousel Video';
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
  iframe.allowFullscreen = true;
  iframe.classList.add('carousel-video');
  
  // Ensure iframe takes full dimensions
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  
  videoContainer.appendChild(iframe);
  return videoContainer;
}

let carouselId = 0;
export default async function decorate(block) {
  // Check if this is a highlights block first
  if (block.classList.contains('highlights')) {
    console.log('Highlights block detected, initializing highlights functionality...');
    initializeHighlights(block);
    return; // Exit early for highlights blocks
  }
  
  // Original carousel functionality
  carouselId += 1;
  block.setAttribute('id', `carousel-${carouselId}`);
  const rows = block.querySelectorAll(':scope > div');
  const isSingleSlide = rows.length < 2;

  const placeholders = await fetchPlaceholders();

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', placeholders.carousel || 'Carousel');

  const container = document.createElement('div');
  container.classList.add('carousel-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-slides');
  block.prepend(slidesWrapper);

  let slideIndicators;
  if (!isSingleSlide) {
    const slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.setAttribute('aria-label', placeholders.carouselSlideControls || 'Carousel Slide Controls');
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-slide-indicators');
    slideIndicatorsNav.append(slideIndicators);
    block.append(slideIndicatorsNav);

    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add('carousel-navigation-buttons');
    slideNavButtons.innerHTML = `
      <button type="button" class= "slide-prev" aria-label="${placeholders.previousSlide || 'Previous Slide'}"></button>
      <button type="button" class="slide-next" aria-label="${placeholders.nextSlide || 'Next Slide'}"></button>
    `;

    container.append(slideNavButtons);
  }

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, carouselId);
    slidesWrapper.append(slide);

    if (slideIndicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-slide-indicator');
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = `<button type="button"><span>${placeholders.showSlide || 'Show Slide'} ${idx + 1} ${placeholders.of || 'of'} ${rows.length}</span></button>`;
      slideIndicators.append(indicator);
    }
    row.remove();
  });

  container.append(slidesWrapper);
  block.prepend(container);

  if (!isSingleSlide) {
    bindEvents(block);
  }
}

// Highlights functionality - Add this to handle highlights blocks
function initializeHighlights(block) {
  console.log('Initializing highlights functionality for block:', block);
  
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
        
        // Create the bottom section structure as per reference site
        const bottomSection = document.createElement('a');
        bottomSection.className = 'bottom-section';
        bottomSection.href = '#'; // You can update this with actual URLs later
        bottomSection.setAttribute('target', '_self');
        
        // Create separator
        const separator = document.createElement('span');
        separator.className = 'saperater';
        bottomSection.appendChild(separator);
        
        // Create bottom content wrapper
        const bottomContent = document.createElement('div');
        bottomContent.className = 'bottom__content';
        
        // Create bottom title section
        const bottomTitle = document.createElement('div');
        bottomTitle.className = 'btm-title';
        
        // Move the CTA paragraph (2nd p tag) to bottom title
        const ctaParagraph = lastTwoParagraphs[0];
        const ctaText = ctaParagraph.textContent || ctaParagraph.innerText;
        const hTitle = document.createElement('h4');
        hTitle.className = 'h-title';
        hTitle.textContent = ctaText;
        
        // Create arrow link
        const arrowLink = document.createElement('span');
        arrowLink.className = 'arrow-link';
        
        bottomTitle.appendChild(hTitle);
        bottomTitle.appendChild(arrowLink);
        bottomContent.appendChild(bottomTitle);
        
        // Move the description paragraph (3rd p tag) to bottom description
        const descParagraph = lastTwoParagraphs[1];
        const descText = descParagraph.textContent || descParagraph.innerText;
        const bottomDescription = document.createElement('div');
        bottomDescription.className = 'highlight__bottom__description g-xl-2';
        const descP = document.createElement('p');
        descP.textContent = descText;
        bottomDescription.appendChild(descP);
        
        bottomContent.appendChild(bottomDescription);
        bottomSection.appendChild(bottomContent);
        
        // Create background overlay
        const backgroundOverlay = document.createElement('div');
        backgroundOverlay.className = 'backdround-overlay';
        bottomSection.appendChild(backgroundOverlay);
        
        // Remove the original paragraphs from the card
        lastTwoParagraphs.forEach(p => p.remove());
        
        // Append the new bottom section to the card
        card.appendChild(bottomSection);
        console.log(`Card ${index + 1} bottom content created successfully with reference site structure`);
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
      
      .bottom-section {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        text-decoration: none;
        color: inherit;
        display: block;
      }
      
      .bottom-section:hover {
        transform: translateY(-2px);
      }
      
      .arrow-link {
        transition: transform 0.3s ease;
      }
      
      .bottom-section:hover .arrow-link {
        transform: translate(2px, -2px);
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

// Check if this is a highlights block and initialize accordingly
export function initializeHighlightsBlock(block) {
  if (block.classList.contains('highlights')) {
    console.log('Highlights block detected, initializing...');
    initializeHighlights(block);
  }
}
