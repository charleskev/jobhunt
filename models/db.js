
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

const DB_URL = process.env.DATABASE_URL || process.env.MYSQL_URL;
const isServerless = Boolean(
  process.env.VERCEL ||
  process.env.VERCEL_URL ||
  process.env.LAMBDA_TASK_ROOT ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.NOW_REGION ||
  process.env.K_SERVICE
);
const DB_NAME = process.env.DB_NAME || "huntjob";
const DB_USER = process.env.DB_USER || "root";
const DB_PASS = process.env.DB_PASS || "";
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;
const SQLITE_PATH = process.env.DB_STORAGE || path.join(isServerless ? os.tmpdir() : process.cwd(), "data", "huntjob.sqlite");

if (!DB_URL && !process.env.DB_HOST && !process.env.DB_NAME && isServerless) {
  const sqliteDir = path.dirname(SQLITE_PATH);
  if (!fs.existsSync(sqliteDir)) {
    fs.mkdirSync(sqliteDir, { recursive: true });
  }
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
  : process.env.DB_STORAGE || process.env.DB_TYPE === "sqlite" || isServerless
  ? new Sequelize({
      dialect: "sqlite",
      storage: SQLITE_PATH,
    })
  : new Sequelize(DB_NAME, DB_USER, DB_PASS, {
      host: DB_HOST,
      port: DB_PORT,
      dialect: "mysql",
      dialectModule: mysql2,
      dialectOptions: {
        supportBigNumbers: true,
        bigNumberStrings: true,
      },
    });