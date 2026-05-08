const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = process.env.BASE_URL || 'https://tv10.lk21official.cc';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
  },
});

/**
 * Parse a listing page and extract movie/series items
 */
function parseListItems($) {
  const items = [];

  $('.ml-item').each((index, element) => {
    try {
      const $item = $(element);
      const $link = $item.find('a').first();
      const $img = $item.find('img').first();
      const $quality = $item.find('.mli-quality').first();
      const $rating = $item.find('.mli-rating').first();

      const href = $link.attr('href') || '';
      const title = $img.attr('alt') || $link.attr('title') || $item.find('.mli-info h2').text().trim() || '';
      const thumbnail = $img.attr('src') || $img.attr('data-original') || '';
      const quality = $quality.text().trim() || '';
      const rating = $rating.text().trim() || '';

      // Extract slug from URL
      const slug = href.replace(BASE_URL, '').replace(/^\/+|\/+$/g, '') || '';

      // Try to extract year from title or info
      const yearMatch = title.match(/\((\d{4})\)/) || $item.find('.mli-info').text().match(/(\d{4})/);
      const year = yearMatch ? yearMatch[1] : '';

      if (title || href) {
        items.push({
          title: title.replace(/\(\d{4}\)/, '').trim(),
          slug,
          url: href,
          thumbnail,
          quality,
          rating,
          year,
        });
      }
    } catch (err) {
      // Skip malformed items
    }
  });

  return items;
}

/**
 * Extract pagination info from the page
 */
function parsePagination($) {
  const pagination = {
    currentPage: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  };

  try {
    const $active = $('.pagination .active, .page-numbers .current').first();
    if ($active.length) {
      pagination.currentPage = parseInt($active.text().trim(), 10) || 1;
    }

    const $pages = $('.pagination a, .page-numbers a');
    let maxPage = pagination.currentPage;
    $pages.each((i, el) => {
      const pageNum = parseInt($(el).text().trim(), 10);
      if (!isNaN(pageNum) && pageNum > maxPage) {
        maxPage = pageNum;
      }
    });
    pagination.totalPages = maxPage;

    pagination.hasNext = pagination.currentPage < pagination.totalPages;
    pagination.hasPrev = pagination.currentPage > 1;
  } catch (err) {
    // Use defaults
  }

  return pagination;
}

/**
 * Get movies listing with optional pagination
 */
async function getMovies(page = 1, genre = '', year = '') {
  try {
    let url = '/';

    if (genre) {
      url = `/genre/${genre}/`;
    }

    if (page > 1) {
      url = url.endsWith('/') ? `${url}page/${page}/` : `${url}/page/${page}/`;
    }

    if (year) {
      url += url.includes('?') ? `&year=${year}` : `?year=${year}`;
    }

    const response = await axiosInstance.get(url);
    const $ = cheerio.load(response.data);

    const movies = parseListItems($);
    const pagination = parsePagination($);
    pagination.currentPage = page;

    return {
      success: true,
      data: movies,
      pagination,
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      pagination: { currentPage: page, totalPages: 1, hasNext: false, hasPrev: false },
      error: error.message || 'Failed to fetch movies',
    };
  }
}

/**
 * Get movie detail by slug
 */
async function getMovieDetail(slug) {
  try {
    const url = `/${slug}/`;
    const response = await axiosInstance.get(url);
    const $ = cheerio.load(response.data);

    const detail = {};

    // Title
    detail.title = $('h1').first().text().trim() || $('.mvic-desc h3').first().text().trim() || '';

    // Thumbnail/poster
    detail.poster = $('.mvic-thumb img, .thumb img, .movie-thumb img').attr('src') || '';
    if (!detail.poster) {
      const bgStyle = $('.mvic-thumb').attr('style') || '';
      const bgMatch = bgStyle.match(/url\(['"]?([^'")\s]+)['"]?\)/);
      if (bgMatch) {
        detail.poster = bgMatch[1];
      }
    }

    // Synopsis/description
    detail.synopsis = $('.desc, .mvic-desc .desc, .f-desc').first().text().trim() || '';
    if (!detail.synopsis) {
      detail.synopsis = $('[itemprop="description"]').text().trim() || '';
    }

    // Extract meta info from .mvic-info or info block
    detail.genre = [];
    detail.cast = [];
    detail.country = '';
    detail.duration = '';
    detail.releaseYear = '';
    detail.director = '';
    detail.quality = '';

    // Parse info paragraphs in .mvic-desc or .mvic-info
    $('.mvic-desc .mvic-info p, .mvic-info p, .mvici-left p').each((i, el) => {
      const $el = $(el);
      const text = $el.text().trim();
      const label = text.split(':')[0].toLowerCase().trim();

      if (label.includes('genre') || label.includes('kategori')) {
        $el.find('a').each((j, a) => {
          const genreText = $(a).text().trim();
          if (genreText) detail.genre.push(genreText);
        });
        if (detail.genre.length === 0) {
          const genreVal = text.split(':').slice(1).join(':').trim();
          if (genreVal) detail.genre = genreVal.split(',').map(g => g.trim());
        }
      } else if (label.includes('actor') || label.includes('pemain') || label.includes('cast')) {
        $el.find('a').each((j, a) => {
          const castText = $(a).text().trim();
          if (castText) detail.cast.push(castText);
        });
        if (detail.cast.length === 0) {
          const castVal = text.split(':').slice(1).join(':').trim();
          if (castVal) detail.cast = castVal.split(',').map(c => c.trim());
        }
      } else if (label.includes('country') || label.includes('negara')) {
        detail.country = $el.find('a').first().text().trim() || text.split(':').slice(1).join(':').trim();
      } else if (label.includes('duration') || label.includes('durasi')) {
        detail.duration = text.split(':').slice(1).join(':').trim();
      } else if (label.includes('year') || label.includes('tahun') || label.includes('release')) {
        detail.releaseYear = $el.find('a').first().text().trim() || text.split(':').slice(1).join(':').trim();
      } else if (label.includes('director') || label.includes('sutradara')) {
        detail.director = $el.find('a').first().text().trim() || text.split(':').slice(1).join(':').trim();
      } else if (label.includes('quality') || label.includes('kualitas')) {
        detail.quality = text.split(':').slice(1).join(':').trim();
      }
    });

    // Extract streaming embed URLs
    detail.streamingUrls = [];

    // Look for iframes in player containers
    $('#media-player iframe, .player-embed iframe, .movieplay iframe, #player iframe, .embed-responsive iframe').each((i, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src') || '';
      if (src) {
        detail.streamingUrls.push({
          source: `Server ${i + 1}`,
          url: src.startsWith('//') ? `https:${src}` : src,
        });
      }
    });

    // Look for streaming links in tab panels or server lists
    $('.mirrorTab a, .server-list a, #server-list a, .mirror-list a').each((i, el) => {
      const href = $(el).attr('href') || $(el).attr('data-video') || '';
      const label = $(el).text().trim() || `Server ${i + 1}`;
      if (href) {
        detail.streamingUrls.push({
          source: label,
          url: href.startsWith('//') ? `https:${href}` : href,
        });
      }
    });

    detail.slug = slug;

    return {
      success: true,
      data: detail,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error.message || 'Failed to fetch movie detail',
    };
  }
}

/**
 * Search movies by query
 */
async function searchMovies(query, page = 1) {
  try {
    if (!query || !query.trim()) {
      return {
        success: false,
        data: [],
        error: 'Search query is required',
      };
    }

    const encodedQuery = encodeURIComponent(query.trim());
    let url = `/?s=${encodedQuery}`;
    if (page > 1) {
      url = `/page/${page}/?s=${encodedQuery}`;
    }

    const response = await axiosInstance.get(url);
    const $ = cheerio.load(response.data);

    const results = parseListItems($);
    const pagination = parsePagination($);
    pagination.currentPage = page;

    return {
      success: true,
      data: results,
      pagination,
      query: query.trim(),
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      pagination: { currentPage: page, totalPages: 1, hasNext: false, hasPrev: false },
      error: error.message || 'Search failed',
    };
  }
}

/**
 * Get series listing with pagination
 */
async function getSeries(page = 1) {
  try {
    let url = '/series/';
    if (page > 1) {
      url = `/series/page/${page}/`;
    }

    const response = await axiosInstance.get(url);
    const $ = cheerio.load(response.data);

    const series = parseListItems($);
    const pagination = parsePagination($);
    pagination.currentPage = page;

    return {
      success: true,
      data: series,
      pagination,
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      pagination: { currentPage: page, totalPages: 1, hasNext: false, hasPrev: false },
      error: error.message || 'Failed to fetch series',
    };
  }
}

/**
 * Get series detail by slug (including episodes)
 */
async function getSeriesDetail(slug) {
  try {
    const url = `/${slug}/`;
    const response = await axiosInstance.get(url);
    const $ = cheerio.load(response.data);

    const detail = {};

    // Title
    detail.title = $('h1').first().text().trim() || $('.mvic-desc h3').first().text().trim() || '';

    // Poster
    detail.poster = $('.mvic-thumb img, .thumb img').attr('src') || '';
    if (!detail.poster) {
      const bgStyle = $('.mvic-thumb').attr('style') || '';
      const bgMatch = bgStyle.match(/url\(['"]?([^'")\s]+)['"]?\)/);
      if (bgMatch) {
        detail.poster = bgMatch[1];
      }
    }

    // Synopsis
    detail.synopsis = $('.desc, .mvic-desc .desc, .f-desc').first().text().trim() || '';
    if (!detail.synopsis) {
      detail.synopsis = $('[itemprop="description"]').text().trim() || '';
    }

    // Meta info
    detail.genre = [];
    detail.cast = [];
    detail.country = '';
    detail.releaseYear = '';
    detail.director = '';
    detail.status = '';

    $('.mvic-desc .mvic-info p, .mvic-info p, .mvici-left p').each((i, el) => {
      const $el = $(el);
      const text = $el.text().trim();
      const label = text.split(':')[0].toLowerCase().trim();

      if (label.includes('genre') || label.includes('kategori')) {
        $el.find('a').each((j, a) => {
          const genreText = $(a).text().trim();
          if (genreText) detail.genre.push(genreText);
        });
      } else if (label.includes('actor') || label.includes('pemain') || label.includes('cast')) {
        $el.find('a').each((j, a) => {
          const castText = $(a).text().trim();
          if (castText) detail.cast.push(castText);
        });
      } else if (label.includes('country') || label.includes('negara')) {
        detail.country = $el.find('a').first().text().trim() || text.split(':').slice(1).join(':').trim();
      } else if (label.includes('year') || label.includes('tahun') || label.includes('release')) {
        detail.releaseYear = $el.find('a').first().text().trim() || text.split(':').slice(1).join(':').trim();
      } else if (label.includes('director') || label.includes('sutradara')) {
        detail.director = $el.find('a').first().text().trim() || text.split(':').slice(1).join(':').trim();
      } else if (label.includes('status')) {
        detail.status = text.split(':').slice(1).join(':').trim();
      }
    });

    // Episodes
    detail.episodes = [];

    // LK21 series typically list episodes as links within season containers
    $('.episodelist ul li a, .eps-list a, #episode-list a, .season-list a').each((i, el) => {
      const $el = $(el);
      const epTitle = $el.text().trim();
      const epUrl = $el.attr('href') || '';
      const epSlug = epUrl.replace(BASE_URL, '').replace(/^\/+|\/+$/g, '');

      if (epTitle || epUrl) {
        detail.episodes.push({
          title: epTitle,
          slug: epSlug,
          url: epUrl,
          episode: i + 1,
        });
      }
    });

    // If no episode list found, check for season/episode dropdowns or tabs
    if (detail.episodes.length === 0) {
      $('.season-toggle a, .episode-nav a, .epxs a').each((i, el) => {
        const $el = $(el);
        const epTitle = $el.text().trim();
        const epUrl = $el.attr('href') || '';
        const epSlug = epUrl.replace(BASE_URL, '').replace(/^\/+|\/+$/g, '');

        if (epTitle || epUrl) {
          detail.episodes.push({
            title: epTitle,
            slug: epSlug,
            url: epUrl,
            episode: i + 1,
          });
        }
      });
    }

    // Streaming URLs for the current page (if it is an episode page)
    detail.streamingUrls = [];
    $('#media-player iframe, .player-embed iframe, .movieplay iframe, #player iframe, .embed-responsive iframe').each((i, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src') || '';
      if (src) {
        detail.streamingUrls.push({
          source: `Server ${i + 1}`,
          url: src.startsWith('//') ? `https:${src}` : src,
        });
      }
    });

    detail.slug = slug;

    return {
      success: true,
      data: detail,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error.message || 'Failed to fetch series detail',
    };
  }
}

/**
 * Get available genres
 */
async function getGenres() {
  try {
    const response = await axiosInstance.get('/');
    const $ = cheerio.load(response.data);

    const genres = [];

    // LK21 sites typically list genres in navigation menus or sidebar
    $('li.genre-item a, .genres-list a, nav .genre a, .categories a, ul.genre a').each((i, el) => {
      const $el = $(el);
      const name = $el.text().trim();
      const href = $el.attr('href') || '';
      const slug = href.replace(BASE_URL, '').replace(/^\/+|\/+$/g, '').replace('genre/', '');

      if (name && !genres.find(g => g.name === name)) {
        genres.push({ name, slug });
      }
    });

    // Fallback: look for genre links in any menu
    if (genres.length === 0) {
      $('a[href*="/genre/"]').each((i, el) => {
        const $el = $(el);
        const name = $el.text().trim();
        const href = $el.attr('href') || '';
        const slug = href.split('/genre/')[1] || '';
        const cleanSlug = slug.replace(/\/+$/, '');

        if (name && cleanSlug && !genres.find(g => g.name === name)) {
          genres.push({ name, slug: cleanSlug });
        }
      });
    }

    return {
      success: true,
      data: genres,
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      error: error.message || 'Failed to fetch genres',
    };
  }
}

module.exports = {
  getMovies,
  getMovieDetail,
  searchMovies,
  getSeries,
  getSeriesDetail,
  getGenres,
};
