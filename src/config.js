const tenantName    = 'alekseyraspopovgmail';
const clientID      = '69c3cab5-8242-4e15-9500-01dc69122211';
const serverPort    = 3000;
const sqlUserName = 'alexras';
const sqlUserPass = '';
const sqlAddress = 'alexrassever.database.windows.net';
const sqlDBName = 'sever';
const iotHubConnectionString = '';
const mongoConnectionString = '';
const subscriptionID = '8880dae2-539e-41f4-82ba-1ba8a599414c';
const resourceGroupName = 'sever';
const streamAnalyticsName = 'sever';
const appID = '4392c740-877c-4558-9885-5a26a0cf336f';
const appKey = '';

module.exports.serverPort = serverPort;
module.exports.sqlUserName = sqlUserName;
module.exports.sqlUserPass = sqlUserPass;
module.exports.sqlAddress = sqlAddress;
module.exports.sqlDBName = sqlDBName;
module.exports.iotHubConnectionString = iotHubConnectionString;
module.exports.mongoConnectionString = mongoConnectionString;
module.exports.subscriptionID = subscriptionID;
module.exports.resourceGroupName = resourceGroupName;
module.exports.streamAnalyticsName = streamAnalyticsName;
module.exports.tenantName = tenantName;
module.exports.appID = appID;
module.exports.appKey = appKey;

module.exports.credentials = {
  identityMetadata: `https://login.microsoftonline.com/${tenantName}.onmicrosoft.com/.well-known/openid-configuration`, 
  clientID: clientID
};
