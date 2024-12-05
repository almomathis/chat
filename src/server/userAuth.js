const users = new Map();

function handleLogin(req, res) {
  const { username, password } = req.body;
  if (users.has(username)) {
    if (users.get(username) === password) {
      res.json({ success: true });
    } else {
      res.json({ success: false, message: 'Incorrect password' });
    }
  } else {
    users.set(username, password);
    res.json({ success: true });
  }
}

module.exports = { handleLogin };