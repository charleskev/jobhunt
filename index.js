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
    
import express from "express";
import path from "path";
import os from "os";
import session from "express-session";
import flash from "connect-flash";
import router from "./routes/index.js";
import fs from 'fs';
import hbs from "hbs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const TMP_DIR = process.env.TMPDIR || process.env.TEMP || os.tmpdir();
const isServerless = Boolean(
  process.env.VERCEL ||
  process.env.VERCEL_URL ||
  process.env.LAMBDA_TASK_ROOT ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.NOW_REGION ||
  process.env.K_SERVICE
);
const UPLOAD_DIR = process.env.UPLOAD_DIR || (isServerless ? path.join(TMP_DIR, "uploads") : path.join(process.cwd(), "uploads"));
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
console.log("Upload directory:", UPLOAD_DIR);

app.use(express.static(path.join(process.cwd(), "public")));
app.use("/uploads", express.static(UPLOAD_DIR));

app.use(session({
  secret: "xianfire-secret-key",
  resave: false,
  saveUninitialized: false
}));
app.use(flash());

app.engine("xian", async (filePath, options, callback) => {
  try {
     const originalPartialsDir = hbs.partialsDir;
    hbs.partialsDir = path.join(__dirname, 'views');

    const result = await new Promise((resolve, reject) => {
      hbs.__express(filePath, options, (err, html) => {
        if (err) return reject(err);
        resolve(html);
      });
    });

    hbs.partialsDir = originalPartialsDir;
    callback(null, result);
  } catch (err) {
    callback(err);
  }
});
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});


app.set("views", path.join(__dirname, "views"));
app.set("view engine", "xian");
const partialsDir = path.join(__dirname, "views/partials");
fs.readdir(partialsDir, (err, files) => {
  if (err) {
    console.error("❌ Could not read partials directory:", err);
    return;
  }

   files
    .filter(file => file.endsWith('.xian'))
    .forEach(file => {
      const partialName = file.replace('.xian', ''); 
      const fullPath = path.join(partialsDir, file);

      fs.readFile(fullPath, 'utf8', (err, content) => {
        if (err) {
          console.error(`❌ Failed to read partial: ${file}`, err);
          return;
        }
        hbs.registerPartial(partialName, content);
        
      });
    });
});

// Register Handlebars helpers for comparisons and math operations
hbs.registerHelper('eq', (a, b) => a === b);
hbs.registerHelper('gt', (a, b) => a > b);
hbs.registerHelper('lt', (a, b) => a < b);
hbs.registerHelper('gte', (a, b) => a >= b);
hbs.registerHelper('lte', (a, b) => a <= b);
hbs.registerHelper('add', (a, b) => a + b);
hbs.registerHelper('sub', (a, b) => a - b);
hbs.registerHelper('mul', (a, b) => a * b);
hbs.registerHelper('div', (a, b) => a / b);
hbs.registerHelper('range', (n) => {
  const arr = [];
  for (let i = 0; i < n; i++) {
    arr.push(i);
  }
  return arr;
});

// Date formatting helper
hbs.registerHelper('formatDate', (date) => {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
  
  return d.toLocaleDateString();
});

// String substring helper
hbs.registerHelper('substring', (str, start, end) => {
  if (!str) return '';
  return String(str).substring(start, end);
});

// String substr helper
hbs.registerHelper('substr', (str, start, length) => {
  if (!str) return '';
  return String(str).substr(start, length);
});

// String concat helper
hbs.registerHelper('concat', (...args) => {
  args.pop(); // Remove the handlebars context object
  return args.join('');
});

// Fixed decimal helper
hbs.registerHelper('fixed', (num, decimals = 1) => {
  if (typeof num !== 'number') return num;
  return num.toFixed(decimals);
});

// Parse integer helper
hbs.registerHelper('parseInt', (str) => {
  return parseInt(str, 10);
});

// Convert to lowercase helper
hbs.registerHelper('toLowerCase', (str) => {
  if (typeof str !== 'string') return str;
  return str.toLowerCase();
});

// Convert to uppercase helper
hbs.registerHelper('toUpperCase', (str) => {
  if (typeof str !== 'string') return str;
  return str.toUpperCase();
});

// Date format helper with custom patterns
hbs.registerHelper('format', (date, pattern) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  // Month names
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthShort = monthNames[d.getMonth()];
  
  // Format conversions
  const replacements = {
    'YYYY': year,
    'YY': String(year).slice(-2),
    'MMMM': monthNames[d.getMonth()],
    'MMM': monthShort,
    'MM': month,
    'M': d.getMonth() + 1,
    'DD': day,
    'D': d.getDate(),
    'HH': hours,
    'H': d.getHours(),
    'mm': minutes,
    'm': d.getMinutes(),
    'ss': seconds,
    's': d.getSeconds(),
    'A': d.getHours() >= 12 ? 'PM' : 'AM'
  };
  
  let result = pattern;
  // Replace in order of length (longest first) to avoid partial replacements
  Object.keys(replacements)
    .sort((a, b) => b.length - a.length)
    .forEach(key => {
      result = result.replace(new RegExp(key, 'g'), replacements[key]);
    });
  
  return result;
});

app.use("/", router);

export default app;

if (!process.env.ELECTRON) {
  const server = app.listen(PORT, () => console.log(`🔥 XianFire running at http://localhost:${PORT}`));

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`❌ Port ${PORT} is already in use. Set a different PORT environment variable or stop the process occupying it.`);
      process.exit(1);
    }
    console.error("❌ Server error:", err);
    process.exit(1);
  });
}
