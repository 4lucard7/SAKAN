# 🏠 SAKAN — Plateforme de Gestion Immobilière & Administrative

[![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MySQL](https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)

**SAKAN** est une application web moderne et robuste conçue pour simplifier la gestion quotidienne des biens, des charges, des dettes et des véhicules. Développée avec une architecture Full-stack (Laravel + React), elle offre une interface intuitive et performante pour un suivi efficace.

---

## 📸 Aperçu


| Dashboard | Gestion des Charges |
| :---: | :---: |
| ![Dashboard Placeholder](https://via.placeholder.com/400x250?text=Dashboard+SAKAN) | ![Charges Placeholder](https://via.placeholder.com/400x250?text=Gestion+des+Charges) |

---

## 🚀 Fonctionnalités Principales

- 📊 **Tableau de Bord Dynamique** : Visualisation des statistiques clés et graphiques de performance (Recharts).
- 👤 **Gestion des Tiers** : Système CRUD complet (interface modale) pour gérer vos contacts et partenaires.
- 💸 **Suivi des Dettes & Créances** : Gestion précise des montants dus et remboursés via un dashboard financier moderne.
- 🚗 **Gestion de Véhicule** : Suivi des informations, historique des maintenances, et système de suivi documentaire par statut.
- 📑 **Charges Fixes** : Automatisation et historique du paiement des charges récurrentes.
- 🔔 **Système de Notifications** : Alertes en temps réel, notifications push et système automatisé en arrière-plan (Task Scheduler).
- 🔐 **Authentification Sécurisée** : Gestion des utilisateurs avec Laravel Sanctum.

---

## 🆕 Dernières Mises à Jour

- **Système de Notifications Automatisé** : Fiabilisation des alertes en temps réel avec un planificateur de tâches en arrière-plan et synchronisation d'état (soft-delete).
- **Dashboard Financier Premium** : Modernisation de l'interface des pages Dettes et Tiers avec des tableaux de données réactifs et des filtres avancés.
- **Module Véhicule Amélioré** : Nouveau composant de sélection de véhicule avec indicateurs visuels de progression pour les documents et aperçus de maintenance.
- **Optimisation de l'UX (CRUD)** : Restauration de l'expérience utilisateur par fenêtres modales pour une gestion plus fluide des entités.

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



## 👤 Auteur(s)

Réalisé avec ❤️ par :
- **Mohamed** - [GitHub](https://github.com/4lucard7)
- **Ayoub** - [GitHub](https://github.com/ayoubalouhmy)

---
<p align="center">Projet SAKAN - 2026</p>
