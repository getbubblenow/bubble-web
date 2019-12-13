import config from 'config';
import { getWithAuth, postWithAuth, deleteWithAuth, handleCrudResponse, setValidationErrors } from '../_helpers';

export const userService = {
    login,
    logout,
    register,
    getAll,
    getById,
    update,
    delete: _delete
};

function login(name, password, messages, errors) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 'name': name, 'password': password })
    };
    return fetch(`${config.apiUrl}/auth/login`, requestOptions)
        .then(handleAuthResponse(messages, errors))
        .then(user => {
            // login successful if there's a session token in the response
            if (user.token) {
                // store user details and session token in local storage to keep user logged in between page refreshes
                localStorage.setItem('user', JSON.stringify(user));
            }
            return user;
        });
}

function logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('user');
}

function register(user, messages, errors) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    };
    return fetch(`${config.apiUrl}/auth/register`, requestOptions)
        .then(handleAuthResponse(messages, errors))
        .then(user => {
            if (user.token) {
                // store user details and session token in local storage to keep user logged in between page refreshes
                localStorage.setItem('user', JSON.stringify(user));
            }
            return user;
        });
}

function getAll() {
    return fetch(`${config.apiUrl}/users`, getWithAuth()).then(handleCrudResponse);
}

function getById(id) {
    return fetch(`${config.apiUrl}/users/${id}`, getWithAuth()).then(handleCrudResponse);
}

function update(user) {
    return fetch(`${config.apiUrl}/users/${user.uuid}`, postWithAuth(user)).then(handleCrudResponse);
}

// prefixed function name with underscore because delete is a reserved word in javascript
function _delete(id) {
    return fetch(`${config.apiUrl}/users/${id}`, deleteWithAuth()).then(handleCrudResponse);
}

function handleAuthResponse(messages, errors) {
    return function (response) {
        return response.text().then(text => {
            const data = text && JSON.parse(text);
            if (!response.ok) {
                if (response.status === 401) {
                    // auto logout if 401 response returned from api
                    logout();
                    location.reload(true);

                } else if (response.status === 404) {
                    // set error from API
                    // todo: show nicer error message
                    console.log('handleAuthResponse: received 404, user not found: '+JSON.stringify(data));

                } else if (response.status === 422) {
                    setValidationErrors(data, messages, errors);
                }
                const error = (data && data.message) || response.statusText;
                return Promise.reject(error);
            }
            return data;
        });
    };
}