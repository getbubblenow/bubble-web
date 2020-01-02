let landingPage = null;

export const util = {
    getLandingPage: function () { return landingPage; },
    setLandingPage: function (page) { landingPage = page; },
    resetLandingPage: function () { landingPage = null; },

    currentUser: function() {
        let userJson = localStorage.getItem('user');
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
            headers: authHeader()
        };
    },

    entityWithAuth: function(method, obj) {
        if (typeof obj === 'undefined' || obj === null || obj === 'undefined') {
            return {
                method: method,
                headers: { ...authHeader(), 'Content-Type': 'application/json' }
            };
        } else {
            return {
                method: method,
                headers: { ...authHeader(), 'Content-Type': 'application/json' },
                body: JSON.stringify(obj)
            };
        }
    },

    postWithAuth: function(obj) { return entityWithAuth('POST', obj); },

    putWithAuth: function(obj) { return entityWithAuth('PUT', obj); },

    deleteWithAuth: function() {
        return {
            method: 'DELETE',
            headers: authHeader()
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
                        setValidationErrors(data, messages, errors);
                    }

                    const error = (data && data.message) || response.statusText;
                    return Promise.reject(error);
                }
                return data;
            });
        }
    },

    setValidationErrors: function(data, messages, errors) {
        for (let i=0; i<data.length; i++) {
            if (data[i].messageTemplate) {
                const parts = data[i].messageTemplate.split(/[._]+/);
                if (parts.length === 3 && parts[0] === 'err') {
                    const field = parts[1];
                    const messageTemplate = data[i].messageTemplate.replace(/\./g, '_');
                    const message = messages.hasOwnProperty(messageTemplate) ? messages[messageTemplate] : '???'+messageTemplate;
                    errors.add({field: field, msg: message});
                    console.log('>>>>> field '+field+' added error: '+message+', errors='+JSON.stringify(errors));
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
};
