# Desplegar Bevenut en Hostinger (automático con GitHub)

Cuando hagas **push a la rama `main`** en GitHub, la web se construye y se sube sola a Hostinger. No tienes que subir archivos a mano.

---

## 1. Preparar Hostinger

### 1.1 Datos de FTP

1. Entra en **hPanel** (panel de Hostinger).
2. Ve a **Archivos** → **Administrador de archivos** o **FTP**.
3. Anota:
   - **Servidor FTP** (ej: `ftp.tudominio.com` o la IP que te den).
   - **Usuario** (tu usuario FTP).
   - **Contraseña** (la de FTP; si no la recuerdas, restablecela en Hostinger).
   - **Puerto**: normalmente `21` (FTP) o `990` (FTPS). En la ayuda de Hostinger suele indicarse.

### 1.2 Carpeta donde se sube el proyecto

- Por defecto la raíz del sitio suele ser **`public_html`**.
- Sube el proyecto a la raíz de tu sitio (por ejemplo todo dentro de `public_html`).
- En Hostinger, el **document root** debe apuntar a la **carpeta `public`** de Laravel:
  - En hPanel: **Dominios** → tu dominio → **Configuración del dominio** / **Document root**.
  - Pon algo como: `public_html/public` (si subes el repo a `public_html`).

Si usas subcarpeta (ej: `public_html/bevenut`), entonces document root: `public_html/bevenut/public`.

### 1.3 Archivo `.env` en el servidor (solo la primera vez)

1. En el servidor, dentro de la carpeta del proyecto (donde está `artisan`), crea o edita **`.env`**.
2. Copia el contenido de tu `.env.example` y rellena:
   - `APP_ENV=production`
   - `APP_DEBUG=false`
   - `APP_URL=https://tudominio.com`
   - Base de datos, correo, etc.
3. Genera la clave de Laravel en el servidor (por SSH o “Terminal” de Hostinger si lo tiene):
   ```bash
   php artisan key:generate
   ```
   O pon a mano en `.env`: `APP_KEY=base64:...` (generada en local con `php artisan key:generate` y copiada).

### 1.4 Base de datos

- Crea la base de datos y el usuario desde **Bases de datos MySQL** en hPanel.
- En `.env` del servidor pon:
  - `DB_DATABASE=...`
  - `DB_USERNAME=...`
  - `DB_PASSWORD=...`
  - `DB_HOST=...` (suele ser `localhost`).

La primera vez (o cuando cambies migraciones), ejecuta **en el servidor** (no desde tu PC):

```bash
php artisan migrate --force
```

Hazlo por **SSH** o por la **Terminal** de hPanel (Hostinger → Avanzado → Terminal), entrando en la carpeta del proyecto. Desde tu ordenador no funciona: Hostinger suele bloquear conexiones MySQL externas, por eso las migraciones tienen que ejecutarse dentro del propio servidor.

---

## 2. Configurar GitHub para que suba solo

### 2.1 Secrets del repositorio

1. En GitHub: tu repo **bevenut** → **Settings** → **Secrets and variables** → **Actions**.
2. Pulsa **New repository secret** y crea estos (uno por uno):

| Nombre            | Valor                          | Ejemplo                    |
|-------------------|---------------------------------|----------------------------|
| `FTP_SERVER`      | Servidor FTP de Hostinger       | `ftp.tudominio.com`        |
| `FTP_USERNAME`    | Usuario FTP                     | `u123456789`               |
| `FTP_PASSWORD`    | Contraseña FTP                  | tu contraseña              |
| `FTP_SERVER_DIR`  | Carpeta remota (con `/` al final) | `public_html/`          |

Opcionales (solo si Hostinger te dice otro protocolo/puerto):

| Nombre          | Valor   | Cuándo                          |
|-----------------|--------|----------------------------------|
| `FTP_PROTOCOL`  | `ftps` | Si usas FTPS en lugar de FTP     |
| `FTP_PORT`      | `990`  | Si el puerto no es 21            |

No compartas estos valores en el repo ni en capturas.

### 2.2 Comprobar el workflow

- El flujo está en: **`.github/workflows/deploy-hostinger.yml`**
- Se ejecuta en cada **push a `main`**.
- Hace: instalar dependencias (Composer + npm), construir assets (`npm run build`) y subir por FTP todo **excepto** `.git`, `.github`, `node_modules`, `.env` y tests.

---

## 3. Flujo de trabajo día a día

1. Trabajas en tu PC (o en otra rama).
2. Cuando quieras actualizar la web en internet:
   - Haces commit de tus cambios.
   - Haces **push a `main`**:
     ```bash
     git push origin main
     ```
3. En GitHub: **Actions** → pestaña del workflow **Deploy to Hostinger**. En unos minutos debería terminar en verde.
4. La web en Hostinger queda actualizada (código + assets construidos). No subes nada a mano.

---

## 4. Si Hostinger ofrece “Git” en el panel

Algunos planes tienen **Git** en hPanel:

1. En Hostinger: **Git** o **Despliegue** → conectar repositorio (tu repo de GitHub).
2. Si hay **Auto-Deploy** o **Webhook**, activa la opción y usa la URL que te den.
3. En GitHub: **Settings** → **Webhooks** → **Add webhook**:
   - URL: la que te dio Hostinger.
   - Content type: `application/x-www-form-urlencoded`.
   - Event: **Just the push event**.

En ese caso, cada push a `main` puede hacer que Hostinger haga un `git pull`. Ahí normalmente tendrías que configurar en el servidor un script que después del pull ejecute `composer install`, `npm run build`, etc. Si no tienes SSH o “Ejecutar script”, el método con **GitHub Actions + FTP** (este documento) suele ser más sencillo: tú no tocas el servidor, solo pusheas a GitHub.

---

## 5. Resumen

- **Subir la web “a cada rato”**: ya no hace falta; con **un push a `main`** se despliega solo.
- **Hostinger**: FTP (o FTPS), document root en `public`, `.env` y base de datos configurados una vez.
- **GitHub**: secrets `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`, `FTP_SERVER_DIR` (y opcionalmente `FTP_PROTOCOL`, `FTP_PORT`).

Si algo falla, revisa el log del workflow en **Actions** y la carpeta/puerto/protocolo en Hostinger.
