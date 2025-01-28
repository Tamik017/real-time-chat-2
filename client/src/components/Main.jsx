import React, { useState } from 'react';

import { Link } from 'react-router-dom';

import styles from '../styles/Main.module.css';

import UserSearch from './UserSearch';

//Используется для задания названий полей формы
const FIELDS = {
  NAME: 'name',
  ROOM: 'room',
};

const Main = () => {
  const { NAME, ROOM } = FIELDS;

  const [values, setValues] = useState({ [NAME]: '', [ROOM]: '' });
  // Состояние values хранит значения полей формы

  // Обработчик изменения значений в полях ввода
  const handleChange = ({ target: { value, name } }) => {
    setValues({ ...values, [name]: value });
    // Обновляем состояние, добавляя новое значение для соответствующего поля
  };

  // Обработчик клика на ссылке
  const handleClick = (e) => {
    const isDisabled = Object.values(values).some((v) => !v);
    // Проверяем, заполнены ли все поля формы

    if (isDisabled) e.preventDefault();
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.container}>
        <h1 className={styles.heading}>Join to room</h1>

        <form className={styles.form}>
          <div className={styles.group}>
            <input
              type="text"
              name="name"
              value={values[NAME]}
              placeholder="Your Name"
              className={styles.input}
              onChange={handleChange}
              autoComplete="off"
              required
            />
          </div>
          <div className={styles.group}>
            <input
              type="text"
              name="room"
              value={values[ROOM]}
              placeholder="Room"
              className={styles.input}
              onChange={handleChange}
              autoComplete="off"
              required
            />
          </div>

          <Link
            className={styles.group}
            onClick={handleClick}
            to={`/chat?name=${values[NAME]}&room=${values[ROOM]}`}
          >
            <button type="submit" className={styles.button}>
              Sign in
            </button>
          </Link>
        </form>

        <UserSearch />
      </div>
    </div>
  );
};

export default Main;
