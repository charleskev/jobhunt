/*
MIT License

Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
Mindoro State University - Philippines
*/

import "dotenv/config";
import { Sequelize } from "sequelize";

const DB_URL = process.env.DATABASE_URL;

if (!DB_URL) {
    console.error(
        "DATABASE_URL is not set. Please configure the Supabase PostgreSQL connection string."
    );
    process.exit(1);
}

export const sequelize = new Sequelize(DB_URL, {
    dialect: "postgres",
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
});

export function getDbInfo() {
    return {
        dbUrlPresent: Boolean(DB_URL),
        dbType: "postgres",
        isVercel: Boolean(process.env.VERCEL || process.env.VERCEL_URL)
    };
}