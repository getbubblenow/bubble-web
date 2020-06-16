/**
 * Copyright (c) 2020 Bubble, Inc.  All rights reserved.
 * For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/
 */
import config from 'config';
import { util } from '../_helpers';

export const userService = {
    login,
    appLogin,
    logout,
    forgotPassword,
    register,
    searchAccounts,
    getMe,
    requestAccountDownload,
    downloadAccount,
    getUserById,
    getPolicyByUserId,
    updatePolicyByUserId,
    addPolicyContactById,
    removePolicyContactByUserId,
    setLocale,
    addSshKeyByUserId,
    removeSshKeyByUserId,
    listSshKeysByUserId,
    createUser,
    updateUser,
    deleteUser,
    changePassword,
    adminChangePassword,
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

function login(name, password, totpToken, unlockKey, messages, errors) {
    const unlockParam = (typeof unlockKey !== 'undefined' && unlockKey !== null) ? `?k=${unlockKey}` : '';
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 'name': name, 'password': password, 'totpToken': totpToken })
    };
    return fetch(`${config.apiUrl}/auth/login${unlockParam}`, requestOptions)
        .then(handleAuthResponse(messages, errors))
        .then(setSessionUser);
}

function appLogin(session, messages, errors) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    };
    return fetch(`${config.apiUrl}/auth/appLogin/${session}`, requestOptions)
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

function forgotPassword(username, messages, errors) {
    return fetch(`${config.apiUrl}/auth/forgotPassword`, util.postWithAuth({name: username}))
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

function searchAccounts(query, messages, errors) {
    return fetch(`${config.apiUrl}/search/account`, util.postWithAuth(query)).then(util.handleCrudResponse(messages, errors));
}

function getMe(messages, errors) {
    return fetch(`${config.apiUrl}/me`, util.getWithAuth()).then(
        response => {
            if (!response.ok && response.status === 404) util.logout();
            return response;
        }
    ).then(util.handleCrudResponse(messages, errors));
}

function requestAccountDownload(messages, errors) {
    return fetch(`${config.apiUrl}/me/download`, util.postWithAuth()).then(util.handlePlaintextResponse(messages, errors));
}

function downloadAccount(token, messages, errors) {
    const fileName = (util.currentUser().name || util.currentUser().uuid || token) + ".json";

    return fetch(`${config.apiUrl}/me/download/${token}`, util.postWithAuth())
        .then(util.handlePlaintextResponse(messages, errors))
        .then(text => {
            try {
                return JSON.stringify(JSON.parse(text, (_, v) => typeof v === 'string' ? (JSON.parse(v) || v) : v),
                                      null, '\t');
            } catch(err) {
                Promise.reject(text || err);
            }
        })
        .then(util.handleDataToDownloadAsFile(fileName, 'application/json'));
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

function approveAction(userId, code, data, messages, errors, enableTotpModal) {
    const approveData = [{name: 'account', value: userId}];
    if (data != null && data.length > 0) approveData.push(...data);
    return fetch(`${config.apiUrl}/auth/approve/${code}`, util.postWithAuth(approveData))
        .then(util.handleCrudResponse(messages, errors, enableTotpModal))
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

function createUser(user, messages, errors) {
    return fetch(`${config.apiUrl}/users`, util.putWithAuth(user)).then(util.handleCrudResponse(messages, errors));
}

function updateUser(user, messages, errors) {
    return fetch(`${config.apiUrl}/users/${user.name}`, util.postWithAuth(user)).then(util.handleCrudResponse(messages, errors));
}

function deleteUser(userId, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}`, util.deleteWithAuth()).then(util.handleCrudResponse(messages, errors));
}

function changePassword(request, messages, errors) {
    return fetch(`${config.apiUrl}/me/changePassword`, util.postWithAuth(request)).then(util.handleCrudResponse(messages, errors));
}

function adminChangePassword(userId, request, messages, errors) {
    return fetch(`${config.apiUrl}/users/${userId}/changePassword`, util.postWithAuth(request)).then(util.handleCrudResponse(messages, errors));
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
                    // username or password was incorrect
                    if (typeof errors !== 'undefined') {
                        const message = messages['err_name_notFound'];
                        const err = {field: 'name', msg: message};
                        errors.add(err);
                    }
                    console.log('handleAuthResponse: received 404, user not found: '+JSON.stringify(data));

                } else if (response.status === 422) {
                    // console.log('handleAuthResponse: received 422: '+JSON.stringify(data));
                    const errs = util.setValidationErrors(data, messages, errors, false);
                    // console.log('handleAuthResponse: received errors: '+JSON.stringify(errors));
                    if (errs !== null && errs.length > 0) {
                        const totpInvalidError = errs.indexOf('err_totpToken_invalid');
                        if (totpInvalidError !== -1) {
                            console.log('handleAuthResponse: rejecting with totpInvalid');
                            return Promise.reject(errs[totpInvalidError]);
                        }

                        const totpRequiredError = errs.indexOf('err_totpToken_required');
                        if (totpRequiredError !== -1) {
                            console.log('handleAuthResponse: rejecting with totpRequired');
                            return Promise.reject(errs[totpRequiredError]);
                        }
                    }
                    // console.log('handleAuthResponse: plain old rejecting with errors: '+JSON.stringify(errs));
                    return Promise.reject(errs);
                }
                const error = (data && data.message) || response.statusText;
                return Promise.reject(error);
            }
            return data;
        });
    };
}
