import React, { useState, useEffect } from 'react';
let logoutTimer;

const AuthContext = React.createContext({
  token: '',
  isLoggedIn: false,
  login: token => {},
  logout: () => {},
});

const retrieveStoredToken = () => {
  const storedToken = localStorage.getItem('token');
  const storedExpirationDate = localStorage.getItem('expirationTime');

  const remainingTime = calcRemainderTime(storedExpirationDate);

  if (remainingTime <= 6000) {
    localStorage.removeItem('token');
    localStorage.removeItem('expirationTime');
    return null;
  }

  return {
    token: storedToken,
    duration: remainingTime,
  };
};

const calcRemainderTime = expirationTime => {
  const currentTime = new Date().getTime();

  const adjustedExpTime = new Date(expirationTime).getTime();

  const remainingTime = adjustedExpTime - currentTime;

  return remainingTime;
};

export const AuthContextProvider = props => {
  const tokenData = retrieveStoredToken();

  let initialTokenState;

  if (tokenData) {
    initialTokenState = tokenData.token;
  }
  const [token, setToken] = useState(initialTokenState);

  const userIsLoggedIn = !!token;

  const logoutHandler = () => {
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('expirationTime');

    if (logoutTimer) {
      clearTimeout(logoutTimer);
    }
  };

  const loginHandler = (token, expirationTime) => {
    localStorage.setItem('token', token);
    localStorage.setItem('expirationTime', expirationTime);
    setToken(token);

    const remainingTime = calcRemainderTime(expirationTime);

    logoutTimer = setTimeout(logoutHandler, remainingTime);
  };

  useEffect(() => {
    if (tokenData) {
      logoutTimer = setTimeout(logoutHandler, tokenData.duration);
    }
  }, [tokenData]);

  const contextValue = {
    token: token,
    isLoggedIn: userIsLoggedIn,
    login: loginHandler,
    logout: logoutHandler,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
