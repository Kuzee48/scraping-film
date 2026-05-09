# 🎬 Scraping Film - Streaming Website

A full-stack streaming website that scrapes movie and series data from LK21-based sources. Features a dark-themed UI for browsing, searching, and streaming movies and TV series.

---

## ✨ Features

- 🕷️ **Web Scraping** - Automatically scrapes movie/series data from LK21-based sources
- 🔍 **Search** - Full-text search across movies and series
- ▶️ **Streaming** - Embedded video player for watching content
- 🌙 **Dark UI** - Modern dark-themed interface inspired by popular streaming platforms
- ⚡ **Caching** - Server-side caching with node-cache to reduce redundant requests
- 🛡️ **Rate Limiting** - Built-in rate limiting to prevent abuse
- 🎭 **Genre Browsing** - Browse content by genre categories
- 📱 **Responsive Design** - Works across desktop and mobile devices

---

## 🛠️ Tech Stack

| Layer      | Technology                  |
| ---------- | --------------------------- |
| Backend    | Node.js, Express.js         |
| Scraping   | Cheerio, Axios              |
| Frontend   | Vanilla HTML, CSS, JavaScript |
| Caching    | node-cache                  |
| Deployment | Docker, Nginx               |

---

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Docker & Docker Compose (optional, for containerized deployment)

---

## 🚀 Installation & Setup

### Local Development

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd scraping-film
   ```

2. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` to customize the base URL or port as needed.

4. **Start the backend server:**
   ```bash
   node server.js
   ```
   The API will be available at `http://localhost:3000`

5. **Open the frontend:**
   - Open `frontend/index.html` directly in your browser, or
   - Serve the `frontend/` directory using a local server:
     ```bash
     npx http-server frontend/
     ```

---

## 📡 API Documentation

| Method | Endpoint              | Description                    | Example                          |
| ------ | --------------------- | ------------------------------ | -------------------------------- |
| GET    | `/api/movies`         | List all movies                | `/api/movies`                    |
| GET    | `/api/movies/search`  | Search movies by query         | `/api/movies/search?q=avengers`  |
| GET    | `/api/movies/:slug`   | Get movie details by slug      | `/api/movies/avengers-endgame`   |
| GET    | `/api/series`         | List all series                | `/api/series`                    |
| GET    | `/api/series/:slug`   | Get series details by slug     | `/api/series/breaking-bad`       |
| GET    | `/api/genres`         | List all available genres      | `/api/genres`                    |
| GET    | `/api/genres/:genre`  | Get movies/series by genre     | `/api/genres/action`             |

---

## 📁 Project Structure

```
scraping-film/
├── backend/
│   ├── routes/
│   │   ├── movies.js              # Movie API routes
│   │   ├── series.js              # Series API routes
│   │   └── genres.js              # Genre API routes
│   ├── scraper.js                 # Web scraping logic
│   ├── server.js                  # Express server entry point
│   ├── package.json               # Backend dependencies
│   ├── Dockerfile                 # Backend Docker image
│   └── .env.example               # Environment variable template
│
├── frontend/
│   ├── css/
│   │   └── style.css              # Dark-themed styles
│   ├── js/
│   │   ├── app.js                 # Main frontend logic
│   │   ├── player.js              # Video player logic
│   │   └── config.js              # Frontend configuration
│   ├── index.html                 # Homepage
│   ├── movie.html                 # Movie detail page
│   ├── player.html                # Video player page
│   ├── search.html                # Search results page
│   ├── genre.html                 # Genre listing page
│   ├── Dockerfile                 # Frontend Docker image (Nginx)
│   └── nginx.conf                 # Nginx configuration
│
├── docker-compose.yml             # Docker Compose configuration
├── .gitignore                     # Git ignore rules
└── README.md                      # Project documentation
```

---

## 🐳 Docker Deployment

Deploy the entire application using Docker Compose:

### Start the Application

```bash
docker-compose up -d
```

This will start:
- **Backend** on port `3000` - Node.js API server
- **Frontend** on port `8080` - Nginx serving static files with API proxy

### Stop the Application

```bash
docker-compose down
```

### Rebuild After Changes

```bash
docker-compose up -d --build
```

---

## ⚙️ Configuration

### Backend Environment Variables (.env)

| Variable   | Description          | Default                       |
| ---------- | -------------------- | ----------------------------- |
| `BASE_URL` | Source website URL   | `https://tv10.lk21official.cc` |
| `PORT`     | Server port          | `3000`                        |

### Frontend Configuration (js/config.js)

| Variable       | Description           | Default                    |
| -------------- | --------------------- | -------------------------- |
| `API_BASE_URL` | Backend API base URL  | `http://localhost:3000/api` |

**Note:** When using Docker Compose, the frontend Nginx config automatically proxies `/api` requests to the backend service. In production, set `API_BASE_URL` to `/api`.

---

## 🐛 Troubleshooting

### Port Already in Use
If port 3000 or 8080 is already in use, modify the ports in `docker-compose.yml` or `.env` file.

### CORS Issues
Ensure the frontend `API_BASE_URL` matches the backend URL. For local development, update `frontend/js/config.js`.

### Scraper Not Working
- Verify the `BASE_URL` in `.env` is accessible
- Check that the target website structure hasn't changed
- Review scraper logs in the backend console

### Container Issues
```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Rebuild from scratch
docker-compose down
docker-compose up -d --build
```

---

## 📝 License

This project is licensed under the **MIT License** - see the LICENSE file for details.

---

## ⚖️ Disclaimer

This project is for **educational purposes only**. It demonstrates web scraping techniques, REST API design, and frontend development. 

**Important:** 
- Respect copyright laws and website terms of service
- Always check the target website's `robots.txt` and terms before scraping
- Use rate limiting to avoid overwhelming server resources
- The developer assumes no responsibility for misuse

---

## 📧 Support

For issues, questions, or suggestions, please open a GitHub issue in this repository.

---

**Made with ❤️ by the Scraping Film Team**
