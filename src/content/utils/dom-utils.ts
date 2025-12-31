/**
 * DOM Utility Functions
 * Shared helpers for detecting content in Instagram's DOM
 *
 * Philosophy: TEXT is the signature, not CSS classes.
 * User-facing text (like "Sponsored", "Follow") is stable because it's part of product design.
 */

/**
 * Selector for all clickable elements
 * Instagram uses various elements for buttons: <button>, div[role="button"], [tabindex="0"]
 */
const CLICKABLE_SELECTOR = 'button, [role="button"], [tabindex="0"]';

/**
 * Find text in an element using TreeWalker
 * @param element - The container element to search
 * @param keywords - Array of keywords to match
 * @returns The matched keyword or null
 */
export function findTextInElement(
  element: Element,
  keywords: readonly string[]
): string | null {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);

  let node: Node | null;
  while ((node = walker.nextNode())) {
    const text = node.textContent?.trim();
    if (text && keywords.includes(text)) {
      return text;
    }
  }

  return null;
}

/**
 * Find a clickable element with matching text
 * TEXT is the signature - searches all clickable elements (button, role="button", tabindex="0")
 *
 * @param container - The container element to search
 * @param keywords - Array of text keywords to match (e.g., ["Follow", "팔로우"])
 * @returns The matched element or null
 */
export function findClickableWithText(
  container: Element,
  keywords: readonly string[]
): Element | null {
  const clickables = container.querySelectorAll(CLICKABLE_SELECTOR);

  for (const el of clickables) {
    const text = el.textContent?.trim();
    if (text && keywords.includes(text)) {
      return el;
    }
  }

  return null;
}
