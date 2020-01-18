import config from 'config';
import { util } from '../_helpers';

export const userService = {
    login,
    logout,
    register,
    getAllUsers,
    getMe,
    getUserById,
    getPolicyByUserId,
    updatePolicyByUserId,
    addPolicyContactById,
    removePolicyContactByUserId,
    setLocale,
    addSshKeyByUserId,
    removeSshKeyByUserId,
    listSshKeysByUserId,
    updateUser,
    deleteUser,
    approveAction,
    denyAction,
    sendAuthenticatorCode,
    resendVerificationCode
};

function setSessionUser (user) {
    // login successful if there's a session token in the response
    if (user.token) {
        // store user details and session token in local storage to keep user logged in between page refreshes
        localStorage.setItem(util.USER_KEY, JSON.stringify(user));
    }
    return user;
}

function login(name, password, unlockKey, messages, errors) {
    const unlockParam = (typeof unlockKey !== 'undefined' && unlockKey !== null) ? `?k=${unlockKey}` : '';
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 'name': name, 'password': password })
    };
    return fetch(`${config.apiUrl}/auth/login${unlockParam}`, requestOptions)
        .then(handleAuthResponse(messages, errors))
        .then(setSessionUser);
}

function logout(messages, errors) {
    if (util.currentUser() === null) {
        console.log('userService.logout: already logged out');
        return Promise.resolve();
    }
    return fetch(`${config.apiUrl}/auth/logout`, util.getWithAuth())
        .then(util.handleCrudResponse(messages, errors));
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

function getAllUsers(messages, errors) {
    return fetch(`${config.apiUrl}/users`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function getMe(messages, errors) {
    return fetch(`${config.apiUrl}/me`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function getUserById(userId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function getPolicyByUserId(userId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/policy`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function updatePolicyByUserId(userId, policy, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/policy`, util.postWithAuth(policy)).then(util.handleCrudResponse(messages, errors));
}

function addPolicyContactById(userId, contact, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/policy/contacts`, util.postWithAuth(contact)).then(util.handleCrudResponse(messages, errors));
}

function removePolicyContactByUserId(userId, contactUuid, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/policy/contacts/${contactUuid}`, util.deleteWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function approveAction(userId, code, messages, errors) {
    return fetch(`${config.apiUrl}/auth/approve/${code}`, util.postWithAuth([{'name': 'account', 'value': userId}]))
        .then(util.handleCrudResponse(messages, errors))
        .then(setSessionUser);
}

function sendAuthenticatorCode(userId, code, authOnly, verifyOnly, messages, errors) {
    const auth = {
        account: userId,
        token: code
    };
    if (typeof authOnly !== 'undefined' && authOnly !== null) auth.authenticate = authOnly;
    if (typeof verifyOnly !== 'undefined' && verifyOnly !== null) auth.verify = verifyOnly;
    return fetch(`${config.apiUrl}/auth/authenticator`, util.postWithAuth(auth))
        .then(util.handleCrudResponse(messages, errors))
        .then(setSessionUser);
}

function resendVerificationCode(userId, contact, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/policy/contacts/verify`, util.postWithAuth(contact))
        .then(util.handleCrudResponse(messages, errors));
}

function denyAction(userId, code, messages, errors) {
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

function addSshKeyByUserId(userId, sshKey, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/keys`, util.putWithAuth(sshKey)).then(util.handleCrudResponse(messages, errors));
}

function removeSshKeyByUserId(userId, sshKeyId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/keys/${sshKeyId}`, util.deleteWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function listSshKeysByUserId(userId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/keys`, util.getWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function updateUser(user, messages, errors) {
    return fetch(`${config.apiUrl}/users/${user.uuid}`, util.postWithAuth(user)).then(util.handleCrudResponse(messages, errors));
}

function deleteUser(userId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}`, util.deleteWithAuth()).then(util.handleCrudResponse(messages, errors));
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