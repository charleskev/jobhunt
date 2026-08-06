/*
MIT License

Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
Mindoro State University - Philippines
*/

import { DataTypes } from "sequelize";
import { sequelize } from "./db.js";

export const Job = sequelize.define(
  "Job",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    department: {
      type: DataTypes.STRING,
      allowNull: false
    },
    municipality: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "For HR admin jobs (municipality level)"
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    requirements: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "JSON string or comma-separated"
    },
    salaryRange: {
      type: DataTypes.STRING,
      allowNull: true
    },
    employmentType: {
      type: DataTypes.ENUM("Full-time", "Part-time", "Contract", "Casual"),
      defaultValue: "Full-time"
    },
    positions: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM("open", "closed", "filled"),
      defaultValue: "open"
    },
    requiredDocuments: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'JSON array: ["Resume", "Diploma", "NBI Clearance"]'
    },
    postedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Users",
        key: "id"
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
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

export default Job;