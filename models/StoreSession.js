"use strict"

module.exports = class StoreSession {
    constructor(response = null) {
        if (response === null) console.error(`you construct new Store Session with null response object`);
        else {
            this.sessionTime = new Date();
            this.response = response;
        }
    }
}

