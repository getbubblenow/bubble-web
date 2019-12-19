let landingPage = null;
export function getLandingPage () { return landingPage; }
export function setLandingPage (page) { landingPage = page; }
export function resetLandingPage () { landingPage = null; }

export function currentUser() {
    let userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
}

export function userLoggedIn() { return !!currentUser(); }

export function authHeader() {
    // return authorization header with jwt token
    let user = currentUser();

    if (user && user.token) {
        return { 'X-Bubble-Session': user.token };
    } else {
        return {};
    }
}

export function getWithAuth() {
    return {
        method: 'GET',
        headers: authHeader()
    };
}

function entityWithAuth(method, obj) {
    console.log("entityWithAuth("+method+"): obj="+obj+" (type="+(typeof obj)+")");
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
}

export function postWithAuth(obj) { return entityWithAuth('POST', obj); }

export function putWithAuth(obj) { return entityWithAuth('PUT', obj); }

export function deleteWithAuth() {
    return {
        method: 'DELETE',
        headers: authHeader()
    };
}

export function handleBasicResponse(response) {
    return response.text().then(text => {
        const data = text && JSON.parse(text);
        if (!response.ok) {
            const error = (data && data.message) || response.statusText;
            return Promise.reject(error);
        }
        return data;
    });
}

export function handleCrudResponse(messages, errors) {
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
}

export function setValidationErrors(data, messages, errors) {
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
}