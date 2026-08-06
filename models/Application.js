/*
MIT License

Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
Mindoro State University - Philippines
*/

import { DataTypes } from "sequelize";
import { sequelize } from "./db.js";

export const Application = sequelize.define(
  "Application",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
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
    status: {
      type: DataTypes.ENUM("submitted", "under_review", "shortlisted", "interview", "rejected", "hired"),
      defaultValue: "submitted"
    },
    coverLetter: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: 1, max: 5 }
    },
    hrNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    managerNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    reviewedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "Users",
        key: "id"
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE"
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    interviewDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    declaration: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    timestamps: true,
    underscored: false
  }
);

export default Application;