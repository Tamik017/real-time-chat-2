const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const app = express();

const route = require('./route');
const { addUser, findUser, getRoomUsers, removeUser } = require('./user');

app.use(cors({ origin: "*" }));
app.use(route);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const rooms = {}; // Храним информацию о комнатах и их создателях

io.on("connection", (socket) => {
  socket.on("join", ({ name, room }) => {
    socket.join(room);

    const { user } = addUser({ id: socket.id, name, room });

    // Если комната новая, назначаем создателя
    if (!rooms[room]) {
      rooms[room] = { creator: socket.id };
    }

    const userMessage = `${user.name} has joined`;

    // Отправляем сообщение самому пользователю
    socket.emit("message", {
      data: { user: { name: "Admin" }, message: userMessage },
    });

    // Уведомляем остальных в комнате
    socket.broadcast.to(user.room).emit("message", {
      data: { user: { name: "Admin" }, message: `${user.name} has joined` },
    });

    // Обновляем список пользователей и информацию о создателе
    io.to(user.room).emit("room", {
      data: {
        users: getRoomUsers(user.room),
        creator: rooms[room]?.creator,
      },
    });
  });

  socket.on("sendMessage", ({ message, params }) => {
    const user = findUser({ id: socket.id });

    if (user) {
      io.to(user.room).emit("message", { data: { user, message } });
    }
  });

  // Удаление участника из комнаты
  socket.on("removeUser", ({ room, userId }) => {
    const currentRoom = rooms[room];

    // Проверяем, является ли запросивший пользователем создателем комнаты
    if (currentRoom && currentRoom.creator === socket.id) {
      const removedUser = removeUser({ id: userId });

      if (removedUser) {
        io.to(userId).emit("kicked");

        io.to(room).emit("message", {
          data: {
            user: { name: "Admin" },
            message: `${removedUser.name} has been removed by the creator.`,
          },
        });

        io.to(room).emit("room", {
          data: {
            users: getRoomUsers(room),
            creator: currentRoom.creator,
          },
        });
      }
    }
  });

  //Выход из комнаты
  socket.on("leftRoom", () => {
    const user = removeUser({ id: socket.id });

    if (user) {
      const { room, name } = user;

      io.to(room).emit("message", {
        data: { user: { name: "Admin" }, message: `${name} has left` },
      });

      io.to(room).emit("room", {
        data: {
          users: getRoomUsers(room),
          creator: rooms[room]?.creator,
        },
      });

      // Удаляем комнату, если все участники вышли
      if (getRoomUsers(room).length === 0) {
        delete rooms[room];
      }
    }
  });

  //Отключение от сервера
  socket.on("disconnect", () => {
    const user = removeUser({ id: socket.id });

    if (user) {
      const { room, name } = user;

      io.to(room).emit("message", {
        data: { user: { name: "Admin" }, message: `${name} has disconnected` },
      });

      io.to(room).emit("room", {
        data: {
          users: getRoomUsers(room),
          creator: rooms[room]?.creator,
        },
      });

      // Удаляем комнату, если все участники вышли
      if (getRoomUsers(room).length === 0) {
        delete rooms[room];
      }
    }

    console.log("Disconnect");
  });
});

server.listen(5000, () => {
  console.log("Server is running");
});
