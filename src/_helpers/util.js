/**
 * Copyright (c) 2020 Bubble, Inc.  All rights reserved.
 * For personal (non-commercial) use, see license: https://bubblev.com/bubble-license/
 */
import config from 'config';
import { ErrorBag } from 'vee-validate';

let landingPage = null;
let skipRegistrationSubmission = false;

export const util = {
    USER_KEY: 'user',
    getLandingPage: function () { return landingPage; },
    setLandingPage: function (page) { landingPage = page; },
    resetLandingPage: function () { landingPage = null; },

    setSkipRegistration: function () { skipRegistrationSubmission = true; },
    checkSkipRegistration: function () {
        const skip = skipRegistrationSubmission;
        skipRegistrationSubmission = false;
        return skip;
    },

    currentUser: function() {
        const userJson = localStorage.getItem(util.USER_KEY);
        return userJson ? JSON.parse(userJson) : null;
    },

    userLoggedIn: function() { return !!util.currentUser(); },

    logout: function() { return localStorage.clear(); },

    authHeader: function() {
        // return authorization header with jwt token
        let user = util.currentUser();

        if (user && user.token) {
            return { 'X-Bubble-Session': user.token };
        } else {
            return {};
        }
    },

    getWithAuth: function() {
        return {
            method: 'GET',
            headers: util.authHeader()
        };
    },

    entityNoAuth: function(method, obj) {
        if (typeof obj === 'undefined' || obj === null || obj === 'undefined') {
            return {
                method: method,
                headers: { 'Content-Type': 'application/json' }
            };
        } else {
            return {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(obj)
            };
        }
    },

    postNoAuth: function(obj) { return util.entityNoAuth('POST', obj); },
    putNoAuth: function(obj) { return util.entityNoAuth('PUT', obj); },

    jsonWithAuth: function(method, json) {
        if (typeof json === 'undefined' || json === null || json === 'undefined') {
            return {
                method: method,
                headers: { ...util.authHeader(), 'Content-Type': 'application/json' }
            };
        } else {
            return {
                method: method,
                headers: { ...util.authHeader(), 'Content-Type': 'application/json' },
                body: json
            };
        }
    },
    entityWithAuth: function(method, obj) {
        if (typeof obj === 'undefined' || obj === null || obj === 'undefined') {
            return {
                method: method,
                headers: { ...util.authHeader(), 'Content-Type': 'application/json' }
            };
        } else {
            return {
                method: method,
                headers: { ...util.authHeader(), 'Content-Type': 'application/json' },
                body: JSON.stringify(obj)
            };
        }
    },

    postWithAuth: function(obj) { return util.entityWithAuth('POST', obj); },
    postJsonWithAuth: function(json) { return util.jsonWithAuth('POST', json); },

    postFileWithAuth: function(file) {
        return {
            method: 'POST',
            headers: { ...util.authHeader() },
            body: file
        }
    },

    putWithAuth: function(obj) { return util.entityWithAuth('PUT', obj); },
    putJsonWithAuth: function(json) { return util.jsonWithAuth('PUT', json); },

    deleteWithAuth: function() {
        return {
            method: 'DELETE',
            headers: util.authHeader()
        };
    },

    handleBasicResponse: function(response) {
        return response.text().then(text => {
            const data = text && JSON.parse(text);
            if (!response.ok) {
                const error = (data && data.message) || response.statusText;
                return Promise.reject(error);
            }
            return data;
        });
    },

    handleCrudResponse: function(messages, errors, enableTotpModal) {
        return function (response) {
            return response.text().then(text => {
                const data = text && JSON.parse(text);
                if (!response.ok) {
                    if (response.status === 404) {
                        // todo: show nicer error message
                        console.log('handleCrudResponse: received 404: ' + JSON.stringify(data));

                    } else if (response.status === 422) {
                        // console.log('handleCrudResponseA: errors='+JSON.stringify(errors));
                        const validationErrors = util.setValidationErrors(data, messages, errors, enableTotpModal);
                        // console.log('handleCrudResponseB: errors='+JSON.stringify(errors)+', validationErrors='+JSON.stringify(validationErrors));
                        return Promise.reject(validationErrors);
                    }

                    const error = (data && data.message) || response.statusText;
                    return Promise.reject(error);
                }
                return data;
            });
        }
    },

    handlePlaintextResponse: function(messages, errors) {
        return function (response) {
            return response.text().then(text => {
                if (!response.ok) {
                    if (response.status === 404) {
                        // todo: show nicer error message
                        const errData = JSON.parse(''+text);
                        console.log('handleCrudResponse: received 404: ' + text);

                    } else if (response.status === 422) {
                        const errData = JSON.parse(''+text);
                        console.log('handleCrudResponse: received 422, error: ' + text);
                        util.setValidationErrors(errData, messages, errors);
                    }

                    const error = (data && data.message) || response.statusText;
                    return Promise.reject(error);
                }
                return text;
            });
        }
    },

    setValidationErrors: function(data, messages, errors, enableTotpModal) {
        const errs = [];
        for (let i=0; i<data.length; i++) {
            const messageTemplate = data[i].messageTemplate.replace(/\./g, '_');
            if (messageTemplate) {
                errs.push(messageTemplate);
                const parts = messageTemplate.split(/[_]+/);
                if (parts.length === 3 && parts[0] === 'err') {
                    const field = parts[1];
                    const message = messages[messageTemplate];
                    const err = {field: field, msg: message};
                    if (typeof errors !== 'undefined') {
                        errors.add(err);
                    } else {
                        // console.log('setValidationErrors: errors is undefined, not adding: '+JSON.stringify(err));
                    }
                    if (messageTemplate === 'err_logout_noSession') {
                        console.log('setValidationErrors: detected err_logout_noSession, logging out');
                        util.logout();
                        localStorage.clear();
                    } else if (messageTemplate === 'err_totpToken_invalid' || messageTemplate === 'err_totpToken_required') {
                        if (typeof enableTotpModal !== 'undefined' && enableTotpModal === false) {
                            // console.log('setValidationErrors: totp required, but not raising modal');
                            window.showTotpModal = false;
                        } else {
                            // console.log('received '+messageTemplate+' -- setting window.showTotpModal = true');
                            window.showTotpModal = true;
                        }
                    } // else {
                //         console.log('setValidationErrors: nothing special: '+messageTemplate);
                //     }
                //     console.log('>>>>> field '+field+' added error: '+message+', errors='+JSON.stringify(errors));
                // } else {
                //     console.log('>>>>> data item did not contain a valid error: '+JSON.stringify(data[i]));
                }
            }
            // todo: else add "global" error message for unrecognized/non-field error
        }
        return errs;
    },

    checkLoading: function(loadingObject, store) {
        return function() {
            for (const key in loadingObject) {
                if (loadingObject.hasOwnProperty(key)) {
                    if (loadingObject[key] === true) {
                        // console.log('checkLoading('+store+'): returning true because key='+key+' was true');
                        return true;
                    }
                }
            }
            // console.log('checkLoading('+store+'): returning false');
            return false;
        };
    },

    userHasLocale: function(user) {
        return !(typeof user === 'undefined' || user === null || !user.hasOwnProperty('locale') || user.locale === null || user.locale === '' || user.locale === 'detect');
    },

    jsLocale: function (user, detectedLocale) {
        const loc = util.userHasLocale(user) ? user.locale : detectedLocale;
        return loc === null ? null : loc.replace('_', '-').toLowerCase();
    },

    stripProtocolFromUrl: function (url) {
        if (url.startsWith('http://')) return url.substring('http://'.length);
        if (url.startsWith('https://')) return url.substring('https://'.length);
        return url;
    },

    unknownMessage: function (msg) { return config.production ? '' : '???'+msg; },

    messageNotFoundHandler: {
        get: function (target, name) {
            if (typeof name === 'undefined') return util.unknownMessage('undefined');
            if (name === null) return util.unknownMessage('null');
            if (name === '') return util.unknownMessage('empty');
            const checkExists = name.toString().startsWith("!");
            const index = checkExists ? name.toString().substring(1) : name;
            if (target.hasOwnProperty(index)) return checkExists ? true : target[index];
            const altName = index.toString().replace(/\./g, '_');
            if (target.hasOwnProperty(altName)) return checkExists ? true : target[altName];
            return checkExists ? false : util.unknownMessage(name.toString());
        }
    },

    addMessages: function(existing, updates) {
        return new Proxy(Object.assign({}, existing, updates), util.messageNotFoundHandler);
    },

    validateAccount: function (vue)  {
        vue.me = vue.$route.path.startsWith('/me/');
        if (vue.me) {
            vue.linkPrefix = '/me';
            if (vue.currentUser === null) {
                console.warn('validateAccount: /me requested but no currentUser, sending to home page');
                vue.$router.push('/');
                return false;

            } else {
                vue.userId = vue.currentUser.uuid;
            }

        } else if (vue.currentUser.admin !== true) {
            console.warn('validateAccount: not admin and path not /me, sending to /me ...');
            vue.$router.push('/me');
            return false;

        } else if (typeof vue.$route.params.id === 'undefined' || vue.$route.params.id === null) {
            console.warn('validateAccount: no id param found, sending to accounts page');
            vue.$router.push('/admin/accounts');
            return false;

        } else {
            vue.userId = vue.$route.params.id;
            vue.linkPrefix = '/admin/accounts/' + vue.userId;
        }
        this.isMe = (this.me === true || util.currentUser().uuid === this.userId || util.currentUser().name === this.userId);
        return true;
    },

    setInboundAction: function (route) {
        if (route.query.action) {
            const inboundAction = {
                actionType: route.query.action
            };
            if (inboundAction.actionType === 'invalid') {
                inboundAction.status = 'invalid';
                inboundAction.alertType = 'alert-danger';
            } else {
                if (route.query.ok) {
                    inboundAction.status = 'success';
                    inboundAction.alertType = 'alert-success';
                } else {
                    inboundAction.status = 'failure';
                    inboundAction.alertType = 'alert-danger';
                }
            }
            return inboundAction;
        }
        return null;
    }

};
