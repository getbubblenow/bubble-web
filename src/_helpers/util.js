let landingPage = null;

export const util = {
    USER_KEY: 'user',
    getLandingPage: function () { return landingPage; },
    setLandingPage: function (page) { landingPage = page; },
    resetLandingPage: function () { landingPage = null; },

    currentUser: function() {
        const userJson = localStorage.getItem(util.USER_KEY);
        return userJson ? JSON.parse(userJson) : null;
    },

    userLoggedIn: function() { return !!util.currentUser(); },

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

    handleCrudResponse: function(messages, errors) {
        return function (response) {
            return response.text().then(text => {
                const data = text && JSON.parse(text);
                if (!response.ok) {
                    if (response.status === 404) {
                        // todo: show nicer error message
                        console.log('handleCrudResponse: received 404: ' + JSON.stringify(data));

                    } else if (response.status === 422) {
                        console.log('handleCrudResponse: received 422, error: ' + JSON.stringify(data));
                        util.setValidationErrors(data, messages, errors);
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

    setValidationErrors: function(data, messages, errors) {
        for (let i=0; i<data.length; i++) {
            const messageTemplate = data[i].messageTemplate.replace(/\./g, '_');
            if (messageTemplate) {
                const parts = messageTemplate.split(/[_]+/);
                if (parts.length === 3 && parts[0] === 'err') {
                    const field = parts[1];
                    const message = messages[messageTemplate];
                    errors.add({field: field, msg: message});
                    if (messageTemplate === 'err_totpToken_invalid') {
                        // console.log('received '+messageTemplate+' -- setting window.showTotpModal = true');
                        window.showTotpModal = true;
                    }
                //     console.log('>>>>> field '+field+' added error: '+message+', errors='+JSON.stringify(errors));
                // } else {
                //     console.log('>>>>> data item did not contain a valid error: '+JSON.stringify(data[i]));
                }
            }
            // todo: else add "global" error message for unrecognized/non-field error
        }
    },

    checkLoading: function(loadingObject) {
        return function() {
            for (const key in loadingObject) {
                if (loadingObject.hasOwnProperty(key)) {
                    if (loadingObject[key] === true) {
                        return true;
                    }
                }
            }
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
    }

};
