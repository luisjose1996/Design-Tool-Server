const db = require("./database/connectDB.js");

// Handle user registration
const signup = (req, res) => {
  const { username, email, password } = req.body;

  // Check if the email already exists
  const checkEmailQuery = 'SELECT * FROM user WHERE email = ?';
  db.query(checkEmailQuery, [email], (checkErr, checkResult) => {
    if (checkErr) {
      console.error('Error checking existing email:', checkErr);
      res.status(500).send('Error checking existing email');
    } else {
      if (checkResult.length > 0) {
        // Email is already registered
        res.status(409).send('This email is already signed up');
      } else {
        // Email is not registered, proceed to create a new user
        const insertUserQuery =
          'INSERT INTO user (email, username, password) VALUES (?, ?, ?)';
        db.query(
          insertUserQuery,
          [email, username, password],
          (insertErr, insertResult) => {
            if (insertErr) {
              console.error('Error creating a new account:', insertErr);
              res.status(500).send('Error creating a new account');
            } else {
              res.status(201).send('Account created successfully');
            }
          }
        );
      }
    }
  });
};

const login = (req, res) => {
  const { email, password } = req.body;

  // Check if the email exists
  const checkEmailQuery = "SELECT * FROM user WHERE email = ?";
  db.query(checkEmailQuery, [email], (checkErr, checkResult) => {
    if (checkErr) {
      res.status(500).send("Error checking existing email");
    } else {
      if (checkResult.length === 0) {
        res.status(404).send("Email not registered");
      } else {
        // Email is registered, check password or perform other authentication logic
        // For simplicity, let's assume plaintext passwords (in a real-world scenario, use bcrypt or other secure methods)
        const user = checkResult[0];
        if (user.password === password) {
          res.json({ name: user.username, id: user.id });
        } else {
          res.status(401).send("Wrong password");
        }
      }
    }
  });
};

module.exports = { signup, login };
