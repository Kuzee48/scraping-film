🎬 Scraping Film — Website Streaming

by Kuzee48

Website streaming full-stack yang melakukan scraping data film dan serial dari sumber berbasis LK21. Menghadirkan tampilan dark mode modern untuk menjelajahi, mencari, dan menonton film maupun series secara online.


---

✨ Fitur Utama

Web Scraping Otomatis — Mengambil data film & serial secara otomatis dari sumber berbasis LK21

Pencarian Cepat — Search film dan serial dengan full-text search

Streaming Player — Pemutar video terintegrasi untuk menonton langsung

Dark Mode UI — Desain modern bertema gelap seperti platform streaming populer

Caching System — Menggunakan node-cache untuk mengurangi request berulang

Rate Limiting — Proteksi API agar tidak mudah disalahgunakan

Kategori Genre — Jelajahi film berdasarkan genre

Responsive Design — Nyaman digunakan di desktop maupun mobile



---

🛠 Tech Stack

Layer	Teknologi

Backend	Node.js, Express.js
Scraping	Cheerio, Axios
Frontend	HTML, CSS, JavaScript
Cache	node-cache
Deploy	Docker, Nginx



---

📦 Persyaratan

Node.js versi 18+

npm



---

🚀 Instalasi & Setup

1. Clone Repository

git clone <repo-url>
cd scraping-film


---

2. Install Dependency Backend

cd backend
npm install


---

3. Konfigurasi Environment

cp .env.example .env

Edit file .env jika ingin mengganti URL sumber atau port server.


---

4. Jalankan Backend

node server.js


---

5. Jalankan Frontend

Buka file:

frontend/index.html

langsung di browser, atau gunakan static server seperti:

npx serve frontend


---

📚 Dokumentasi API

Method	Endpoint	Deskripsi	Contoh

GET	/api/movies	Menampilkan semua film	/api/movies
GET	/api/movies/search	Mencari film berdasarkan query	/api/movies/search?q=avengers
GET	/api/movies/:slug	Detail film berdasarkan slug	/api/movies/avengers-endgame
GET	/api/series	Menampilkan semua serial	/api/series
GET	/api/series/:slug	Detail serial berdasarkan slug	/api/series/breaking-bad
GET	/api/genres	Daftar semua genre	/api/genres
GET	/api/genres/:genre	Film/serial berdasarkan genre	/api/genres/action



---

📁 Struktur Project

scraping-film/
├── backend/
│   ├── routes/
│   │   ├── movies.js
│   │   ├── series.js
│   │   └── genres.js
│   ├── scraper.js
│   ├── server.js
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── app.js
│   │   ├── player.js
│   │   └── config.js
│   ├── index.html
│   ├── movie.html
│   ├── player.html
│   ├── search.html
│   ├── genre.html
│   ├── Dockerfile
│   └── nginx.conf
│
├── docker-compose.yml
├── .gitignore
└── README.md


---

🐳 Deployment Docker

Menjalankan seluruh aplikasi menggunakan Docker Compose:

docker-compose up -d

Service yang akan berjalan:

Backend → Port 3000

Frontend → Port 8080



---

Menghentikan Container

docker-compose down


---

Rebuild Setelah Perubahan

docker-compose up -d --build


---

⚙️ Konfigurasi

Backend (.env)

Variable	Deskripsi	Default

BASE_URL	URL website sumber scraping	https://tv10.lk21official.cc
PORT	Port server backend	3000



---

Frontend (js/config.js)

Variable	Deskripsi	Default

API_BASE_URL	URL API backend	http://localhost:3000/api


Saat menggunakan Docker Compose, Nginx akan otomatis melakukan proxy ke backend, sehingga production bisa menggunakan:

API_BASE_URL = "/api"


---

⚠️ Disclaimer

Project ini dibuat hanya untuk tujuan pembelajaran dan edukasi, seperti:

Teknik web scraping

Pembuatan REST API

Pengembangan frontend & backend

Deployment menggunakan Docker


Harap tetap menghormati hak cipta dan ketentuan layanan dari website sumber.
Developer tidak bertanggung jawab atas penyalahgunaan project ini.


---

📄 License

MIT License


---

<div align="center">Developed with ❤️ by Kuzee48

</div>
