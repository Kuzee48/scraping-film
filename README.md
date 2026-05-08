# 🎬 Scraping Film - Streaming Website

A full-stack streaming website that scrapes movie and series data from LK21-based sources. Features a dark-themed UI for browsing, searching, and streaming movies and TV series.

## Features

- **Web Scraping** - Automatically scrapes movie/series data from LK21-based sources
- **Search** - Full-text search across movies and series
- **Streaming** - Embedded video player for watching content
- **Dark UI** - Modern dark-themed interface inspired by popular streaming platforms
- **Caching** - Server-side caching with node-cache to reduce redundant requests
- **Rate Limiting** - Built-in rate limiting to prevent abuse
- **Genre Browsing** - Browse content by genre categories
- **Responsive Design** - Works across desktop and mobile devices

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Backend  | Node.js, Express.js                 |
| Scraping | Cheerio, Axios                      |
| Frontend | Vanilla HTML, CSS, JavaScript       |
| Caching  | node-cache                          |
| Deploy   | Docker, Nginx                       |

## Prerequisites

- Node.js 18+
- npm

## Installation & Setup

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd scraping-film
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` if you need to change the base URL or port.

4. Start the backend server:
   ```bash
   node server.js
   ```

5. Open the frontend:
   - Open `frontend/index.html` directly in your browser, or
   - Serve the `frontend/` directory with any static file server

## API Documentation

| Method | Endpoint              | Description                    | Example                          |
|--------|-----------------------|--------------------------------|----------------------------------|
| GET    | `/api/movies`         | List all movies                | `/api/movies`                    |
| GET    | `/api/movies/search`  | Search movies by query         | `/api/movies/search?q=avengers`  |
| GET    | `/api/movies/:slug`   | Get movie details by slug      | `/api/movies/avengers-endgame`   |
| GET    | `/api/series`         | List all series                | `/api/series`                    |
| GET    | `/api/series/:slug`   | Get series details by slug     | `/api/series/breaking-bad`       |
| GET    | `/api/genres`         | List all available genres      | `/api/genres`                    |
| GET    | `/api/genres/:genre`  | Get movies/series by genre     | `/api/genres/action`             |

## Project Structure

```
scraping-film/
├── backend/
│   ├── routes/
│   │   ├── movies.js        # Movie API routes
│   │   ├── series.js        # Series API routes
│   │   └── genres.js        # Genre API routes
│   ├── scraper.js           # Web scraping logic
│   ├── server.js            # Express server entry point
│   ├── package.json         # Backend dependencies
│   ├── Dockerfile           # Backend Docker image
│   └── .env.example         # Environment variable template
├── frontend/
│   ├── css/
│   │   └── style.css        # Dark-themed styles
│   ├── js/
│   │   ├── app.js           # Main frontend logic
│   │   ├── player.js        # Video player logic
│   │   └── config.js        # Frontend configuration
│   ├── index.html           # Homepage
│   ├── movie.html           # Movie detail page
│   ├── player.html          # Video player page
│   ├── search.html          # Search results page
│   ├── genre.html           # Genre listing page
│   ├── Dockerfile           # Frontend Docker image (Nginx)
│   └── nginx.conf           # Nginx configuration
├── docker-compose.yml       # Docker deployment config
├── .gitignore
└── README.md
```

## Docker Deployment

Deploy the entire application with Docker Compose:

```bash
docker-compose up -d
```

This will start:
- **Backend** on port `3000` - Node.js API server
- **Frontend** on port `8080` - Nginx serving static files with API proxy

To stop:
```bash
docker-compose down
```

To rebuild after changes:
```bash
docker-compose up -d --build
```

## Configuration

### Backend (.env)

| Variable   | Description               | Default                            |
|------------|---------------------------|------------------------------------|
| `BASE_URL` | Source website URL         | `https://tv10.lk21official.cc`     |
| `PORT`     | Server port               | `3000`                             |

### Frontend (js/config.js)

| Variable       | Description           | Default                       |
|----------------|-----------------------|-------------------------------|
| `API_BASE_URL` | Backend API base URL  | `http://localhost:3000/api`   |

When using Docker Compose, the frontend Nginx config proxies `/api` requests to the backend service automatically, so `API_BASE_URL` can be set to `/api` for production.

## Disclaimer

This project is for **educational purposes only**. It demonstrates web scraping techniques, REST API design, and frontend development. Respect copyright laws and website terms of service. The developers are not responsible for any misuse of this software.

## License

MIT
