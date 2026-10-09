const iconPaths = {
  checkup:
    '<path d="M5 12h4l2-5 4 10 2-5h2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 5.8A5 5 0 0 1 12 4a5 5 0 0 1 8 1.8c1.6 4.9-4.5 9.4-8 12-3.5-2.6-9.6-7.1-8-12Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
  diagnostic:
    '<rect x="5" y="4" width="14" height="16" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M9 8h6M9 12h3M14 16h1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  brake:
    '<circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="2.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 5v3M12 16v3M5 12h3M16 12h3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  oil:
    '<path d="M5 14.5 13.2 7l3.8 3.8-7.5 8.2H5v-4.5Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="m13 7-1.5-1.5M17 12.5c1.7.9 2.5 2 2.5 3.3a2.5 2.5 0 0 1-5 0c0-1.3.8-2.4 2.5-3.3Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
  engine:
    '<path d="M7 10h8l3 3v4h-3l-2 2H8l-2-2H4v-6h3v-1Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 7h5M11.5 7V4M18 14h2M4 14H2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  snow:
    '<path d="M12 3v18M5.6 6.2l12.8 11.6M18.4 6.2 5.6 17.8M8.5 4.7 12 7l3.5-2.3M8.5 19.3 12 17l3.5 2.3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
  battery:
    '<rect x="3.5" y="7" width="15" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M18.5 10h2v4h-2M8 10v4M6 12h4M13 12h3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  wheel:
    '<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 4v6M12 14v6M4 12h6M14 12h6M6.4 6.4l4.2 4.2M13.4 13.4l4.2 4.2M17.6 6.4l-4.2 4.2M10.6 13.4l-4.2 4.2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  close:
    '<path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  arrow:
    '<path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  plus:
    '<path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
};

export function icon(name, className = "") {
  const path = iconPaths[name] || iconPaths.diagnostic;
  const classAttribute = className ? ` class="${className}"` : "";
  return `<svg${classAttribute} viewBox="0 0 24 24" aria-hidden="true" focusable="false">${path}</svg>`;
}
