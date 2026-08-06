/*
MIT License

Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
Mindoro State University - Philippines
*/

import { DataTypes } from "sequelize";
import { sequelize } from "./db.js";

export const SavedJob = sequelize.define(
  "SavedJob",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Users",
        key: "id"
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    },
    jobId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Jobs",
        key: "id"
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    },
    savedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    timestamps: false
  }
);

export default SavedJob;