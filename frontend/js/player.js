/**
 * Player page JavaScript
 * Handles video player, server switching, and movie info display
 */
(function () {
  'use strict';

  var currentServerIndex = 0;
  var streamingUrls = [];
  var movieData = null;

  document.addEventListener('DOMContentLoaded', function () {
    var slug = getUrlParam('slug');

    if (!slug) {
      showPlayerError('No movie specified. Please go back and select a movie.');
      return;
    }

    loadMovieForPlayer(slug);
  });

  /**
   * Load movie details for the player
   */
  function loadMovieForPlayer(slug) {
    fetch(API_BASE_URL + '/movies/' + encodeURIComponent(slug))
      .then(function (response) {
        if (!response.ok) throw new Error('Failed to fetch movie details');
        return response.json();
      })
      .then(function (result) {
        if (result.success && result.data) {
          movieData = result.data;
          streamingUrls = result.data.streamingUrls || [];
          renderPlayerPage(result.data);
        } else {
          showPlayerError('Movie not found or could not be loaded.');
        }
      })
      .catch(function () {
        showPlayerError('Unable to load movie. Please make sure the backend server is running.');
      });
  }

  /**
   * Render the player page content
   */
  function renderPlayerPage(movie) {
    // Set page title
    document.title = (movie.title || 'Player') + ' - NexFlix';

    // Render back link
    var backLink = document.querySelector('.back-link');
    if (backLink) {
      backLink.href = 'movie.html?slug=' + encodeURIComponent(movie.slug || '');
    }

    // Render movie info
    var infoContainer = document.querySelector('.player-info');
    if (infoContainer) {
      var metaParts = [];
      if (movie.releaseYear) metaParts.push(movie.releaseYear);
      if (movie.duration) metaParts.push(movie.duration);
      if (movie.genre && movie.genre.length > 0) metaParts.push(movie.genre.join(', '));

      infoContainer.innerHTML =
        '<h1>' + escapeHtml(movie.title) + '</h1>' +
        '<p class="player-meta">' + escapeHtml(metaParts.join(' \u2022 ')) + '</p>';
    }

    // Render server buttons
    renderServerButtons();

    // Load first server
    if (streamingUrls.length > 0) {
      switchServer(0);
    } else {
      showNoServers();
    }
  }

  /**
   * Render server selection buttons
   */
  function renderServerButtons() {
    var container = document.querySelector('.server-list');
    if (!container) return;

    if (streamingUrls.length === 0) {
      container.innerHTML = '<p style="color:var(--text-secondary);font-size:0.85rem;">No streaming servers available.</p>';
      return;
    }

    var html = '';
    streamingUrls.forEach(function (server, index) {
      var activeClass = index === 0 ? ' active' : '';
      html += '<button class="server-btn' + activeClass + '" onclick="window.switchPlayerServer(' + index + ')">' + escapeHtml(server.source || ('Server ' + (index + 1))) + '</button>';
    });
    container.innerHTML = html;
  }

  /**
   * Switch to a different streaming server
   */
  function switchServer(index) {
    if (index < 0 || index >= streamingUrls.length) return;

    currentServerIndex = index;
    var iframe = document.querySelector('#player-iframe');
    if (iframe) {
      iframe.src = streamingUrls[index].url;
    }

    // Update active button
    var buttons = document.querySelectorAll('.server-btn');
    buttons.forEach(function (btn, i) {
      if (i === index) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // Expose switchServer globally for onclick
  window.switchPlayerServer = switchServer;

  /**
   * Show message when no streaming servers are available
   */
  function showNoServers() {
    var wrapper = document.querySelector('.player-wrapper');
    if (wrapper) {
      wrapper.innerHTML = '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:var(--text-secondary);flex-direction:column;gap:12px;padding:24px;text-align:center;"><p style="font-size:1.1rem;">No streaming sources available</p><p style="font-size:0.85rem;">This movie may not have any embed links yet.</p></div>';
    }
  }

  /**
   * Show player error state
   */
  function showPlayerError(message) {
    var container = document.querySelector('.player-container');
    if (container) {
      container.innerHTML =
        '<a href="index.html" class="back-link">\u2190 Back to Home</a>' +
        '<div class="error-state">' +
          '<p>' + escapeHtml(message) + '</p>' +
          '<a href="index.html" class="btn btn-primary">Go Home</a>' +
        '</div>';
    }
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
