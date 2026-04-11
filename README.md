# 🏠 SAKAN — Plateforme de Gestion Immobilière & Administrative

[![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MySQL](https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)

**SAKAN** est une application web moderne et robuste conçue pour simplifier la gestion quotidienne des biens, des charges, des dettes et des véhicules. Développée avec une architecture Full-stack (Laravel + React), elle offre une interface intuitive et performante pour un suivi efficace.

---

## 📸 Aperçu

> [!NOTE]
> *Ajoutez ici des captures d'écran de votre tableau de bord et des fonctionnalités principales.*

| Dashboard | Gestion des Charges |
| :---: | :---: |
| ![Dashboard Placeholder](https://via.placeholder.com/400x250?text=Dashboard+SAKAN) | ![Charges Placeholder](https://via.placeholder.com/400x250?text=Gestion+des+Charges) |

---

## 🚀 Fonctionnalités Principales

- 📊 **Tableau de Bord Dynamique** : Visualisation des statistiques clés et graphiques de performance (Recharts).
- 👤 **Gestion des Tiers** : Système CRUD complet pour gérer vos contacts et partenaires.
- 💸 **Suivi des Dettes & Créances** : Gestion précise des montants dus et remboursés.
- 🚗 **Gestion de Véhicule** : Suivi des informations du véhicule et historique complet des maintenances.
- 📑 **Charges Fixes** : Automatisation et historique du paiement des charges récurrentes.
- 🔔 **Système de Notifications** : Alertes en temps réel pour les échéances et les mises à jour importantes.
- 🔐 **Authentification Sécurisée** : Gestion des utilisateurs avec Laravel Sanctum.

---

## 🛠️ Technologies Utilisées

### Backend
- **Laravel 11** : Framework PHP élégant.
- **Sanctum** : Authentification API légère.
- **MySQL** : Base de données relationnelle.
- **PHPUnit** : Tests automatisés.

### Frontend
- **React 19** : Bibliothèque UI moderne.
- **Vite** : Outil de build ultra-rapide.
- **Tailwind CSS** : Design "Utility-first".
- **Framer Motion** : Animations fluides.
- **Lucide React** : Collection d'icônes premium.
- **Axios** : Clients HTTP pour les appels API.

---

## 📦 Installation

### Prérequis
- [PHP 8.2+](https://www.php.net/downloads)
- [Node.js 18+](https://nodejs.org/)
- [Composer](https://getcomposer.org/)
- [MySQL](https://www.mysql.com/downloads/)

### 1. Cloner le projet
```bash
git clone https://github.com/votre-username/SAKAN.git
cd SAKAN
```

### 2. Configuration du Backend
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```
> [!IMPORTANT]
> Configurez vos accès à la base de données dans le fichier `.env`.

### 3. Configuration du Frontend
```bash
cd ../frontend
npm install
```

---

## ⚙️ Configuration

### Base de données (Backend)
```bash
# Dans le dossier backend
php artisan migrate --seed
```

### Environnement (Frontend)
Créez un fichier `.env` dans le dossier `frontend` :
```env
VITE_API_URL=http://localhost:8000/api
```

---

## ▶️ Lancement du projet

Vous devez lancer deux serveurs séparément :

### Lancer le Backend (API)
```bash
cd backend
php artisan serve
```
Le backend sera disponible sur `http://localhost:8000`.

### Lancer le Frontend
```bash
cd frontend
npm run dev
```
Le frontend sera disponible sur `http://localhost:5173`.

---

## 📡 API Endpoints (Echantillon)

| Méthode | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/login` | Connexion utilisateur | 🔓 |
| `GET` | `/api/dashboard` | Statistiques globales | 🔐 |
| `GET` | `/api/voiture` | Détails du véhicule | 🔐 |
| `GET` | `/api/charges` | Liste des charges | 🔐 |
| `PATCH` | `/api/debts/{id}/rembourser` | Marquer une dette comme payée | 🔐 |

---

## 🗂️ Structure du projet

```text
SAKAN/
├── backend/            # API Laravel
│   ├── app/            # Logique métier (Modèles, Contrôleurs)
│   ├── database/       # Migrations et Seeders
│   └── routes/         # Définition des routes API
├── frontend/           # Application React
│   ├── src/
│   │   ├── components/ # Composants réutilisables
│   │   ├── pages/      # Vues de l'application
│   │   ├── context/    # Gestion d'état (Auth, etc.)
│   │   └── assets/     # Styles et images
└── README.md
```

---

## 📌 Roadmap / Améliorations Futures

- [ ] Exportation de rapports en PDF.
- [ ] Mode sombre (Dark Mode) complet.
- [ ] Support multilingue (FR/EN/AR).
- [ ] Application mobile (React Native).

---

## 🤝 Contribution

1. Forkez le projet.
2. Créez votre branche (`git checkout -b feature/AmazingFeature`).
3. Commit avec un message clair (`git commit -m 'Add some AmazingFeature'`).
4. Push vers la branche (`git push origin feature/AmazingFeature`).
5. Ouvrez une Pull Request.

---

## 📄 Licence

Distribué sous la licence MIT. Voir `LICENSE` pour plus d'informations.

---

## 👤 Auteur(s)

Réalisé avec ❤️ par :
- **Mohamed** - [GitHub](https://github.com/votre-user-mohamed)
- **Ayoub** - [GitHub](https://github.com/votre-user-ayoub)

---
<p align="center">Projet SAKAN - 2026</p>
