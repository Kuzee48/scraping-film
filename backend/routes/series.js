const express = require('express');
const router = express.Router();
const scraper = require('../scraper');

/**
 * GET /api/series
 * List series with pagination
 * Query params: page (number)
 */
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;

    const cacheKey = `series_page_${page}`;
    const cached = req.app.locals.cache ? req.app.locals.cache.get(cacheKey) : null;

    if (cached) {
      return res.json(cached);
    }

    const result = await scraper.getSeries(page);

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
 * GET /api/series/:slug
 * Get series detail with episodes and streaming links
 */
router.get('/:slug', async (req, res, next) => {
  try {
    const slug = req.params.slug;

    if (!slug) {
      return res.status(400).json({
        success: false,
        error: 'Series slug is required',
      });
    }

    const cacheKey = `series_detail_${slug}`;
    const cached = req.app.locals.cache ? req.app.locals.cache.get(cacheKey) : null;

    if (cached) {
      return res.json(cached);
    }

    const result = await scraper.getSeriesDetail(slug);

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
