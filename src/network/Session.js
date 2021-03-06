import axios from './axios';
import { AsyncStorage } from 'react-native';
import { LoginManager, AccessToken } from 'react-native-fbsdk';
import FCM from 'react-native-fcm';
import {
  AppAction,
  AuthAction,
  LoadingAction,
  MessageBarAction,
  ModalAction,
} from '../reducers/Actions';
import { consts, session_string } from '../assets/strings';
import { getAllTicket } from './Ticket';

/**
 *  TEST SESSION
 *  EMAIL: contacts@livle.kr
 *  PW: 12345678
 */
function setHeader(item) {
  if (item) axios.defaults.headers.common['Authorization'] = item.token;
}
/* MANAGE TOKEN */
async function _getToken() {
  const result = await AsyncStorage.getItem(consts.asyncToken);
  const item = await JSON.parse(result);
  if (item) setHeader(item);
  return item;
}
async function _setToken(token) {
  const item = { token: token };
  const response = await _getToken();
  if (!response) {
    setHeader(item);
    AsyncStorage.setItem(consts.asyncToken, JSON.stringify(item));
  }
}
function _removeToken() {
  AsyncStorage.removeItem(
    consts.asyncToken,
    err => delete axios.defaults.headers.common['Authorization']
  );
}
/* END */

/* GET DATA & DISPATCH FROM SERVER */
const dispatchUserData = data => dispatch => {
  dispatch({ type: AppAction.LOGIN, data: data });
  getAllTicket(dispatch);
  dispatch({
    type: MessageBarAction.SHOW_MESSAGE_BAR,
    message: session_string.signedIn,
  });
};

async function getLivleData(dispatch) {
  const fcmToken = await FCM.getFCMToken();
  return axios
    .get('/user', { params: { fcmToken: fcmToken } })
    .then(response => {
      const { data } = response;
      dispatchUserData(data)(dispatch);
    })
    .catch(err => {
      if (err.response.status === 403) _removeToken();
      dispatch({ type: AppAction.LOGOUT });
    });
}

const getFacebookData = (facebookToken, fcmToken) => dispatch => {
  return axios
    .post(`/user/facebook`, { accessToken: facebookToken, fcmToken: fcmToken })
    .then(response => {
      const { data } = response;
      _setToken(data.token);
      dispatchUserData(data)(dispatch);
    })
    .catch(err => {
      if (err.response.status === 403) {
        _removeToken();
        dispatch({
          type: ModalAction.SHOW_MODAL,
          data: {
            type: 'blink',
            text: `동일한 이메일로 회원가입한 유저가 있습니다.
이메일로 로그인해주세요`,
          },
        });
      }
      dispatch({ type: AppAction.LOGOUT });
    });
};
/* END */

export const checkSession = dispatch => {
  return _getToken().then(response => {
    if (response) {
      return getLivleData(dispatch);
    } else {
      dispatch({ type: AppAction.LOGOUT });
    }
  });
};

export const login = (email, password, fcmToken) => dispatch => {
  dispatch({ type: LoadingAction.SHOW_LOADING });
  return axios
    .post(`/user/session`, {
      email: email,
      password: password,
      fcmToken: fcmToken,
    })
    .then(response => {
      const { data } = response;
      _setToken(data.token);
      dispatchUserData(data)(dispatch);
    })
    .catch(err => {
      dispatch({ type: LoadingAction.HIDE_LOADING });
      dispatch({
        type: ModalAction.SHOW_MODAL,
        data: {
          type: 'blink',
          text: err.response.data,
        },
      });
    });
};

export const facebookLogin = fcmToken => dispatch => {
  dispatch({ type: LoadingAction.SHOW_LOADING });
  LoginManager.logInWithReadPermissions(['public_profile', 'email']).then(
    result => {
      if (!result.isCancelled) {
        AccessToken.getCurrentAccessToken().then(data => {
          const facebookToken = data.accessToken;
          getFacebookData(facebookToken, fcmToken)(dispatch);
        });
      }
    },
    err => {
      dispatch({ type: LoadingAction.HIDE_LOADING });
      console.log(err);
    }
  );
};

export const updateSession = dispatch => {
  return _getToken().then(response => {
    if (response) {
      return axios
        .get('/user')
        .then(response => {
          dispatch({
            type: AuthAction.UPDATE_USER_DATA,
            data: response.data,
          });
        })
        .catch(err => {
          console.log(err.response);
        });
    }
  });
};

export const logout = dispatch => {
  dispatch({ type: LoadingAction.SHOW_LOADING });
  _removeToken();
  LoginManager.logOut();
  dispatch({ type: AppAction.LOGOUT });
  dispatch({
    type: MessageBarAction.SHOW_MESSAGE_BAR,
    message: session_string.signedOut,
  });
};

export const signUp = (email, password, nickname, fcmToken) => dispatch => {
  dispatch({ type: LoadingAction.SHOW_LOADING });
  return axios
    .post('/user', {
      email: email,
      password: password,
      nickname: nickname,
      fcmToken: fcmToken,
    })
    .then(response => {
      const { data } = response;
      _setToken(data.token);
      dispatchUserData(data)(dispatch);
      return Promise.resolve();
    })
    .catch(err => {
      dispatch({
        type: ModalAction.SHOW_MODAL,
        data: {
          type: 'blink',
          text: err.response.data,
        },
      });
      dispatch({ type: LoadingAction.HIDE_LOADING });
      Promise.reject(err.response.status);
    });
};

export const confirmEmail = email => dispatch => {
  dispatch({ type: LoadingAction.SHOW_LOADING });
  return axios
    .get(`/user/password?email=${email}`)
    .then(() => {
      dispatch({ type: LoadingAction.HIDE_LOADING });
      return Promise.resolve();
    })
    .catch(err => {
      dispatch({ type: LoadingAction.HIDE_LOADING });
      dispatch({
        type: ModalAction.SHOW_MODAL,
        data: {
          type: 'blink',
          text: err.response.data,
        },
      });
      return Promise.reject();
    });
};

export const changePassword = (token, password) => dispatch => {
  dispatch({ type: LoadingAction.SHOW_LOADING });
  return axios
    .post(`/user/password`, { token: token, password: password })
    .then(() => {
      dispatch({ type: LoadingAction.HIDE_LOADING });
      dispatch({
        type: ModalAction.SHOW_MODAL,
        data: {
          type: 'blink',
          text: session_string.completeChangePassword,
        },
      });
      return Promise.resolve();
    })
    .catch(err => {
      dispatch({ type: LoadingAction.HIDE_LOADING });
      dispatch({
        type: ModalAction.SHOW_MODAL,
        data: {
          type: 'blink',
          text: err.response.data,
        },
      });
      return Promise.reject(err.response.status);
    });
};

export const withdraw = (email, password) => dispatch => {
  dispatch({ type: LoadingAction.SHOW_LOADING });
  return axios
    .delete('/user', { data: { email: email, password: password } })
    .then(() => {
      dispatch({ type: AppAction.LOGOUT });
      dispatch({ type: LoadingAction.HIDE_LOADING });
      dispatch({
        type: MessageBarAction.SHOW_MESSAGE_BAR,
        message: session_string.withdraw,
      });
      return Promise.resolve();
    })
    .catch(err => {
      dispatch({ type: LoadingAction.HIDE_LOADING });
      console.log(err.response);
      dispatch({
        type: ModalAction.SHOW_MODAL,
        data: {
          type: 'blink',
          text: err.response.data,
        },
      });
      return Promise.reject();
    });
};
