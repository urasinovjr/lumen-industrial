# Lumen Industrial — frontend

Учебный проект курса **МФТИ «Веб-разработка»**. Пользовательская часть
интернет-магазина «Lumen Industrial» (завод промышленного освещения) на
React + Redux Toolkit. Часть монорепо: рядом живёт backend из двух
FastAPI-микросервисов (`../backend/products`, `../backend/orders`).

ТЗ и прототипы — в `../../Task 1/`.

## Стек

- **React 19** + **TypeScript 5.9** (strict)
- **Vite 7** (dev-сервер + сборка)
- **react-router-dom 7** (маршрутизация)
- **Redux Toolkit** + **react-redux** — глобальное состояние (`products`, `cart`, `orders`), async-thunks поверх `fetch`
- **CSS Modules** (`*.module.css`) — каждый компонент со своими стилями. Глобально только `styles/tokens.css` (CSS-переменные дизайн-системы) и `styles/reset.css`
- Шрифт **Manrope** (Google Fonts)
- **Playwright** — E2E-тесты пользовательских сценариев

## Данные и backend

- Каталог и категории — сервис `products` (`:3001`): `/api/products`, `/api/categories`.
- Корзина и заказы — сервис `orders` (`:3002`): `/api/cart`, `/api/orders`.
- Аутентификация администратора — сервис `admin` (`:3003`): `/api/admin/login|logout|me` (JWT HS256). Подробнее — в `../README.md`.
- Корзина живёт **на сервере**; сессия идентифицируется заголовком `X-Session-Id`.
  UUID сессии создаётся при первой загрузке и хранится в `localStorage` под
  ключом `lumen.session.v1` (см. `src/shared/api/client.ts`).
- В dev `vite.config.ts → server.proxy` маршрутизирует `/api/*` и `/uploads` на нужный сервис.
- API отдаёт `snake_case`; слой `shared/api/*` маппит ответы в `camelCase`.

## Запуск

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc -b && vite build → dist/
npm run preview    # локальный preview прод-сборки
npm run lint       # ESLint
npm run test:e2e   # Playwright E2E (API мокается, backend не нужен)
```

Backend (для полноценной работы) поднимается отдельно — см. `../backend/*` и
`docker-compose.yml` в корне монорепо.

## Страницы

| Маршрут | Страница | Назначение |
|---|---|---|
| `/catalog` | Каталог | Сетка товаров, фильтры по категориям, поиск, пагинация, промо-баннер |
| `/product/:productId` | Карточка товара | Галерея, характеристики, добавление в корзину |
| `/cart` | Корзина | Список товаров, изменение кол-ва, удаление, сводка с НДС и доставкой |
| `/checkout` | Оформление заказа | Форма (контакты, адрес, способ доставки, способ оплаты), валидация |
| `/confirmation/:orderNumber` | Подтверждение | Номер заказа, итог, адрес доставки, статус |
| `/admin/login` | Вход в панель | Логин администратора, получение JWT |
| `/admin/products` | Управление товарами | Просмотр, добавление, редактирование, удаление (JWT) |
| `/admin/orders` | Управление заказами | Список заказов, смена статуса (JWT) |

`/` редиректит на `/catalog`. Неизвестный покупательский путь — туда же.
Маршруты `/admin/*` защищены: без токена — редирект на `/admin/login`.

## Структура

Feature-Sliced Design (упрощённый):

```
src/
├─ main.tsx               <Provider store> + BrowserRouter
├─ App.tsx                Routes (5 страниц)
├─ app/                   store.ts (configureStore), hooks.ts (useAppDispatch/Selector)
├─ styles/                tokens.css + reset.css
├─ shared/
│  ├─ api/                fetch-обёртка (client.ts) + productsApi / ordersApi
│  └─ ui/                 Button, Input, RadioGroup, QuantityInput, Logo, icons
├─ widgets/               Header, Footer, ProductCard, PromoBanner, Newsletter
├─ entities/              product / cart / order — типы + Redux-слайсы
└─ pages/                 catalog / product / cart / checkout / confirmation
```

## Адаптивность

Поддерживается ширина от 320 px. Брейкпоинты: 1024 / 880 / 720 / 600 / 480.
На 480 px и ниже сетка каталога — одна колонка, поиск в шапке скрывается,
форма checkout — одна колонка.

## Замечания по архитектуре

- Стили компонентов изолированы через CSS Modules — общий `style.css` намеренно не используется (замечание преподавателя на семинаре).
- Глобально подключаются только дизайн-токены (`:root` CSS-переменные) и базовый reset для `html/body/*`.
- Без UI-библиотек: все компоненты в `shared/ui/` написаны вручную.
- Без админки: задание явно ограничивает покупательской частью.
