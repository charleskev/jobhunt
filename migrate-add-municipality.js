/*
Migration: Add municipality column to Jobs table
*/

import { sequelize } from "./models/db.js";

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log("✓ Database connected");

    const queryInterface = sequelize.getQueryInterface();

    // Check if municipality column already exists
    const columns = await queryInterface.describeTable("Jobs");
    
    if (columns.municipality) {
      console.log("✓ municipality column already exists");
      process.exit(0);
    }

    // Add municipality column
    await queryInterface.addColumn("Jobs", "municipality", {
      type: sequelize.Sequelize.STRING,
      allowNull: true,
      comment: "For HR admin jobs (municipality level)"
    });

    console.log("✓ Successfully added municipality column to Jobs table");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration error:", error.message);
    process.exit(1);
  }
}

migrate();
