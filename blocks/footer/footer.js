import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  block.textContent = '';

  // load footer fragment
  const footerPath = footerMeta?.footer || '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  const footer = document.createElement('div');
  footer.classList.add('wrapper');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  block.append(footer);
  
  // Add expand/collapse functionality for footer columns
  initializeFooterToggle();
}

/**
 * Initialize footer expand/collapse functionality
 */
function initializeFooterToggle() {
  const footerSection = document.querySelector('.section.heading-list.social-links-4.columns-container');
  if (!footerSection) return;
  
  const columnsBlock = footerSection.querySelector('.columns.block.columns-5-cols');
  if (!columnsBlock) return;
  
  // Get the divs - first div has headers, second div has content, third div has separator/button
  const headerDiv = columnsBlock.children[0]; // First child div with headers
  const contentDiv = columnsBlock.children[1]; // Second child div with content
  const separatorDiv = columnsBlock.children[2]; // Third child div with separator and button
  
  if (!headerDiv || !contentDiv || !separatorDiv) return;
  
  // Hide content div by default
  contentDiv.style.display = 'none';
  
  // Add click event listener to the separator div (which contains the button)
  separatorDiv.addEventListener('click', function() {
    const isExpanded = contentDiv.style.display === 'grid';
    
    if (isExpanded) {
      // Collapse
      contentDiv.style.display = 'none';
      this.classList.add('footer__separator--collapsed');
      this.setAttribute('aria-expanded', 'false');
    } else {
      // Expand
      contentDiv.style.display = 'grid';
      this.classList.remove('footer__separator--collapsed');
      this.setAttribute('aria-expanded', 'true');
    }
  });
  
  // Set initial state
  separatorDiv.setAttribute('aria-expanded', 'false');
  separatorDiv.classList.add('footer__separator--collapsed');
}
