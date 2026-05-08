const express = require('express');
const router = express.Router();
const scraper = require('../scraper');

/**
 * GET /api/movies
 * List movies with optional pagination and filters
 * Query params: page (number), genre (string), year (string)
 */
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const genre = req.query.genre || '';
    const year = req.query.year || '';

    const cacheKey = `movies_page_${page}_genre_${genre}_year_${year}`;
    const cached = req.app.locals.cache ? req.app.locals.cache.get(cacheKey) : null;

    if (cached) {
      return res.json(cached);
    }

    const result = await scraper.getMovies(page, genre, year);

    if (result.success && req.app.locals.cache) {
      req.app.locals.cache.set(cacheKey, result);
    }

    if (!result.success) {
      return res.status(502).json(result);
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/movies/search
 * Search movies by query
 * Query params: q (string), page (number)
 */
router.get('/search', async (req, res, next) => {
  try {
    const query = req.query.q || '';
    const page = parseInt(req.query.page, 10) || 1;

    if (!query.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Search query parameter "q" is required',
      });
    }

    const cacheKey = `search_${query}_page_${page}`;
    const cached = req.app.locals.cache ? req.app.locals.cache.get(cacheKey) : null;

    if (cached) {
      return res.json(cached);
    }

    const result = await scraper.searchMovies(query, page);

    if (result.success && req.app.locals.cache) {
      req.app.locals.cache.set(cacheKey, result);
    }

    if (!result.success) {
      return res.status(502).json(result);
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/movies/:slug
 * Get movie detail with streaming links
 */
router.get('/:slug', async (req, res, next) => {
  try {
    const slug = req.params.slug;

    if (!slug) {
      return res.status(400).json({
        success: false,
        error: 'Movie slug is required',
      });
    }

    const cacheKey = `movie_detail_${slug}`;
    const cached = req.app.locals.cache ? req.app.locals.cache.get(cacheKey) : null;

    if (cached) {
      return res.json(cached);
    }

    const result = await scraper.getMovieDetail(slug);

    if (result.success && req.app.locals.cache) {
      req.app.locals.cache.set(cacheKey, result);
    }

    if (!result.success) {
      return res.status(502).json(result);
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
