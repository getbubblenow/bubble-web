import config from 'config';
import { util } from '../_helpers';

export const userService = {
    login,
    logout,
    register,
    getAll,
    getById,
    getPolicyById,
    updatePolicyById,
    addPolicyContactById,
    removePolicyContactByUuid,
    setLocale,
    update,
    delete: _delete,
    approveAction,
    denyAction,
    sendAuthenticatorCode,
    resendVerificationCode
};

function setSessionUser (user) {
    // login successful if there's a session token in the response
    if (user.token) {
        // store user details and session token in local storage to keep user logged in between page refreshes
        localStorage.setItem('user', JSON.stringify(user));
    }
    return user;
}

function login(name, password, messages, errors) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 'name': name, 'password': password })
    };
    return fetch(`${config.apiUrl}/auth/login`, requestOptions)
        .then(handleAuthResponse(messages, errors))
        .then(setSessionUser);
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
        .then(setSessionUser);
}

function getAll(messages, errors) {
    return fetch(`${config.apiUrl}/users`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function getById(id, messages, errors) {
    return fetch(`${config.apiUrl}/users/${id}`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function getPolicyById(id, messages, errors) {
    return fetch(`${config.apiUrl}/users/${id}/policy`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function updatePolicyById(id, policy, messages, errors) {
    return fetch(`${config.apiUrl}/users/${id}/policy`, util.postWithAuth(policy)).then(util.handleCrudResponse(messages, errors));
}

function addPolicyContactById(id, contact, messages, errors) {
    return fetch(`${config.apiUrl}/users/${id}/policy/contacts`, util.postWithAuth(contact)).then(util.handleCrudResponse(messages, errors));
}

function removePolicyContactByUuid(id, uuid, messages, errors) {
    return fetch(`${config.apiUrl}/users/${id}/policy/contacts/${uuid}`, util.deleteWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function approveAction(id, code, messages, errors) {
    return fetch(`${config.apiUrl}/auth/approve/${code}`, util.postWithAuth([{'name': 'account', 'value': id}]))
        .then(util.handleCrudResponse(messages, errors))
        .then(setSessionUser);
}

function sendAuthenticatorCode(id, code, verifyOnly, messages, errors) {
    return fetch(`${config.apiUrl}/auth/authenticator`, util.postWithAuth({
        account: id,
        token: code,
        verify: verifyOnly
    }))
        .then(util.handleCrudResponse(messages, errors))
        .then(setSessionUser);
}

function resendVerificationCode(id, contact, messages, errors) {
    return fetch(`${config.apiUrl}/users/${id}/policy/contacts/verify`, util.postWithAuth(contact))
        .then(util.handleCrudResponse(messages, errors));
}

function denyAction(id, code, messages, errors) {
    return fetch(`${config.apiUrl}/auth/deny/${code}`, util.postWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function setLocale(locale, messages, errors) {
    const user = util.currentUser();
    if (user != null && user.token) {
        return fetch(`${config.apiUrl}/me/locale/${locale}`, util.postWithAuth()).then(util.handleCrudResponse(messages, errors));
    } else {
        const loc = {locale: locale};
        return Promise.resolve(loc);
    }
}

function update(user, messages, errors) {
    return fetch(`${config.apiUrl}/users/${user.uuid}`, util.postWithAuth(user)).then(util.handleCrudResponse(messages, errors));
}

// prefixed function name with underscore because delete is a reserved word in javascript
function _delete(id, messages, errors) {
    return fetch(`${config.apiUrl}/users/${id}`, util.deleteWithAuth()).then(util.handleCrudResponse(messages, errors));
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
                    util.setValidationErrors(data, messages, errors);
                }
                const error = (data && data.message) || response.statusText;
                return Promise.reject(error);
            }
            return data;
        });
    };
}