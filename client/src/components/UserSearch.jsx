import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/UserSearch.module.css'; 

const UserSearch = () => {
  // Хуки состояния для управления поисковым запросом, результатами, ошибками и индикатором загрузки
  const [searchQuery, setSearchQuery] = useState(''); 
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false); 

  useEffect(() => {
    // Используем задержку, чтобы минимизировать количество запросов на сервер
    const timer = setTimeout(async () => {
      // Если поисковый запрос пустой, очищаем результаты и выходим
      if (searchQuery.trim() === '') {
        setSearchResults([]);
        return;
      }

      setIsTyping(true);

      try {
        // Выполняем запрос на сервер для получения данных пользователей
        const response = await axios.get(`http://localhost:5000/search-user?name=${searchQuery}`);
        setSearchResults(response.data.users); // Обновляем результаты поиска
        setError(null);
      } catch (err) {
        setError('No users found');
        setSearchResults([]);
      }

      setIsTyping(false); // Отключаем индикатор загрузки после завершения запроса
    }, 500);

    // Очищаем таймер при изменении поискового запроса
    return () => clearTimeout(timer);
  }, [searchQuery]); // Выполняем эффект, когда изменяется searchQuery

  const handleSearchChange = (e) => {
    // Обновляем поисковый запрос при вводе в поле
    setSearchQuery(e.target.value);
  };

  return (
    <div className={styles.userSearchContainer}>
      <h2>Search Users</h2>
      <input
        type="text"
        placeholder="Enter name to search" 
        value={searchQuery} 
        onChange={handleSearchChange}
      />

      {isTyping && <p>Searching...</p>}  

      {error && <p>{error}</p>}

      {searchResults.length > 0 && (
        <ul>
          {searchResults.map((user) => (
            <li key={user.id}>
              {user.name} - Room: {user.room} {/* Отображаем имя пользователя и комнату */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserSearch;
