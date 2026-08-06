
      /*
    MIT License
    
    Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
    Mindoro State University - Philippines

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
    */
    
import { Sequelize } from "sequelize";
import mysql2 from "mysql2";
import path from "path";
import os from "os";
import fs from "fs";

const DB_URL =
  process.env.DATABASE_URL ||
  process.env.MYSQL_URL ||
  process.env.CLEARDB_DATABASE_URL ||
  process.env.JAWSDB_URL;
const DB_NAME = process.env.DB_NAME || process.env.MYSQL_DATABASE;
const DB_USER = process.env.DB_USER || process.env.MYSQL_USER;
const DB_PASS = process.env.DB_PASS || process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || "";
const DB_HOST = process.env.DB_HOST || process.env.MYSQL_HOST;
const DB_PORT = process.env.DB_PORT
  ? Number(process.env.DB_PORT)
  : process.env.MYSQL_PORT
  ? Number(process.env.MYSQL_PORT)
  : 3306;
const DB_TYPE = process.env.DB_TYPE?.toLowerCase();
const isVercel = Boolean(process.env.VERCEL || process.env.VERCEL_URL);
const defaultSqliteDir = isVercel ? os.tmpdir() : path.join(process.cwd(), "data");
const DB_STORAGE = process.env.DB_STORAGE || path.join(defaultSqliteDir, "huntjob.sqlite");
const useSqliteFallback = DB_TYPE === "sqlite" || (isVercel && !DB_URL);

if (isVercel && !DB_URL) {
  console.log("Vercel detected without DATABASE_URL, using SQLite fallback.");
}

if (useSqliteFallback) {
  const sqliteDir = path.dirname(DB_STORAGE);
  if (!fs.existsSync(sqliteDir)) {
    fs.mkdirSync(sqliteDir, { recursive: true });
  }
  console.log(`Using SQLite fallback storage at ${DB_STORAGE}`);
} else if (DB_URL) {
  console.log("Using MySQL from DATABASE_URL");
} else {
  console.log(`Using MySQL host ${DB_HOST || "localhost"}:${DB_PORT}`);
}

export const sequelize = DB_URL
  ? new Sequelize(DB_URL, {
      dialect: "mysql",
      dialectModule: mysql2,
      dialectOptions: {
        supportBigNumbers: true,
        bigNumberStrings: true,
      },
    })
  : useSqliteFallback
  ? new Sequelize({
      dialect: "sqlite",
      storage: DB_STORAGE,
      logging: false,
    })
  : new Sequelize(DB_NAME || "huntjob", DB_USER || "root", DB_PASS, {
      host: DB_HOST || "localhost",
      port: DB_PORT,
      dialect: "mysql",
      dialectModule: mysql2,
      dialectOptions: {
        supportBigNumbers: true,
        bigNumberStrings: true,
      },
    });