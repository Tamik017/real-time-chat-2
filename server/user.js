const { trimStr } = require("./utils"); 

let users = []; 

// Функция для поиска пользователей по части имени
const findUserByName = (name) => {
  return users.filter(user => user.name.toLowerCase().includes(trimStr(name).toLowerCase()));
};

// Функция для поиска пользователя по id, имени и комнате
const findUser = ({ id, name, room }) => {
  if (id) {
    // Если указан id, ищем по нему.
    return users.find((u) => u.id === id);
  }
  const userName = trimStr(name);
  const userRoom = trimStr(room);
  // Ищем пользователя с совпадающими именем и комнатой
  return users.find((u) => trimStr(u.name) === userName && trimStr(u.room) === userRoom);
};

// Функция для добавления нового пользователя
const addUser = ({ id, name, room }) => {
  const isExist = findUser({ name, room }); 

  if (!isExist) {
    const newUser = { id, name: trimStr(name), room: trimStr(room) }; 
    users.push(newUser); 
    return { isExist: false, user: newUser };
  }

  return { isExist: true, user: isExist }; 
  // Если пользователь уже существует, возвращаем его
};

// Функция для получения всех пользователей в указанной комнате
const getRoomUsers = (room) => {
  return users.filter((u) => u.room === trimStr(room)); 
};

// Функция для удаления пользователя по id
const removeUser = ({ id }) => {
  const found = findUser({ id }); 
  if (found) {
    users = users.filter((u) => u.id !== id);
  }
  return found; 
};

module.exports = { addUser, findUser, getRoomUsers, removeUser, findUserByName, users };
