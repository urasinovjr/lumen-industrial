# Lumen Industrial

Интернет-магазин промышленного освещения. Учебная работа по курсу МФТИ «Веб-разработка».

Состоит из фронтенда (React + Redux) и трёх бэкенд-сервисов на FastAPI: товары,
заказы и панель управления. У каждого сервиса своя база PostgreSQL. Вход в
админ-панель работает по JWT.

## Сервисы

| Сервис | Папка | Порт | База |
|---|---|---|---|
| Фронтенд (React + Redux) | `frontend` | 5173 | — |
| Товары | `backend/products` | 3001 | `lumen_products` (5436) |
| Заказы | `backend/orders` | 3002 | `lumen_orders` (5437) |
| Панель управления | `backend/admin` | 3003 | `lumen_admin` (5438) |

Контракты API — в Postman-коллекциях `../Task 1/ТЗ_Интернет_магазин/API_*.json`,
прототипы экранов — в `../Task 1/ТЗ_Интернет_магазин/Страницы/`.

## Запуск в Docker

Нужен установленный Docker. Из папки `lumen-industrial`:

```bash
docker compose up --build
```

Поднимаются три базы, три сервиса и фронтенд. Бэкенды при старте сами накатывают
миграции и заполняют базы тестовыми данными. Фронтенд собирается и отдаётся через
nginx; он же проксирует запросы `/api/*` к нужному сервису.

После старта:

- магазин — http://localhost:5173/
- панель управления — http://localhost:5173/admin/login, логин `admin`, пароль `password123`

Бэкенды слушают и снаружи (`localhost:3001`, `:3002`, `:3003`) — это удобно для
Postman и вкладки Network.

Остановить — `docker compose down`. Базы лежат в томах и переживают перезапуск.

## Запуск без Docker

Вариант для разработки. Базы всё равно проще держать в Docker:

```bash
docker compose up -d products-postgres orders-postgres admin-postgres
```

Дальше каждый сервис запускается в своём терминале.

```bash
# Товары (:3001)
cd backend/products
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/alembic upgrade head
.venv/bin/python seed.py
.venv/bin/uvicorn app.main:app --port 3001 --reload

# Заказы (:3002)
cd backend/orders
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/alembic upgrade head
.venv/bin/uvicorn app.main:app --port 3002 --reload

# Панель управления (:3003)
cd backend/admin
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/alembic upgrade head
.venv/bin/python seed.py
.venv/bin/uvicorn app.main:app --port 3003 --reload

# Фронтенд (:5173)
cd frontend
npm install
npm run dev
```

## Тестовые данные

- Товары: 20 ламп в пяти категориях — LED, галогенные, энергосберегающие, филаментные
  и умные. Заполняются скриптом `backend/products/seed.py`.
- Картинок-файлов в репозитории нет: у товаров пустой `image_url`, и фронтенд рисует
  SVG-заглушку по категории из `frontend/public/products/`.
- Администратор: `admin` / `password123`, создаётся скриптом `backend/admin/seed.py`.

Скрипты сидов идемпотентны — повторный запуск не создаёт дубликаты.

## Авторизация (JWT)

- `POST /api/admin/login` возвращает JWT (HS256, срок жизни 24 часа).
- Токен подписан секретом `JWT_SECRET`. Тот же секрет читают сервисы товаров и
  заказов и проверяют токен у себя, не обращаясь к admin.
- Под токеном работают изменения товаров (создание, правка, удаление, загрузка
  картинки) и админские операции с заказами (список, смена статуса). Каталог и
  корзина доступны без токена.
- Фронтенд хранит токен в `localStorage` (ключ `lumen.admin.token.v1`) и передаёт
  его в заголовке `Authorization: Bearer`.

Секрет по умолчанию (`lumen-dev-jwt-secret-change-me`) задан в `.env` каждого сервиса
и должен совпадать у всех трёх.

## Тесты

```bash
# Бэкенд — из папки сервиса
.venv/bin/python -m pytest        # products, orders, admin

# Фронтенд (E2E, API мокается)
cd frontend && npm run test:e2e
```

## Демонстрация

Открыть DevTools, вкладку Network (включить Preserve log и фильтр Fetch/XHR) и пройти
сценарий:

1. Вход: `/admin/login`, `admin` / `password123`. В Network виден `POST /api/admin/login`
   с токеном в ответе. Дальше во всех запросах идёт заголовок `Authorization: Bearer`.
2. Товары: добавить, изменить, удалить — запросы `POST`, `PUT`, `DELETE /api/products`.
3. Заказы: открыть список, сменить статус — `PATCH /api/orders/{id}/status`.
4. Выход: `POST /api/admin/logout`, после него доступ к `/admin/*` закрыт.

Проверить защиту без токена (ожидается `401`):

```bash
curl -i -X POST http://localhost:3001/api/products -H 'Content-Type: application/json' -d '{}'
curl -i http://localhost:3002/api/orders
```
