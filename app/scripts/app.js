// Initialize the app and add listeners
document.addEventListener('DOMContentLoaded', () => {
  generateBrowsingDataOptions(dataRemovalTypes);

  chrome.cookies.getAll({}, cookies => {
    for (let i in cookies) {
      cache.add(cookies[i]);
    }
    chrome.cookies.onChanged.addListener(cookiesChangeListener);
    reloadCookieTable();
  });

  // Add Event listeners
  select('#cookie_filter').addEventListener('input', reloadCookieTable);
  select('#clean_since').addEventListener('hover', tippy('#clean_since span', { placement: 'bottom', theme: 'light-border' }));
  select('#select-all').addEventListener('hover', tippy('#select-all', { theme: 'light-border' }));
  select('#cookie_header').addEventListener('hover', tippy('#cookie_header', { theme: 'light-border' }));
  select('.inputLabel').addEventListener('hover', tippy('.inputLabel', { theme: 'light-border' }));
  // Cookie table sort click handlers
  select('#cookie_domain_header').addEventListener('click', e => { reloadCookieTable('domains') });
  select('#cookie_count_header').addEventListener('click', e => { reloadCookieTable('cookies') });
  // Navigation tab click handlers 
  select('.mode-label:first-child').addEventListener('click', e => {
    select('.mode-label:first-child').classList.remove('mode-off');
    select('.mode-label:last-child').classList.add('mode-off');
    select('#cookie-tool').setAttribute('style', 'display:none');
    return select('#bulk-tool').setAttribute('style', 'display:block');
  });
  select('.mode-label:last-child').addEventListener('click', e => {
    select('.mode-label:last-child').classList.remove('mode-off');
    select('.mode-label:first-child').classList.add('mode-off');
    select('#cookie-tool').setAttribute('style', 'display:block');
    return select('#bulk-tool').setAttribute('style', 'display:none');
  });
});