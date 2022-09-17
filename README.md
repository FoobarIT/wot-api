 
# WOT-API
A Node.js wrapper for the World Of Tank API with no dependencies. 
For more information, visit: https://developers.wargaming.net/. 
This wrapper is not affiliated with Wargaming.net.
### Why ? 
Several elements of this wrapper had been developed for personal use. Since I don't use the basic project anymore, I prefer to share it with the community if they want to use it.



## Usage
Install package

`npm i wot-api`

Get Started
```js
const WotApi = require('wot-api');
const wotClient = new WotApi({
    application_id: 'your application id',
    region: 'eu', // or 'na', 'asia', 'ru'
    apiPath: 'wot', // only wot is supported for now
    debug: false // default false 
});
// Get player stats
wotClient.account.stats(123456789 /*'KILLER_23'*/)
.then(console.log)
.catch(console.error);
```

## DOCS
## Namespace `account`:
| Namespace | Method | Description |
| --- | --- | --- |
| `stats` | `account.stat(...)` | Get data of the player. |
| `tank_stats_list` | `account.tank_stats_list(...)` | Get tanks list related to a account. |
| `achievements` | `account.achievements(...)` | Get achievements related to a account. |

**Account Stats**


```js
let data = await wotClient.account.stats(account_id: number)
// Or 
let data = await wotClient.account.stats(account_name: string)


```

**Account Tank Stats List**

```js
let data = await wotClient.account.tank_stats_list(account_id: number)
// Or
let data = await wotClient.account.tank_stats_list(account_name: string)
```

**Account Achievements**

```js
let data = await wotClient.account.achievements(account_id: number)
// Or
let data = await wotClient.account.achievements(account_name: string)
```




## Contributing  

Contributions are always welcome!  


## License  

[MIT](https://choosealicense.com/licenses/mit/)
 
