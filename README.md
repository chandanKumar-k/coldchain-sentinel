# ColdChain Sentinel
MySQL (9 structured tables) + MongoDB (`sensor_readings`) + Next.js/Tailwind.
## Setup
```
npm install
cp .env.example .env.local        # fill in credentials
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
node --env-file=.env.local scripts/seed-mongo.mjs
npm run dev                       # http://localhost:3000
```
## Logic (lib/config.ts)
Range 2-8°C. Severity by distance outside range: <1 LOW, 1-2.5 MEDIUM, 2.5-4 HIGH, >=4 CRITICAL. Risk = distance*10 + minutes*0.5 (cap 100).
CRITICAL excursions fire trigger `create_critical_alert`. Excursion+risk are inserted atomically by procedure `RecordExcursionWithRisk` (transaction).
## Demo
`curl -X POST localhost:3000/api/readings -H "Content-Type: application/json" -d '{"sensor_code":"TEMP-001","temperature":13,"duration":60}'` -> excursion (CRITICAL) -> risk -> alert -> open /alerts to inspect.
SQL injection: all queries use `?` placeholders (mysql2 `execute`); DB access is server-side only.
