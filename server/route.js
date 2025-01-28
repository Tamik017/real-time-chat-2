const express = require("express"); 

const { users } = require("./user"); 

const router = express.Router(); 

// Маршрут для поиска пользователей по имени
router.get('/search-user', (req, res) => {
  const { name } = req.query; 
  // Получаем параметр `name` из строки запроса

  if (!name) {
    return res.status(400).json({ error: 'Name parameter is required' });
  }

  // Ищем всех пользователей, чьи имена содержат искомое имя
  const usersFound = users.filter(user => user.name.toLowerCase().includes(name.toLowerCase()));

  if (usersFound.length === 0) {
    return res.status(404).json({ message: 'No users found' });
  }

  // Если пользователи найдены, отправляем их данные клиенту
  return res.json({ users: usersFound });
});

module.exports = router;
