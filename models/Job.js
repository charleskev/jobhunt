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
      type: DataTypes.ENUM(
        "Full-time",
        "Part-time",
        "Contract",
        "Casual"
      ),
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
      type: DataTypes.ENUM(
        "open",
        "closed",
        "filled"
      ),
      defaultValue: "open"
    },

    requiredDocuments: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'JSON array: ["Resume", "Diploma", "NBI Clearance"]'
    },

    /*
     * User who originally posted the job.
     */
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

    /*
     * Employer associated with the job.
     * This exists in the actual database structure.
     */
    employerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "Users",
        key: "id"
      },
      onDelete: "SET NULL",
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