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

    /*
     * User associated with the uploaded document.
     * This column exists in the actual database structure.
     */
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