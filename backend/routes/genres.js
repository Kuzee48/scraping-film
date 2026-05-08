const express = require('express');
const router = express.Router();
const scraper = require('../scraper');

/**
 * GET /api/genres
 * List all available genres
 */
router.get('/', async (req, res, next) => {
  try {
    const cacheKey = 'genres_list';
    const cached = req.app.locals.cache ? req.app.locals.cache.get(cacheKey) : null;

    if (cached) {
      return res.json(cached);
    }

    const result = await scraper.getGenres();

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
 * GET /api/genres/:genre
 * Get movies by genre with pagination
 * Query params: page (number)
 */
router.get('/:genre', async (req, res, next) => {
  try {
    const genre = req.params.genre;
    const page = parseInt(req.query.page, 10) || 1;

    if (!genre) {
      return res.status(400).json({
        success: false,
        error: 'Genre parameter is required',
      });
    }

    const cacheKey = `genre_${genre}_page_${page}`;
    const cached = req.app.locals.cache ? req.app.locals.cache.get(cacheKey) : null;

    if (cached) {
      return res.json(cached);
    }

    const result = await scraper.getMovies(page, genre);

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
