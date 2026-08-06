
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

const DB_URL = process.env.DATABASE_URL || process.env.MYSQL_URL;
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS || "";
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;
const isVercel = Boolean(process.env.VERCEL || process.env.VERCEL_URL);

function ensureDatabaseConfig() {
  if (DB_URL) {
    return;
  }

  const missing = [];
  if (!DB_NAME) missing.push("DB_NAME");
  if (!DB_USER) missing.push("DB_USER");
  if (!DB_HOST) missing.push("DB_HOST");

  if (missing.length === 0) {
    return;
  }

  const message = `Database connection is not configured. Set DATABASE_URL or set ${missing.join(", ")} and optionally DB_PASS.`;
  if (isVercel) {
    throw new Error(`${message} Vercel cannot connect to a local MySQL instance.`);
  }

  console.warn(`⚠️ ${message} Falling back to local MySQL at localhost:3306 for development only.`);
}

ensureDatabaseConfig();

export const sequelize = DB_URL
  ? new Sequelize(DB_URL, {
      dialect: "mysql",
      dialectModule: mysql2,
      dialectOptions: {
        supportBigNumbers: true,
        bigNumberStrings: true,
      },
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