# Bevenut

Proyecto Laravel + Inertia + React (Bevenut).

## Requisitos

- PHP 8.2+
- Composer
- Node.js 18+
- Base de datos (MySQL/PostgreSQL/SQLite)

## Instalación

```bash
composer install
cp .env.example .env
php artisan key:generate
npm install
npm run build
php artisan migrate
```

## Desarrollo

```bash
npm run dev
php artisan serve
```
