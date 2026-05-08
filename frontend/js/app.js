/**
 * Main application JavaScript
 * Handles movie listing, search, pagination, and UI interactions
 */
(function () {
  'use strict';

  var currentPage = 1;
  var totalPages = 1;
  var currentGenre = '';
  var isLoading = false;
  var searchTimeout = null;

  /**
   * Initialize the application on DOM ready
   */
  document.addEventListener('DOMContentLoaded', function () {
    initNavbar();
    initSearch();
    loadGenres();

    // Determine current page context
    var page = getUrlParam('page');
    currentPage = page ? parseInt(page, 10) : 1;
    currentGenre = getUrlParam('genre') || '';

    fetchMovies(currentPage, currentGenre);
    setupLazyLoading();
  });

  /**
   * Initialize navbar scroll behavior and mobile toggle
   */
  function initNavbar() {
    var navbar = document.querySelector('.navbar');
    var toggle = document.querySelector('.nav-toggle');
    var mobileMenu = document.querySelector('.nav-mobile-menu');

    if (navbar) {
      window.addEventListener('scroll', function () {
        if (window.scrollY > 50) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      });
    }

    if (toggle && mobileMenu) {
      toggle.addEventListener('click', function () {
        mobileMenu.classList.toggle('open');
      });
    }
  }

  /**
   * Initialize search functionality with debounce
   */
  function initSearch() {
    var searchInput = document.querySelector('#search-input');
    if (!searchInput) return;

    searchInput.addEventListener('keyup', function (e) {
      var query = e.target.value.trim();

      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      if (e.key === 'Enter' && query.length > 0) {
        window.location.href = 'search.html?q=' + encodeURIComponent(query);
        return;
      }

      searchTimeout = setTimeout(function () {
        if (query.length >= 3) {
          window.location.href = 'search.html?q=' + encodeURIComponent(query);
        }
      }, 300);
    });
  }

  /**
   * Fetch movies from API
   */
  function fetchMovies(page, genre) {
    if (isLoading) return;
    isLoading = true;

    showLoading();

    var url = API_BASE_URL + '/movies?page=' + page;
    if (genre) {
      url = API_BASE_URL + '/genres/' + encodeURIComponent(genre) + '?page=' + page;
    }

    fetch(url)
      .then(function (response) {
        if (!response.ok) throw new Error('Failed to fetch movies');
        return response.json();
      })
      .then(function (result) {
        hideLoading();
        isLoading = false;

        if (result.success && result.data && result.data.length > 0) {
          renderMovies(result.data);
          if (result.pagination) {
            totalPages = result.pagination.totalPages || 1;
            currentPage = result.pagination.currentPage || page;
            setupPagination(currentPage, totalPages);
          }
          // Set hero from first movie if hero section exists
          if (page === 1 && !genre) {
            setHeroMovie(result.data[0]);
          }
        } else {
          showEmptyState('No movies found.');
        }
      })
      .catch(function (error) {
        hideLoading();
        isLoading = false;
        showError('Unable to load movies. Please make sure the backend server is running.');
      });
  }

  /**
   * Render movie cards into the grid
   */
  function renderMovies(movies) {
    var grid = document.querySelector('#movie-grid');
    if (!grid) return;

    grid.innerHTML = '';

    movies.forEach(function (movie) {
      var card = renderMovieCard(movie);
      grid.appendChild(card);
    });
  }

  /**
   * Create a movie card DOM element
   */
  function renderMovieCard(movie) {
    var card = document.createElement('a');
    card.className = 'movie-card';
    card.href = 'movie.html?slug=' + encodeURIComponent(movie.slug);

    var qualityClass = '';
    if (movie.quality && movie.quality.toLowerCase().indexOf('cam') !== -1) {
      qualityClass = ' cam';
    }

    var ratingHtml = '';
    if (movie.rating) {
      ratingHtml = '<span class="rating-badge">' + escapeHtml(movie.rating) + '</span>';
    }

    var qualityHtml = '';
    if (movie.quality) {
      qualityHtml = '<span class="quality-badge' + qualityClass + '">' + escapeHtml(movie.quality) + '</span>';
    }

    var thumbnail = movie.thumbnail || '';
    var imgHtml = thumbnail
      ? '<img data-src="' + escapeHtml(thumbnail) + '" alt="' + escapeHtml(movie.title) + '" class="lazy">'
      : '<div style="width:100%;height:100%;background:var(--bg-hover);display:flex;align-items:center;justify-content:center;color:var(--text-secondary);font-size:0.8rem;padding:10px;text-align:center;">' + escapeHtml(movie.title) + '</div>';

    card.innerHTML =
      '<div class="card-image">' +
        imgHtml +
        ratingHtml +
        qualityHtml +
        '<div class="card-overlay"></div>' +
      '</div>' +
      '<div class="card-info">' +
        '<div class="card-title">' + escapeHtml(movie.title) + '</div>' +
        '<div class="card-year">' + escapeHtml(movie.year || '') + '</div>' +
      '</div>';

    return card;
  }

  /**
   * Set hero section with featured movie data
   */
  function setHeroMovie(movie) {
    var hero = document.querySelector('.hero');
    if (!hero || !movie) return;

    var heroContent = hero.querySelector('.hero-content');
    if (!heroContent) return;

    if (movie.thumbnail) {
      hero.style.backgroundImage = 'url(' + movie.thumbnail + ')';
    }

    var metaHtml = '';
    if (movie.year) metaHtml += '<span>' + escapeHtml(movie.year) + '</span>';
    if (movie.quality) metaHtml += '<span class="badge">' + escapeHtml(movie.quality) + '</span>';
    if (movie.rating) metaHtml += '<span>\u2605 ' + escapeHtml(movie.rating) + '</span>';

    heroContent.innerHTML =
      '<h1>' + escapeHtml(movie.title) + '</h1>' +
      '<div class="hero-meta">' + metaHtml + '</div>' +
      '<div class="hero-buttons">' +
        '<a href="movie.html?slug=' + encodeURIComponent(movie.slug) + '" class="btn btn-primary">\u25B6 Watch Now</a>' +
        '<a href="movie.html?slug=' + encodeURIComponent(movie.slug) + '" class="btn btn-secondary">More Info</a>' +
      '</div>';
  }

  /**
   * Setup pagination controls
   */
  function setupPagination(current, total) {
    var container = document.querySelector('#pagination');
    if (!container) return;

    if (total <= 1) {
      container.innerHTML = '';
      return;
    }

    var html = '';

    html += '<button ' + (current <= 1 ? 'disabled' : '') + ' onclick="window.appNavigate(' + (current - 1) + ')">&laquo; Previous</button>';
    html += '<span class="page-info">Page ' + current + ' of ' + total + '</span>';
    html += '<button ' + (current >= total ? 'disabled' : '') + ' onclick="window.appNavigate(' + (current + 1) + ')">Next &raquo;</button>';

    container.innerHTML = html;
  }

  /**
   * Navigate to a specific page
   */
  window.appNavigate = function (page) {
    var params = new URLSearchParams(window.location.search);
    params.set('page', page);
    window.location.search = params.toString();
  };

  /**
   * Load genres for navigation
   */
  function loadGenres() {
    fetch(API_BASE_URL + '/genres')
      .then(function (response) {
        return response.json();
      })
      .then(function (result) {
        if (result.success && result.data) {
          renderGenreLinks(result.data);
        }
      })
      .catch(function () {
        // Genres are supplemental; silent fail is acceptable
      });
  }

  /**
   * Render genre links in sidebar or nav
   */
  function renderGenreLinks(genres) {
    var container = document.querySelector('#genre-list');
    if (!container || !genres.length) return;

    var html = '';
    genres.slice(0, 12).forEach(function (genre) {
      html += '<a href="genre.html?genre=' + encodeURIComponent(genre.slug) + '">' + escapeHtml(genre.name) + '</a>';
    });
    container.innerHTML = html;
  }

  /**
   * Show loading skeleton cards
   */
  function showLoading() {
    var grid = document.querySelector('#movie-grid');
    if (!grid) return;

    var html = '';
    for (var i = 0; i < 12; i++) {
      html += '<div class="movie-card skeleton"><div class="skeleton-card"></div><div class="skeleton-text"></div><div class="skeleton-text short"></div></div>';
    }
    grid.innerHTML = html;
  }

  /**
   * Hide loading state
   */
  function hideLoading() {
    // Loading is cleared when movies render
  }

  /**
   * Show empty state message
   */
  function showEmptyState(message) {
    var grid = document.querySelector('#movie-grid');
    if (!grid) return;

    grid.innerHTML =
      '<div class="empty-state" style="grid-column:1/-1;">' +
        '<div class="empty-icon">&#127916;</div>' +
        '<h3>No Results</h3>' +
        '<p>' + escapeHtml(message) + '</p>' +
        '<a href="index.html" class="btn btn-primary">Back to Home</a>' +
      '</div>';
  }

  /**
   * Show error state
   */
  function showError(message) {
    var grid = document.querySelector('#movie-grid');
    if (!grid) return;

    grid.innerHTML =
      '<div class="error-state" style="grid-column:1/-1;">' +
        '<p>' + escapeHtml(message) + '</p>' +
        '<button class="btn btn-primary" onclick="location.reload()">Retry</button>' +
      '</div>';
  }

  /**
   * Setup IntersectionObserver for lazy loading images
   */
  function setupLazyLoading() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: load all images immediately
      loadAllImages();
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            img.classList.remove('lazy');
          }
          observer.unobserve(img);
        }
      });
    }, { rootMargin: '100px' });

    // Observe current and future lazy images via MutationObserver
    var grid = document.querySelector('#movie-grid');
    if (grid) {
      var mutationObserver = new MutationObserver(function () {
        var images = grid.querySelectorAll('img.lazy');
        images.forEach(function (img) {
          observer.observe(img);
        });
      });
      mutationObserver.observe(grid, { childList: true, subtree: true });
    }

    // Observe any existing images
    document.querySelectorAll('img.lazy').forEach(function (img) {
      observer.observe(img);
    });
  }

  /**
   * Fallback: load all lazy images immediately
   */
  function loadAllImages() {
    document.querySelectorAll('img.lazy').forEach(function (img) {
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        img.classList.remove('lazy');
      }
    });
  }

  /**
   * Get URL query parameter
   */
  function getUrlParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  /**
   * Escape HTML to prevent XSS
   */
  function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }
})();
