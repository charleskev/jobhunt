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

export const Notification = sequelize.define(
  "Notification",
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
    type: {
      type: DataTypes.ENUM("application_status", "new_job", "message", "interview", "reminder", "system"),
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    relatedId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: "ID of related entity (Job, Application, etc.)"
    },
    relatedType: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Type of related entity"
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Additional data in JSON format"
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
    underscored: false,
    indexes: [
      {
        fields: ["userId", "isRead"]
      }
    ]
  }
);

export default Notification;
