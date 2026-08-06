/*
MIT License

Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
Mindoro State University - Philippines
*/

import { DataTypes } from "sequelize";
import { sequelize } from "./db.js";

export const Document = sequelize.define(
  "Document",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    applicationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Applications",
        key: "id"
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    },
    documentType: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Resume, Diploma, NBI Clearance, etc."
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "File size in bytes"
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    uploadedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    timestamps: false
  }
);

export default Document;