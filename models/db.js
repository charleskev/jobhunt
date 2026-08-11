/*
MIT License

Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
Mindoro State University - Philippines
*/

import "dotenv/config";
import fs from "fs";
import os from "os";
import path from "path";
import { createRequire } from "module";
import { Sequelize } from "sequelize";
import { fileURLToPath } from "url";
import { dirname } from "path";

const require = createRequire(import.meta.url);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_URL =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.SUPABASE_URL ||
    process.env.DB_URL;

const isVercel = Boolean(
    process.env.VERCEL ||
    process.env.VERCEL_URL ||
    process.env.LAMBDA_TASK_ROOT ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.K_SERVICE
);

let sequelize;
let dbType = "postgres";
let dbUrlPresent = Boolean(DB_URL);

const usePostgres = Boolean(DB_URL) && (() => {
    try {
        require("pg");
        return true;
    } catch {
        return false;
    }
})();

if (usePostgres) {
    sequelize = new Sequelize(DB_URL, {
        dialect: "postgres",
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    });
} else {
    dbType = "sqlite";
    const storagePath =
        process.env.DB_STORAGE_PATH ||
        (isVercel
            ? path.join(os.tmpdir(), "huntjob.sqlite")
            : path.join(__dirname, "..", "data", "huntjob.sqlite"));

    fs.mkdirSync(path.dirname(storagePath), { recursive: true });

    sequelize = new Sequelize({
        dialect: "sqlite",
        storage: storagePath,
        logging: false
    });

    console.warn(
        `No usable database driver available. Falling back to SQLite at ${storagePath}.`
    );
}

export { sequelize };

export function getDbInfo() {
    return {
        dbUrlPresent,
        dbType,
        isVercel
    };
}