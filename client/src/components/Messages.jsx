import React from 'react'
import styles from "../styles/Messages.module.css";

const Messages = ({ messages, name }) => { 

  return (
    <div className={styles.messages}>
      
      {messages.map(({ user, message }, i) => {
        // Итерируем по массиву сообщений. Для каждого сообщения деструктурируем user и message

        const itsMe = user.name.trim().toLowerCase() === name.trim().toLowerCase();

        const className = itsMe ? styles.me : styles.user;
        // Если сообщение от текущего пользователя, применяем стиль для себя, иначе для другого пользователя

        return (
          <div key={i} className={`${styles.messages} ${className}`}>
            
            <span className={styles.user}>
              {user.name}
            </span>

            <div className={styles.text}>
              {message}
            </div>
          </div>
        );
      })}
    </div>
  )
}

export default Messages;
