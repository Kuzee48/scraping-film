/**
 * Shared utility functions used across all pages
 */

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(str) {
  if (!str) return '';
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

/**
 * Create a movie card DOM element
 */
function createCard(movie) {
  var card = document.createElement('a');
  card.className = 'movie-card';
  card.href = 'movie.html?slug=' + encodeURIComponent(movie.slug);

  var qualityClass = (movie.quality && movie.quality.toLowerCase().indexOf('cam') !== -1) ? ' cam' : '';
  var ratingHtml = movie.rating ? '<span class="rating-badge">' + escapeHtml(movie.rating) + '</span>' : '';
  var qualityHtml = movie.quality ? '<span class="quality-badge' + qualityClass + '">' + escapeHtml(movie.quality) + '</span>' : '';
  var imgHtml = movie.thumbnail
    ? '<img class="lazy" data-src="' + escapeHtml(movie.thumbnail) + '" alt="' + escapeHtml(movie.title) + '">'
    : '<div style="width:100%;height:100%;background:var(--bg-hover);display:flex;align-items:center;justify-content:center;color:var(--text-secondary);font-size:0.8rem;padding:10px;text-align:center;">' + escapeHtml(movie.title) + '</div>';

  card.innerHTML =
    '<div class="card-image">' + imgHtml + ratingHtml + qualityHtml + '<div class="card-overlay"></div></div>' +
    '<div class="card-info"><div class="card-title">' + escapeHtml(movie.title) + '</div><div class="card-year">' + escapeHtml(movie.year || '') + '</div></div>';
  return card;
}

/**
 * Show loading skeleton cards
 */
function showLoading(count) {
  var grid = document.querySelector('#movie-grid');
  if (!grid) return;
  var n = count || 12;
  var html = '';
  for (var i = 0; i < n; i++) {
    html += '<div class="movie-card skeleton"><div class="skeleton-card"></div><div class="skeleton-text"></div><div class="skeleton-text short"></div></div>';
  }
  grid.innerHTML = html;
}

/**
 * Show error state
 */
function showError(msg) {
  var grid = document.querySelector('#movie-grid');
  if (!grid) return;
  grid.innerHTML = '<div class="error-state" style="grid-column:1/-1;"><p>' + escapeHtml(msg) + '</p><button class="btn btn-primary" onclick="location.reload()">Retry</button></div>';
}

/**
 * Show empty state message
 */
function showEmpty(msg) {
  var grid = document.querySelector('#movie-grid');
  if (!grid) return;
  grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><div class="empty-icon">&#127916;</div><h3>No Results</h3><p>' + escapeHtml(msg) + '</p><a href="index.html" class="btn btn-primary">Back to Home</a></div>';
}

/**
 * Get URL query parameter
 */
function getUrlParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

/**
 * Initialize search functionality (Enter key navigates to search page)
 */
function initSearch() {
  var input = document.querySelector('#search-input');
  if (!input) return;
  input.addEventListener('keyup', function (e) {
    if (e.key === 'Enter' && e.target.value.trim().length > 0) {
      window.location.href = 'search.html?q=' + encodeURIComponent(e.target.value.trim());
    }
  });
}

/**
 * Setup pagination controls
 */
function setupPagination(current, total, navigateFnName) {
  var container = document.querySelector('#pagination');
  if (!container || total <= 1) {
    if (container) container.innerHTML = '';
    return;
  }

  var html = '';
  html += '<button ' + (current <= 1 ? 'disabled' : '') + ' onclick="window.' + navigateFnName + '(' + (current - 1) + ')">&laquo; Previous</button>';
  html += '<span class="page-info">Page ' + current + ' of ' + total + '</span>';
  html += '<button ' + (current >= total ? 'disabled' : '') + ' onclick="window.' + navigateFnName + '(' + (current + 1) + ')">Next &raquo;</button>';
  container.innerHTML = html;
}
