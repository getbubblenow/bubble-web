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

export function postWithAuth(obj) {
    return {
        method: 'POST',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(obj)
    };
}

export function putWithAuth(obj) {
    return {
        method: 'PUT',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(obj)
    };
}

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

export function handleCrudResponse(response) {
    return response.text().then(text => {
        const data = text && JSON.parse(text);
        if (!response.ok) {
            if (response.status === 404) {
                // set error from API
                // todo: show nicer error message
                console.log('handleResponse: received 404, user not found: '+JSON.stringify(data));

            } else if (response.status === 422) {
                // set error from API
                // todo: load auth error messages, find text for error message
                console.log('handleResponse: received 422, error: '+JSON.stringify(data));
            }

            const error = (data && data.message) || response.statusText;
            return Promise.reject(error);
        }
        return data;
    });
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
    }
}