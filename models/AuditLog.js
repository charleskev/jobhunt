/*
MIT License

Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
Mindoro State University - Philippines
*/

import { DataTypes } from "sequelize";
import { sequelize } from "./db.js";

export const AuditLog = sequelize.define(
  "AuditLog",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "Users",
        key: "id"
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE"
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "LOGIN, JOB_CREATED, APP_SUBMITTED, USER_VERIFIED, etc."
    },
    entityType: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "User, Job, Application"
    },
    entityId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userAgent: {
      type: DataTypes.STRING,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Additional data (reason, old values, etc.)"
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    timestamps: true,
    updatedAt: false
  }
);

export default AuditLog;