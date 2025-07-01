const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const port = 3000;


app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));


const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'SLASMALOSIA@34', 
  database: 'auth_demo'
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL connected...');
});

app.post('/register', async (req, res) => {
  const { username, password, confirm_password, email } = req.body;
  if (password !== confirm_password) {
    return res.send('Passwords do not match!');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  db.query(
    'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
    [username, hashedPassword, email],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.send('Username already exists.');
        return res.send('Registration error.');
      }
      res.send('Registration successful!');
    }
  );
});


app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
    if (err) throw err;

    if (results.length === 0) {
      return res.send('User not found');
    }

    const match = await bcrypt.compare(password, results[0].password);
    if (match) {
      res.sendFile(path.join(__dirname, 'public', 'main.html'));
    } else {
      res.send('Invalid credentials');
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
