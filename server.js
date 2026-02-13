
require("dotenv").config();
console.log("DB URL:", process.env.DATABASE_URL);

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});





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



// POST a new quote
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
      [quote_type, full_name, email, phone || null, payload]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /quotes error:", err);
    res.status(500).json({ error: "Database error", detail: err.message });
  }
});




//agent sign up
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

    const hashed_password = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO agents (full_name, email, hashed_password, license_number)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, email, license_number, created_at`,
      [fullName, email.toLowerCase(), hashed_password, licenseNumber || null]
    );

    const agent = result.rows[0];

    const token = jwt.sign(
      { agentId: agent.id, email: agent.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({ agent, token });
  } catch (err) {
    console.error("error creating agent account", err);
    res.status(500).json({ error: "Database error", detail: err.message });
  }
});




//Agent loogin

app.post("/auth/agent/login", async (req, res) => {
try {
  const { email, password } = req.body;
  
  if(!email || !password) {
    return res.status(400).json({ error: "Missing email or password" });
  }

  const result = await pool.query(
    `SELECT id, full_name, email, hashed_password, license_number FROM agents WHERE email = $1`,
    [email.toLowerCase()]
  );

  if(result.rows.length === 0) {
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
    license_number: agentRow.license_number
  };

  const token = jwt.sign({ agentId: agent.id, email:agent.email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.json({ token, agent });

}
catch (err) {
  console.error("error logging in agent", err);
  res.status(500).json({ error: "Database error", detail: err.message });

}
});





//Client Sign up
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

    const hashed_password = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO clients (full_name, email, hashed_password, phone)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, email, phone, created_at`,
      [fullName, email.toLowerCase(), hashed_password, phone || null]
    );

    const client = result.rows[0];

    const token = jwt.sign(
      { clientId: client.id, email: client.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({ client, token });
  } catch (err) {
    console.error("error creating client account", err);
    res.status(500).json({ error: "Database error", detail: err.message });
  }
});


//Client Log In
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
      phone: clientRow.phone
    };

    const token = jwt.sign(
      { clientId: client.id, email: client.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, client });
  } catch (err) {
    console.error("error logging in client", err);
    res.status(500).json({ error: "Database error", detail: err.message });
  }
});





//Agent dashboard




//Client ddashboard









app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
