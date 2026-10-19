# Hearth vs Amazon-Free2: сравнение и план подачи на Devpost (19.10.2026)

Анализ сделан только на чтение (git clone публичных репозиториев + cursor-github). В репозитории ничего не пушилось и не менялось. Локальную папку C:\Users\dolma\Documents\amazon-hakaton я не открывал, но README в hearth содержит строку `cd amazon-hakaton`, то есть hearth почти наверняка залит именно из этой папки.

## 1. Сравнение репозиториев

| Критерий | SERGIOCORVALIS/hearth | SERGIOCORVALIS/Amazon-Free2 |
| --- | --- | --- |
| Что это | Монорепо: MCP сервер "Hearth Family Concierge" + симулятор Echo Show (React) + агент Bedrock/offline + OSS стартер | Шаблон Google AI Studio "NovaHub": Express + React дашборд, симуляторы Ring / Fire TV / Bee |
| Видимость | Публичный | Публичный (клонируется без авторизации) |
| Коммиты | 1 (`8d6d2f7`) | 1 (`d8eaebd`) |
| Запускается? | Да. `npm ci` ок; `npm test` на чистом клоне падает (3 файла), пока не собран `@hearth/shared`; после `npm run build -w @hearth/shared` 32/32 + 38/38 тестов зеленые | `npm install` падает с ERESOLVE (vite 8 vs esbuild у tsx), нужен `--legacy-peer-deps`. Тесты на `node:test` с импортом .ts, на Node 20 не запускаются |
| Настоящий MCP Streamable HTTP | Да: официальный `@modelcontextprotocol/sdk`, `StreamableHTTPServerTransport`, единый `/mcp` (POST/GET/DELETE), сессии с TTL, rate limit, API key, заготовка OAuth PRM + PKCE | Нет: самописный JSON-RPC на `/api/mcp/messages` + отдельный `/api/mcp/sse` (стиль устаревшего HTTP+SSE), нет `initialize`, нет `Mcp-Session-Id`. Alexa+ к нему не подключится без переделки |
| Инструменты | 9 tools (zod схемы), 6 resources, 2 prompts | 7 tools, вся логика имитация; "reasoning" это if/else по ключевым словам |
| Bedrock (AWS Builder) | Реальный `@aws-sdk/client-bedrock-runtime` ConverseCommand с tool use, fallback на offline агент, CloudWatch Logs (по умолчанию dry-run, live при `HEARTH_LIVE_AWS=1`) | AWS SDK нет вообще. "Bedrock" только надписи в UI и фейковые трейсы; в зависимостях `@google/genai` (не используется). Для AWS Builder не годится |
| Тесты | vitest в mcp-server и simulator (в т.ч. smoke тест Streamable HTTP), Playwright e2e | 2 файла, 8 тестов, на Node 20 не стартуют |
| LICENSE | MIT (корень + OSS стартер) | Нет |
| README | Есть, подробный. Мелочи: `cd amazon-hakaton` вместо `cd hearth`; таблица перечисляет 6 из 9 tools (нет `list_households`, `set_active_household`, `get_plan_visual`); упоминается CI `.github/workflows/ci.yml`, которого в репо нет; команды Windows (`set`, PowerShell) | Нет README |
| Документы для Devpost | FEEDBACK.md, BUG_JOURNAL.md (friction log), DEVPOST_PASTE.md, DEMO_SCRIPT, VOICEOVER, AWS_BUILDER, OSS_MINI, alexa-addon манифест + иконки + privacy/terms | Нет. Есть мусор `.aistudio/artifacts/...` (~30 PNG скриншотов) |
| Секреты в коде | Не найдено (только фиктивные `AKIAEXAMPLE` в тестах, `.env` в .gitignore) | Не найдено (`.env*` в .gitignore, в `.env.example` плейсхолдеры) |

**Сильные стороны hearth:** реальный и проверяемый MCP сервер по спецификации, работает офлайн одной командой (`npm run demo`), реальный путь к Bedrock, тесты, MIT, готовые тексты фидбэка и friction log, отдельный OSS стартер (уже опубликован как SERGIOCORVALIS/streamable-http-mcp-starter).
**Слабые стороны hearth:** нужно поправить README (имя папки, полный список tools, CI, порядок сборки shared перед `npm test`); 1 коммит "одним куском" (судьи могут спросить про работу в период хакатона); живой Bedrock не включен по умолчанию, для AWS Builder нужен реальный прогон и запись в видео.

**Сильные стороны Amazon-Free2:** эффектный UI, много экранов.
**Слабые стороны Amazon-Free2:** не MCP по Streamable HTTP, нет AWS, нет LICENSE и README, проблемы с установкой, это шаблон AI Studio (Gemini).

**Рекомендация: подавать `SERGIOCORVALIS/hearth`.** Amazon-Free2 не подавать (или максимум взять из него идеи UI). Перед подачей в hearth: исправить README (см. выше), по желанию добавить `prebuild`/`pretest` сборку shared.

## 2. Какой репо "Amazon без README"

Без README только **Amazon-Free2**, значит это он. Но важно: ни в одном из двух репо нет семейного сценария с чеками и профиля Сергея (поиск по "Sergey/Сергей/receipt/чек" дал 0 совпадений). В hearth семьи Rivera, Park, Okonkwo; в Amazon-Free2 сценарии курьер/спорт/пульс/замок. Вероятно, проект с чеками и Сергеем лежит в другом репозитории или ещё не запушен. README ниже написан строго по реальному коду Amazon-Free2, без выдуманных инструментов.

Файл: /workspace/reports/README-Amazon-Free2.md (полный текст ниже).

    # NovaHub: Alexa+ MCP & Ambient Smart Living Simulator
    
    > An Alexa+ style concierge demo that coordinates a simulated Ring doorbell and smart lock, a Fire TV, a Bee wearable and ambient scenes through a JSON-RPC 2.0 MCP-style tool server, with a React dashboard that visualizes every tool call.
    
    Built for the Amazon Developer Hackathon (Alexa+ track).
    
    ## Features
    
    - **7 MCP tools** (`tools/list`, `tools/call`, `ping`) served over HTTP JSON-RPC 2.0, with an SSE stream that broadcasts `notifications/resources/updated` after each tool call.
    - **Simulated device ecosystem** held in server memory: Ring doorbell + lock, Fire TV playback, Bee wearable vitals.
    - **Rule-based "Alexa+ reasoning" endpoint** (`POST /api/alexa/reason`) that maps an utterance (door/courier, sports, vitals, lock) to a chain of tool calls and returns a spoken reply plus an AWS-Bedrock-style execution trace.
    - **React 19 + Vite + Tailwind UI**: Alexa assistant, Ring, Fire TV and Bee simulators, MCP inspector, Bedrock trace visualizer, auto demo director.
    
    ## Architecture
    
    ```
    Browser (React UI, src/)
       -> Express server (server.ts, port 3000)
            /api/alexa/reason      keyword router -> executeMcpToolCall()
            /api/mcp/messages      JSON-RPC 2.0: tools/list, tools/call, ping
            /api/mcp/sse           SSE notifications
            /api/devices/state     in-memory device state
       -> src/lib/mcp.ts           tool definitions + simulated execution
    ```
    
    In development, Vite runs as Express middleware; in production (`NODE_ENV=production`) Express serves `dist/`.
    
    ## Quick start
    
    Prerequisites: Node.js 22+ and npm.
    
    ```bash
    git clone https://github.com/SERGIOCORVALIS/Amazon-Free2.git
    cd Amazon-Free2
    npm install --legacy-peer-deps   # plain `npm install` currently fails with an ERESOLVE peer conflict (vite 8 / esbuild)
    npm run dev                      # tsx server.ts -> http://localhost:3000
    ```
    
    Production build:
    
    ```bash
    npm run build                    # vite build -> dist/
    NODE_ENV=production npm start    # tsx server.ts serving dist/
    ```
    
    Type check: `npm run lint` (runs `tsc --noEmit`).
    
    Unit tests use the Node built-in test runner:
    
    ```bash
    node --test src/lib/mcp.test.ts src/lib/soundEffects.test.ts   # requires a Node version with TypeScript type stripping (22.6+ with --experimental-strip-types, or 23.6+)
    ```
    
    ### Try it
    
    ```bash
    curl -s localhost:3000/api/mcp/messages -H 'content-type: application/json' \
      -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
    
    curl -s localhost:3000/api/alexa/reason -H 'content-type: application/json' \
      -d '{"prompt":"Who is at the door? Unlock the porch and show it on the TV"}'
    ```
    
    ## MCP tools
    
    | Tool | What it does (simulated) |
    | --- | --- |
    | `ring_stream_doorbell_vision` | Inspects the Ring doorbell feed: person/package detection and camera metadata (`cameraLocation`, `nightVision`, `requireObjectDetection`). |
    | `ring_dispatch_access_code` | Generates a temporary 6-digit access code for a courier or guest, optionally auto-unlocking the deadbolt. |
    | `ring_control_smart_lock` | Locks or unlocks the entrance deadbolt. |
    | `firetv_sync_playback_context` | Controls Fire TV playback or routes the doorbell feed / sports stats to the TV (picture-in-picture). |
    | `bee_wearable_vitals_telemetry` | Returns simulated wearable signals: heart rate, stress, activity, notes. |
    | `bedrock_analyze_multimodal_scene` | Returns a simulated Bedrock-style scene analysis of the camera feed (no AWS call is made). |
    | `ambient_scene_controller` | Sets a lighting / soundscape scene preset and brightness. |
    
    ## HTTP endpoints
    
    | Method | Path | Purpose |
    | --- | --- | --- |
    | GET | `/api/health` | Status and connected SSE client count |
    | GET | `/api/mcp/info` | Server info and capabilities |
    | GET | `/api/mcp/tools` | Tool list |
    | GET | `/api/mcp/sse` | SSE stream (endpoint event + notifications) |
    | POST | `/api/mcp/messages` | JSON-RPC 2.0 (`tools/list`, `tools/call`, `ping`) |
    | GET | `/api/devices/state` | Current simulated device state |
    | POST | `/api/devices/reset` | Reset device state |
    | POST | `/api/alexa/reason` | Utterance -> tool chain -> spoken reply + trace |
    
    ## Environment variables
    
    | Variable | Default | Notes |
    | --- | --- | --- |
    | `PORT` | `3000` | HTTP port |
    | `NODE_ENV` | (unset) | `production` serves the built `dist/` |
    | `DISABLE_HMR` | (unset) | `true` disables Vite HMR / file watching |
    | `GEMINI_API_KEY`, `APP_URL` | placeholders in `.env.example` | Declared by the AI Studio template; not used by the current server code |
    
    ## Connecting to Alexa+ (notes and limitations)
    
    Alexa+ add-ons talk to an MCP server over **Streamable HTTP** (spec 2025-11-25): a single endpoint handling `initialize`, `Mcp-Session-Id`, POST/GET. This project currently exposes a custom JSON-RPC endpoint plus a separate SSE channel (closer to the legacy HTTP+SSE pattern) and does **not** implement `initialize`. To connect a real Alexa+ add-on you would need to wrap `REGISTERED_TOOLS` / `executeMcpToolCall` with the official `@modelcontextprotocol/sdk` `StreamableHTTPServerTransport`, expose it over HTTPS (for example with a tunnel) and follow the Alexa+ MCP toolkit quickstart.
    
    All device behaviour and the Bedrock analysis are simulated; no Amazon or AWS APIs are called.
    
    ## License
    
    No license file is included yet. Add one (for example MIT) before publishing the repository as open source.

## 3. Пошаговая подача на Devpost (Alexa+ и AWS Builder)

Черновик: https://devpost.com/submit-to/30992-build-ship-shape-amazon-developer-hackathon/manage/submissions/1240732/edit (сейчас "Untitled"). Дедлайн: пятница 23.10.2026, 22:00 по Хельсинки (UTC+3). Лучше отправить до четверга вечера.

1. **Подготовка репо hearth.** Поправить README (`cd hearth`, все 9 tools, убрать упоминание CI или добавить workflow, шаг `npm run build -w @hearth/shared` перед `npm test`). Репо уже публичный и с MIT, этого достаточно: коллабораторов добавлять не обязательно. Если решите сделать его приватным, то в момент отправки добавить 6 коллабораторов: GitHub > Settings > Collaborators > Add people: `chris-trag`, `knmeiss`, `giolaq`, `anishamalde`, `mosesroth`, `emersonsklar` (или `npm run collab:invite`). Приглашения живут 7 дней.
2. **Видео.** До 3 минут, на английском, публично на YouTube или Vimeo (не "по ссылке" с ограничениями, а Public). Сценарий: docs/DEMO_SCRIPT.md, текст озвучки docs/demo-assets/VOICEOVER_EN.txt. Показать: `npm run demo`, вызовы MCP tools в UI, `/health`, по возможности подключение через туннель к Alexa+, и для AWS Builder отдельный фрагмент с живым Bedrock (`HEARTH_LIVE_AWS=1`, `npm run proof:bedrock`).
3. **Project name:** `Hearth: Alexa+ Family Concierge`
4. **Tagline:** `Alexa+ that plans the whole family evening (kids, captions, an elder care check-in) through a real Streamable HTTP MCP server.`
5. **Description (английский):** взять docs/DEVPOST_DESCRIPTION.md и docs/DEVPOST_PASTE.md; структура Inspiration / What it does / How we built it / Challenges / Accomplishments / What we learned / What's next. Убедиться, что список tools совпадает с кодом (9 tools, 6 resources, 2 prompts).
6. **Built with:** Model Context Protocol, Streamable HTTP, Alexa+, Amazon Bedrock, AWS CloudWatch, TypeScript, Node.js, Express, React, Vite, Zod, Vitest, Playwright.
7. **Tracks / prizes:** основной Alexa+; мини-приз AWS Builder (Bedrock). Open Source можно отметить, если форма позволяет, но обычно выигрывается только один мини-приз; AWS Builder сильнее подкреплён кодом.
8. **Repository URL:** https://github.com/SERGIOCORVALIS/hearth
9. **Video URL:** ссылка на публичное видео YouTube/Vimeo.
10. **Feedback по инструментам (обязательно):** по каждому использованному инструменту (Alexa+ MCP toolkit / `alexa-ai` CLI, MCP SDK, Amazon Bedrock, CloudWatch) что понравилось, что мешало, что улучшить. Источник: docs/FEEDBACK.md и docs/FEATURE_REQUESTS.md.
11. **Friction log (до +10%):** конкретные шаги с ошибками, временем и обходами. Источник: docs/BUG_JOURNAL.md. Чем конкретнее (команда, сообщение об ошибке, сколько минут потеряно), тем выше балл.
12. **Pre-existing project:** "No, built during the hackathon".
13. **Скриншоты/галерея:** docs/demo-assets/frames/*.png, docs/video-assets/*.jpg.
14. **Команда и резиденция.** Россия в списке исключённых стран. Подающий (Сергей) должен быть реальным резидентом допустимой страны (например, Казахстан) и указать честные данные: при выигрыше проверяют документы и налоговые формы. Не указывать страну, в которой он фактически не проживает. Если подаёт другой участник команды, он тоже должен соответствовать правилам.
15. **Финальная проверка и Submit.** Пройти docs/SUBMISSION_CHECKLIST.md, `npm run sanity`, открыть репо и видео в инкогнито, затем нажать Submit. После отправки можно редактировать до дедлайна.

## Итог

Подавать hearth. Amazon-Free2 это шаблон AI Studio без настоящего MCP, AWS, лицензии и README. Проекта "с чеками и профилем Сергея" нет ни в одном из двух репозиториев.
