# ColdChain Sentinel

ColdChain Sentinel is a cold-chain monitoring demo for tracking temperature readings, identifying excursions, and managing alerts for temperature-sensitive products. It combines a Next.js dashboard with MySQL for operational records and MongoDB for sensor readings.

The demo uses a permitted storage range of **2°C to 8°C**. A reading outside that range is recorded as an excursion, assigned a severity and risk score, and can generate an alert for follow-up.

## Features

- Dashboard with product, batch, sensor, and alert summaries.
- Recent temperature readings and status for each sensor.
- Alert management: view alerts, acknowledge them, resolve them, and record inspection decisions.
- Automatic excursion severity and risk scoring.
- A MySQL trigger that creates an alert for a critical excursion.
- Parameterized MySQL queries for database operations.

## Tech stack

- **Next.js 14**, React, and Tailwind CSS for the web application.
- **MySQL** for facilities, storage units, sensors, products, batches, excursions, risks, alerts, and inspections.
- **MongoDB** for timestamped sensor readings.
- **mysql2** and the **MongoDB Node.js driver** for database access.

## Requirements

Install the following before setting up the project:

- Node.js 20.6 or later and npm.
- MySQL 8 or later.
- MongoDB running locally or a MongoDB connection URI.

## Getting started

1. Install the project dependencies:

   ```sh
   npm install
   ```

2. Create your local environment file from the example.

   On Windows PowerShell:

   ```powershell
   Copy-Item .env.example .env.local
   ```

   On macOS or Linux:

   ```sh
   cp .env.example .env.local
   ```

3. Edit `.env.local` with the connection details for your MySQL and MongoDB instances:

   ```dotenv
   MYSQL_HOST=localhost
   MYSQL_USER=root
   MYSQL_PASSWORD=your_password
   MYSQL_DATABASE=coldchain_sentinel
   MONGODB_URI=mongodb://localhost:27017
   MONGODB_DATABASE=coldchain_sentinel
   ```

   Keep `.env.local` private; it is excluded from Git. `.env.example` contains placeholders only.

4. Create and populate the MySQL database.

   On Windows PowerShell:

   ```powershell
   Get-Content database/schema.sql | mysql -u root -p
   Get-Content database/seed.sql | mysql -u root -p
   ```

   On macOS or Linux:

   ```sh
   mysql -u root -p < database/schema.sql
   mysql -u root -p < database/seed.sql
   ```

   **Warning:** `database/schema.sql` starts by dropping and recreating the `coldchain_sentinel` database. Use it only for a fresh local/demo database; it will delete existing data in that database.

5. Seed the MongoDB demo readings:

   ```sh
   node --env-file=.env.local scripts/seed-mongo.mjs
   ```

   The seed script replaces the contents of the `sensor_readings` collection with sample readings.

6. Start the development server:

   ```sh
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser. The alerts page is available at [http://localhost:3000/alerts](http://localhost:3000/alerts).

## How excursion scoring works

The temperature rules are centralized in [`lib/config.ts`](./lib/config.ts):

- Temperatures from **2°C through 8°C**, inclusive, are considered within range.
- Severity is calculated from how many degrees the reading is outside the permitted range:
  - **LOW:** less than 1°C outside the range.
  - **MEDIUM:** at least 1°C and less than 2.5°C outside.
  - **HIGH:** at least 2.5°C and less than 4°C outside.
  - **CRITICAL:** 4°C or more outside.
- Risk score is `distance outside range × 10 + duration in minutes × 0.5`, rounded to an integer and capped from 0 to 100.

When an excursion is recorded, the MySQL `RecordExcursionWithRisk` procedure inserts the excursion and its risk assessment in a transaction. The `create_critical_alert` trigger creates an open alert when the excursion severity is `CRITICAL`.

## API overview

The application exposes these routes:

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/api/dashboard` | Returns summary counts, the configured temperature range, recent sensor data, and active alerts. |
| `GET` | `/api/alerts` | Lists alerts and their batch numbers. |
| `PUT` | `/api/alerts` | Updates an alert status to `OPEN`, `ACKNOWLEDGED`, or `RESOLVED`. |
| `POST` | `/api/inspections` | Records an inspection decision: `CLEARED`, `CONTINUE_QUARANTINE`, or `DISPOSE`. |
| `POST` | `/api/readings` | Saves a sensor reading and, when out of range, records an excursion and risk assessment. |

Example: submit an out-of-range reading for the seeded `TEMP-001` sensor:

```sh
curl -X POST http://localhost:3000/api/readings \
  -H "Content-Type: application/json" \
  -d '{"sensor_code":"TEMP-001","temperature":13,"duration":60}'
```

The optional `duration` is in minutes and defaults to 15. A successful out-of-range reading returns an excursion status and severity. A critical excursion also creates an alert, which can be reviewed at `/alerts`.

## Useful commands

```sh
npm run dev       # Start the development server
npm run build     # Create a production build
npm start         # Run the production server after building
npm run seed:mongo # Replace MongoDB sensor readings with demo data
```

## Project layout

```text
app/                 Next.js pages and API routes
  alerts/            Alert management page
  api/               Dashboard, alerts, inspections, and readings endpoints
database/            MySQL schema, sample data, and example queries
lib/                 Database connections and temperature/risk rules
scripts/             MongoDB demo-data seeder
```

## Notes

- MySQL queries that include user-supplied values use placeholders.
- Database access is performed by server-side API routes; connection credentials belong in `.env.local`, not client-side code.
- The seed data is for demonstration and should not be used as real cold-chain or compliance data.
