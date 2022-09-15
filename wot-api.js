/**
 * @class WotApi
 * @author FoobarIT
 * @description A Node.js wrapper for the World Of Tank API with no dependencies. 
 *              For more information, visit: https://developers.wargaming.net/. 
 *              This wrapper is not affiliated with Wargaming.net.
 *              #cfaitalarache
 * @public
 * @version 1.0.0
 * @license MIT
 * @kind class
 */

const https = require('https');
const querystring = require('querystring');

class WotApi {
    /**
     * @constructor
     * @param {string} applicationId - Your application ID.
     * @param {string} [region=na] - The region to use for the API.
     * @param {string} [apiPath=/wot] - The path to the API.
     * @param {boolean} [debug=false] - Whether or not to log debug messages.
     * @public
     * @returns {WotApi}
     */
    constructor(options) {
        this.applicationId = options.applicationId;
        this.region = options.region;
        this.apiPath = options.apiPath;
        this.debug = options.debug;
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
            stats: (account) => {
                if (typeof account === 'string') {
                    return new Promise((resolve, reject) => {
                        this.#getAccountID(account).then((data) => {
                            console.log(data)
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
                } else if (typeof account === 'number') {
                    return new Promise((resolve, reject) => {
                        this._request('account/info', {
                            account_id: account
                        }, (err, data) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(data.data[Object.keys(data.data)[0]]);
                            }
                        });
                    });
                }
            },
            tank_stats_list: (accountName) => {
                return new Promise((resolve, reject) => {
                    this.#getAccountID(accountName).then((data) => {
                        if (data.meta.count === 0) {
                            reject('Account not found');
                            return;
                        }
                        this._request('tanks/stats', {
                            account_id: data.data[0].account_id
                        }, (err, data) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(data.data);
                            }
                        });
                    }).catch((err) => {
                        reject(err);
                    });
                });
            },
            achievements: (accountName) => {
                return new Promise((resolve, reject) => {
                    this.#getAccountID(accountName).then((data) => {
                        if (data.meta.count === 0) {
                            reject('Account not found');
                            return;
                        }
                        this._request('account/achievements', {
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

    get tank_stats_list() {
        return {
            byName: (accountName) => {
                return new Promise((resolve, reject) => {
                    this.#getAccountID(accountName).then((data) => {
                        if (data.meta.count === 0) {
                            reject('Account not found');
                            return;
                        }
                        this._request('tanks/stats', {
                            account_id: data.data[0].account_id
                        }, (err, data) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(data.data);
                            }
                        });
                    }).catch((err) => {
                        reject(err);
                    });
                });
            },
            byID: (accountID) => {
                return new Promise((resolve, reject) => {
                    this._request('tanks/stats', {
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
        }
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