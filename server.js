require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

// -----------------------------
// basic setup
// -----------------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

const uploadsFolder = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsFolder)) {
  fs.mkdirSync(uploadsFolder, { recursive: true });
}

app.use("/uploads", express.static(uploadsFolder));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// -----------------------------
// multer setup for file uploads
// -----------------------------
const studentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsFolder);
  },
  filename: function (req, file, cb) {
    const cleanName = file.originalname.replace(/\s+/g, "_");
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${cleanName}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: studentStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB each
  },
});

// -----------------------------
// helper auth middleware
// -----------------------------
function checkClientToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      return res.status(401).json({ error: "Missing token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.clientUser = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

function checkAgentToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      return res.status(401).json({ error: "Missing token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.agentUser = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// -----------------------------
// upload route
// -----------------------------
app.post("/upload", upload.array("files", 10), async (req, res) => {
  try {
    const files = (req.files || []).map((file) => ({
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: `/uploads/${file.filename}`,
      url: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
    }));

    res.status(201).json({ files });
  } catch (err) {
    console.error("POST /upload error:", err);
    res.status(500).json({ error: "Upload error", detail: err.message });
  }
});

// -----------------------------
// quotes
// -----------------------------

// GET all quotes
app.get("/quotes", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM quote_requests ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /quotes error:", err);
    res.status(500).json({ error: "Database error", detail: err.message });
  }
});

// GET one quote
app.get("/quotes/:id", async (req, res) => {
  try {
    const quoteId = req.params.id;

    const result = await pool.query(
      `SELECT * FROM quote_requests WHERE id = $1`,
      [quoteId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Quote not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("GET /quotes/:id error:", err);
    res.status(500).json({ error: "Database error", detail: err.message });
  }
});

// POST new quote
app.post("/quotes", async (req, res) => {
  try {
    const { quote_type, full_name, email, phone, payload } = req.body;

    if (!quote_type || !full_name || !email || !payload) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await pool.query(
      `INSERT INTO quote_requests (quote_type, full_name, email, phone, payload)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [quote_type, full_name, email.toLowerCase(), phone || null, payload]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /quotes error:", err);
    res.status(500).json({ error: "Database error", detail: err.message });
  }
});

// PUT quote payload update
app.put("/quotes/:id", async (req, res) => {
  try {
    const quoteId = req.params.id;
    const { payload, quote_type, full_name, email, phone } = req.body;

    const oldQuote = await pool.query(
      `SELECT * FROM quote_requests WHERE id = $1`,
      [quoteId]
    );

    if (oldQuote.rows.length === 0) {
      return res.status(404).json({ error: "Quote not found" });
    }

    const currentQuote = oldQuote.rows[0];

    const result = await pool.query(
      `UPDATE quote_requests
       SET
         quote_type = $1,
         full_name = $2,
         email = $3,
         phone = $4,
         payload = $5
       WHERE id = $6
       RETURNING *`,
      [
        quote_type || currentQuote.quote_type,
        full_name || currentQuote.full_name,
        (email || currentQuote.email).toLowerCase(),
        phone ?? currentQuote.phone,
        payload || currentQuote.payload,
        quoteId,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("PUT /quotes/:id error:", err);
    res.status(500).json({ error: "Database error", detail: err.message });
  }
});

// DELETE quote
app.delete("/quotes/:id", async (req, res) => {
  try {
    const quoteId = req.params.id;

    const result = await pool.query(
      `DELETE FROM quote_requests WHERE id = $1 RETURNING *`,
      [quoteId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Quote was not found" });
    }

    res.status(200).json({
      message: "Quote deleted successfully",
      quote: result.rows[0],
    });
  } catch (err) {
    console.error("DELETE /quotes/:id error:", err);
    res.status(500).json({
      error: "Database error",
      detail: err.message,
    });
  }
});

// -----------------------------
// agent sign up
// -----------------------------
app.post("/auth/agent/signup", async (req, res) => {
  try {
    const { fullName, email, password, licenseNumber } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingAgent = await pool.query(
      `SELECT id FROM agents WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (existingAgent.rows.length > 0) {
      return res.status(409).json({ error: "Agent already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO agents (full_name, email, hashed_password, license_number)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, email, license_number, created_at`,
      [fullName, email.toLowerCase(), hashedPassword, licenseNumber || null]
    );

    const agent = result.rows[0];

    const token = jwt.sign(
      { agentId: agent.id, email: agent.email, role: "agent" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({ agent, token });
  } catch (err) {
    console.error("error creating agent account", err);
    res.status(500).json({ error: "Database error", detail: err.message });
  }
});

// agent login
app.post("/auth/agent/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    const result = await pool.query(
      `SELECT id, full_name, email, hashed_password, license_number
       FROM agents
       WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const agentRow = result.rows[0];
    const ok = await bcrypt.compare(password, agentRow.hashed_password);

    if (!ok) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const agent = {
      id: agentRow.id,
      full_name: agentRow.full_name,
      email: agentRow.email,
      license_number: agentRow.license_number,
    };

    const token = jwt.sign(
      { agentId: agent.id, email: agent.email, role: "agent" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, agent });
  } catch (err) {
    console.error("error logging in agent", err);
    res.status(500).json({ error: "Database error", detail: err.message });
  }
});

// -----------------------------
// client sign up
// -----------------------------
app.post("/auth/client/signup", async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existing = await pool.query(
      `SELECT id FROM clients WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Client already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO clients (full_name, email, hashed_password, phone)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, email, phone, created_at`,
      [fullName, email.toLowerCase(), hashedPassword, phone || null]
    );

    const client = result.rows[0];

    const token = jwt.sign(
      { clientId: client.id, email: client.email, role: "client" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({ client, token });
  } catch (err) {
    console.error("error creating client account", err);
    res.status(500).json({ error: "Database error", detail: err.message });
  }
});

// client login
app.post("/auth/client/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    const result = await pool.query(
      `SELECT id, full_name, email, hashed_password, phone
       FROM clients
       WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const clientRow = result.rows[0];
    const ok = await bcrypt.compare(password, clientRow.hashed_password);

    if (!ok) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const client = {
      id: clientRow.id,
      full_name: clientRow.full_name,
      email: clientRow.email,
      phone: clientRow.phone,
    };

    const token = jwt.sign(
      { clientId: client.id, email: client.email, role: "client" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, client });
  } catch (err) {
    console.error("error logging in client", err);
    res.status(500).json({ error: "Database error", detail: err.message });
  }
});

// -----------------------------
// tiny test routes
// -----------------------------
app.get("/", (req, res) => {
  res.send("Riverside server is running");
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// -----------------------------
// start server
// -----------------------------
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});