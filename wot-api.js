/**
 * @class WotApi
 * @author FoobarIT
 * @description A Node.js wrapper for the World Of Tank API with no dependencies. 
 *              For more information, visit: https://developers.wargaming.net/. 
 *              This wrapper is not affiliated with Wargaming.net.
 * @public
 * @version 1.0.10
 * @license MIT
 * @kind class
 */

const https = require('https');
const querystring = require('querystring');

class WotApi {
    /**
     * @constructor
     * @param {string} applicationId - Your application ID.
     * @param {string} [language=en] - The language to use for the API.
     * @param {string} [region=na] - The region to use for the API.
     * @param {string} [apiPath=/wot] - The path to the API.
     * @param {boolean} [debug=false] - Whether or not to log debug messages.
     * @public
     * @returns {WotApi}
     */
    constructor(applicationId, region = 'na', apiPath = '/wot', debug = false) {
        this.applicationId = applicationId;
        this.region = region;
        this.apiPath = apiPath;
        this.debug = debug;
    }

    ping() {
        return new Promise((resolve, reject) => {
            this._request('ping', {}, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    #getAccountID(accountName) {
        return new Promise((resolve, reject) => {
            this._request('account/list', {
                search: accountName
            }, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    #getClanID(clanName) {
        return new Promise((resolve, reject) => {
            this._request('clans/list', {
                search: clanName
            }, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    
    get account() {
        return {
            byName: (accountName) => {
                return new Promise((resolve, reject) => {
                    this.#getAccountID(accountName).then((data) => {
                        if (data.meta.count === 0) {
                            reject('Account not found');
                            return;
                        }
                        this._request('account/info', {
                            account_id: data.data[0].account_id
                        }, (err, data) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(data.data[Object.keys(data.data)[0]]);
                            }
                        });
                    }).catch((err) => {
                        reject(err);
                    });
                });
            },
            byID: (accountID) => {
                return new Promise((resolve, reject) => {
                    this._request('account/info', {
                        account_id: accountID
                    }, (err, data) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(data.data[Object.keys(data.data)[0]]);
                        }
                    });
                });
            }
        };
    };

    get clan() {
        return {
            byName: (clanName) => {
                return new Promise((resolve, reject) => {
                    this.#getClanID(clanName).then((data) => {
                        if (data.meta.count === 0) {
                            reject('Clan not found');
                            return;
                        }
                        this._request('clans/info', {
                            clan_id: data.data[0].clan_id
                        }, (err, data) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(data.data[Object.keys(data.data)[0]]);
                            }
                        });
                    }).catch((err) => {
                        reject(err);
                    });
                });
            },
            byID: (clanID) => {
                return new Promise((resolve, reject) => {
                    this._request('clans/info', {
                        clan_id: clanID
                    }, (err, data) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(data);
                        }
                    });
                });
            }
        };
    }

    getAccountStat(accountName, stats) {
        return new Promise((resolve, reject) => {
            this.#getAccountID(accountName).then((data) => {
                if (data.meta.count === 0) {
                    reject('Account not found');
                    return;
                }

                this._request('account/info', {
                    account_id: data.data[0].account_id
                }, (err, data) => {
                    if (err) {
                        reject(err);
                    } else {

                        resolve(data.data[Object.keys(data.data)[0]]);
                    }
                });
            }).catch((err) => {
                reject(err);
            });
        });
    }

    _request(method, params, callback) {
        params = params || {};
        

        const options = {
            host: 'api.worldoftanks.' + this.region ,
            path: this.apiPath + '/' + method + '/?application_id=' + this.applicationId + '&' + querystring.stringify(params)
        };

        if (this.debug) {
            console.log('Requesting: ' + options.host + options.path);
        }

        https.get(options, (res) => {
            if (this.debug) {
                console.log('Status: ' + res.statusCode);
            }

            if (res.statusCode !== 200) {
                callback('Status code: ' + res.statusCode);
                return;
            }

            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => {
                rawData += chunk;
            });
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(rawData);
                    callback(null, parsedData);
                } catch (e) {
                    callback(e);
                }
            });
        }).on('error', (e) => {
            callback(e);
        });
    }
}

module.exports = WotApi;