import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { useNavigate, useLocation } from "react-router-dom";
import EmojiPicker from "emoji-picker-react";

import styles from "../styles/Chat.module.css";
import icon from "../images/emoji.png";
import Messages from "./Messages";

const socket = io.connect("http://localhost:5000");

const Chat = () => {
  const { search } = useLocation();
  const [params, setParams] = useState({ room: "", user: "" });
  const [state, setState] = useState([]);
  const [message, setMessage] = useState("");
  const [isOpen, setOpen] = useState(false);
  const [isUserListOpen, setUserListOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [creator, setCreator] = useState("");
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  // Получение параметров из URL
  useEffect(() => {
    const searchParams = Object.fromEntries(new URLSearchParams(search));
    setParams(searchParams);
    socket.emit("join", searchParams);
  }, [search]);

  // Обработчик новых сообщений из сокета
  useEffect(() => {
    socket.on("message", ({ data }) => {
      setState((_state) => [..._state, data]);
    });
  }, []);

  // Обработчик обновления информации о комнате
  useEffect(() => {
    socket.on("room", ({ data: { users, creator } }) => {
      setUsers(users);
      setCreator(creator);
    });
  }, []);

  // Обработчик события удаления пользователя из комнаты
  useEffect(() => {
    socket.on("kicked", () => {
      alert("You have been removed from the room.");
      navigate("/");
    });
  }, [navigate]);

  // Прокрутка к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state]);

  // Функция выхода из комнаты
  const leftRoom = () => {
    socket.emit("leftRoom", { params });
    navigate("/");
  };

  // Обработчик изменения текста сообщения
  const handleChange = ({ target: { value } }) => setMessage(value);

  // Отправка сообщения
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!message) return;

    socket.emit("sendMessage", { message, params });

    setMessage("");
  };

  // Добавление эмодзи в сообщение
  const onEmojiClick = ({ emoji }) => setMessage(`${message} ${emoji}`);

  // Переключение видимости списка пользователей
  const toggleUserList = () => setUserListOpen((prev) => !prev);

  // Удаление пользователя из комнаты (только для создателя)
  const removeUser = (userId) => {
    socket.emit("removeUser", { room: params.room, userId });
  };

  // Закрытие панели эмодзи при уходе курсора
  const handleEmojiMouseLeave = () => {
    setOpen(false);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.title}>
          Room: {params.room}
        </div>
        <div className={styles.users} onClick={toggleUserList}>
          {users.length} users in this room
        </div>
        <button className={styles.left} onClick={leftRoom}>
          Left the room
        </button>
      </div>

      <div className={styles.messages}>
        <Messages messages={state} name={params.name} />
        <div ref={messagesEndRef}></div> {/* Элемент для прокрутки */}
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.input}>
          <input
            type="text"
            name="message"
            value={message}
            placeholder="Text here"
            onChange={handleChange}
            autoComplete="off"
            required
          />
        </div>
        
        <div className={styles.emoji}>
          <img src={icon} alt="Sticker pack" onClick={() => setOpen(!isOpen)} />

          {isOpen && (
            <div
              className={styles.emojies}
              onMouseLeave={handleEmojiMouseLeave}
            >
              <EmojiPicker onEmojiClick={onEmojiClick} />
            </div>
          )}
        </div>

        <div className={styles.button}>
          <input type="submit" value="Send" />
        </div>
      </form>

      {isUserListOpen && (
        <div className={styles.userListModal}>
          <div className={styles.userListHeader}>
            <span>Users in room</span>
            <button onClick={toggleUserList} className={styles.closeButton}>
              Close
            </button>
          </div>
          <div className={styles.userListContent}>
            {users.map((user) => (
              <div key={user.id} className={styles.user}>
                <span>
                  {user.name}
                  {user.id === socket.id && <span className={styles.youBadge}> (You)</span>}
                </span>
                <div className={styles.userActions}>
                  {user.id === creator && (
                    <span className={styles.creatorBadge}> (Creator)</span>
                  )}
                </div>
                {creator === socket.id && user.id !== creator && (
                  <button
                    className={styles.kickButton}
                    onClick={() => removeUser(user.id)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
