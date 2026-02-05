# ChemTrack: Hazardous Chemical Inventory System

**ChemTrack** is a specialized management system designed to track and inventory hazardous substances across various institutes and departments. It bridges the gap between static safety data and active inventory management.



---

## 🚀 Key Features

* **Global Substance Database:** Centralized storage for chemical names, properties, and Safety Data Sheets (SDS).
* **Departmental Inventory:** Granular tracking of chemical stock assigned to specific, predefined departments and institutes.
* **Relational Integrity:** Inventory records are directly linked to the master database to prevent data duplication and errors.
* **Docker-First Deployment:** Entire stack can be deployed with a single command.
* **Secure Access:** Built-in JWT-based authentication for data protection.

## 🛠 Tech Stack

* **Backend:** FastAPI (Python)
* **Frontend:** React.js
* **Reverse Proxy:** Nginx
* **Database:** MongoDB
* **Security:** JWT (JSON Web Tokens)
* **Deployment:** Docker & Docker Compose

---

## 📦 Deployment

### Prerequisites
* [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/yourusername/chemtrack.git](https://github.com/yourusername/chemtrack.git)
    cd chemtrack
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

## 📸 Screenshots

<img width="1920" height="1080" alt="substances_screen" src="https://github.com/user-attachments/assets/df675bed-5d36-40e7-bda9-113f4b76b318" />

<img width="1920" height="1080" alt="add_substance_screen" src="https://github.com/user-attachments/assets/3e91d28e-86ba-407c-bddb-092515cf9566" />

<img width="1920" height="1080" alt="records_screen" src="https://github.com/user-attachments/assets/073a74df-04ec-4c83-a779-f898c7512052" />

<img width="1920" height="1080" alt="invetory_screen" src="https://github.com/user-attachments/assets/0b468d33-0a29-4ef0-bb84-776585e39e88" />

<img width="1920" height="1080" alt="location_invetory_screen" src="https://github.com/user-attachments/assets/3408008a-f3c8-42c1-a3de-3decb1ca6d24" />

<img width="1920" height="1080" alt="login_screen" src="https://github.com/user-attachments/assets/0ca50a4b-44e4-4a83-9de7-29df6fdbced0" />
