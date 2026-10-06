# NCHLS – Hazardous Chemical Inventory System

**NCHLS** is a full-stack system for managing and tracking hazardous chemical inventories across departments and institutes. It connects centralized chemical metadata with real-world inventory records, enforcing data consistency across the organization.

---

## 🚀 Features

- **Central Substance Registry**  
  Unified database of hazardous substances, including properties and Safety Data Sheets (SDS).
- **Department-Level Inventory Tracking**  
  Track chemical quantities per institute, department, and year.
- **Relational Integrity**  
  Inventory records are strictly linked to the master substance registry to prevent duplication.
- **Docker-First Architecture**  
  Backend, frontend, database, and reverse proxy are fully containerized for seamless deployment.
- **CI/CD Pipeline**  
  Automated image building and production deployment via GitHub Actions.

---

## 🛠 Tech Stack

### Backend
- Python 3.11
- FastAPI
- PostgreSQL
- Pydantic

### Frontend
- TypeScript
- React
- Vite

### Infrastructure
- Docker & Docker Compose
- Nginx
- GitHub Actions (CI/CD)
- GHCR (GitHub Container Registry)

---

## 💻 Local Development

### Prerequisites
* [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/dominik-farlik/NCHLS.git
    cd nchls
    ```

2.  **Set up Environment Variables:**
    Create a `.env` file in the root directory using the configuration template below.
    ```bash
    touch .env
    ```

3.  **Launch the System:**
    ```bash
    docker compose up -d
    ```

---

## ⚙️ Configuration (.env)

The application requires the following environment variables. Copy these into your `.env` file and modify them with your actual credentials for production use:

```env
# Security & App Settings
SECRET_KEY=your-super-secret-key-here
PASSWORD_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=120
UPLOAD_DIR=/path/to/your/upload/dir
FRONTEND_URL=http://localhost:80
BACKEND_URL=http://localhost:8000

# PostgreSQL Connection
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_db_password
POSTGRES_DB=nchls
DATABASE_URL=postgresql://your_db_user:your_db_password@postgres:5432/nchls

# SMTP Mail Server Configuration
MAIL_USERNAME=your_email@example.com
MAIL_PASSWORD=your_email_password
MAIL_FROM=noreply@example.com
MAIL_PORT=587
MAIL_SERVER=smtp.example.com
MAIL_STARTTLS=True
MAIL_SSL_TLS=False
```

---

## 🚀 Production Deployment

Production deployment is fully automated via GitHub Actions.

**On push to `main`:**
1. Backend and frontend images are built.
2. Images are pushed to GHCR.
3. The server pulls the updated images.
4. Containers are automatically restarted.

**Manual deployment:**
```bash
cd /home/ubuntu/nchls
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```