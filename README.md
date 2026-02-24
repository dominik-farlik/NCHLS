# NCHLS – Hazardous Chemical Inventory System

**NCHLS** is a full-stack system for managing and tracking hazardous chemical inventories across departments and institutes.  
It connects centralized chemical metadata with real-world inventory records and enforces data consistency across the organization.



---

## 🚀 Features

- **Central Substance Registry**  
  Unified database of hazardous substances, including properties and Safety Data Sheets (SDS).

- **Department-Level Inventory Tracking**  
  Track chemical quantities per institute, department, and year.

- **Relational Integrity**  
  Inventory records are linked to the master substance registry to prevent duplication.

- **JWT-Based Authentication**  
  Secure access control for all API endpoints.

- **Docker-First Architecture**  
  Backend, frontend, database, and reverse proxy fully containerized.

- **CI/CD Pipeline**  
  Automatic image build & deployment via GitHub Actions.

---

## 🛠 Tech Stack

### Backend
- Python 3.11
- FastAPI
- MongoDB (PyMongo)
- JWT Authentication
- Pydantic
- MyPy + Ruff (static analysis)

### Frontend
- JavaScript
- React
- Vite

### Infrastructure
- Docker
- Docker Compose
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
    git clone [https://github.com/dominik-farlik/NCHLS.git](https://github.com/dominik-farlik/NCHLS.git)
    cd nchls
    ```

2.  **Set up Environment Variables:**
    Create a `.env` file in the root directory. You can use the template below:
    ```bash
    touch .env
    ```

3.  **Launch the System:**
    ```bash
    docker-compose up -d
    ```

---

## ⚙️ Configuration (.env)

The application requires the following environment variables. Copy these into your `.env` file and modify them for production use:

```env
# MongoDB Connection
MONGO_USER=admin
MONGO_PASSWORD=passwd
MONGO_HOST=mongodb
MONGO_PORT=27017

# MongoDB Root Credentials (for initialization)
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=secret

# Security Settings
JWT_SECRET_KEY=your-super-secret-key-here
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
```

---

## 🚀 Production Deployment

### Production deployment is fully automated via GitHub Actions.

### On push to main:

**1. Backend and frontend images are built.**

**2. Images are pushed to GHCR.**

**3.The server pulls new images.**

**3. Containers are restarted.**

---

### Manual deployment:

```bash
  cd /home/ubuntu/nchls
  docker compose -f docker-compose.prod.yml pull
  docker compose -f docker-compose.prod.yml up -d
 ```

---

## 📸 Screenshots

<img width="1920" height="1080" alt="substances_screen" src="https://github.com/user-attachments/assets/df675bed-5d36-40e7-bda9-113f4b76b318" />

<img width="1920" height="1080" alt="add_substance_screen" src="https://github.com/user-attachments/assets/3e91d28e-86ba-407c-bddb-092515cf9566" />

<img width="1920" height="1080" alt="records_screen" src="https://github.com/user-attachments/assets/073a74df-04ec-4c83-a779-f898c7512052" />

<img width="1920" height="1080" alt="invetory_screen" src="https://github.com/user-attachments/assets/0b468d33-0a29-4ef0-bb84-776585e39e88" />

<img width="1920" height="1080" alt="location_invetory_screen" src="https://github.com/user-attachments/assets/3408008a-f3c8-42c1-a3de-3decb1ca6d24" />

<img width="1920" height="1080" alt="login_screen" src="https://github.com/user-attachments/assets/0ca50a4b-44e4-4a83-9de7-29df6fdbced0" />
