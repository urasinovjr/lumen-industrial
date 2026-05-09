# Lumen Industrial — frontend

Учебный проект курса **МФТИ «Веб-разработка»**, Задание 3.
Пользовательская часть интернет-магазина «Lumen Industrial» (завод промышленного освещения) на React + React Router DOM.

ТЗ и прототипы — в `Task 1/`. Backend (для справки, в этом задании не используется) — в `Task 2/lumen-products` и `Task 2/lumen-orders`.

## Стек

- **React 19** + **TypeScript 5.9** (strict)
- **Vite 7** (dev-сервер + сборка)
- **react-router-dom 7** (маршрутизация)
- **CSS Modules** (`*.module.css`) — каждый компонент со своими стилями. Глобально только `tokens.css` (CSS-переменные дизайн-системы) и `reset.css`.
- Mock-данные (без backend), корзина живёт в `localStorage` под ключом `lumen.cart.v1`.

## Запуск

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # локальный preview прод-сборки
npm run lint     # ESLint
```

## Страницы

| Маршрут | Страница | Назначение |
|---|---|---|
| `/catalog` | Каталог | Сетка из 20 товаров, фильтры по 5 категориям, поиск, пагинация, промо-баннер |
| `/product/:productId` | Карточка товара | Галерея, характеристики, добавление в корзину, рекомендации |
| `/cart` | Корзина | Список товаров, изменение кол-ва, удаление, сводка с НДС и доставкой |
| `/checkout` | Оформление заказа | Форма (контакты, адрес, способ доставки, способ оплаты), валидация |
| `/confirmation/:orderNumber` | Подтверждение | Номер заказа, итог, адрес доставки, статус |

`/` редиректит на `/catalog`. Любой неизвестный путь — туда же.

## Структура

```
src/
├─ main.tsx               BrowserRouter + CartProvider
├─ App.tsx                Routes
├─ styles/                tokens.css + reset.css
├─ shared/ui/             Button, Input, Textarea, RadioGroup, QuantityInput, Logo, Badge
├─ widgets/               Header, Footer, ProductCard, PromoBanner, Newsletter
├─ entities/
│  ├─ product/            типы + 20 mock-товаров + 5 категорий
│  ├─ cart/               CartContext + useCart (localStorage persist)
│  └─ order/              типы + utils (formatPrice, generateOrderNumber)
└─ pages/                 catalog / product / cart / checkout / confirmation
```

## Адаптивность

Поддерживается ширина от 320 px. Брейкпоинты: 480 / 720 / 880 / 1024 px.
Шапка превращается в гамбургер-меню на ширинах < 880 px.

## Замечания по архитектуре

- Стили компонентов изолированы через CSS Modules — общий `style.css` намеренно не используется (комментарий преподавателя на семинаре).
- Глобально подключаются только дизайн-токены (`:root` CSS-переменные) и базовый reset для `html/body/*` — это конвенция, а не общий стиль для классов компонентов.
- Без state-менеджеров: для корзины достаточно `Context + useState`.
- Без UI-библиотек: все компоненты в `shared/ui/` написаны вручную.
- Без админки: задание явно запрещает реализацию админ-части.
