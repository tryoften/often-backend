var path = require('path');


module.exports = {
  port: process.env.PORT || '8080',

  /* Secret is used by sessions to encrypt the cookie */
  secret: 'AIzaSyDBCtKaA-7DZeMXfSkIG_C5gDCeQyucc-E',

  logPath: process.env.LOG_PATH || './',

  /*
    dataBackend can be 'datastore', 'cloudsql', or 'mongodb'. Be sure to
    configure the appropriate settings for each storage engine below.
    Note that datastore requires no additional configuration.
  */
  dataBackend: 'datastore',

  /*
    This can also be your project id as each project has a default
    bucket with the same name as the project id.
  */
  cloudStorageBucket: 'acoustic-rider-104419',

  /*
    This is the id of your project in the Google Developers Console.
  */
  gcloud: {
    projectId: 'acoustic-rider-104419'
  },

  /*
    The client ID and secret can be obtained by generating a new Client ID for
    a web application on Google Developers Console.
  */
  oauth2: {
    clientId: 'your-client-id-here',
    clientSecret: 'your-client-secret-here',
    redirectUrl: process.env.OAUTH2_CALLBACK || 'http://localhost:8080/oauth2callback',
    scopes: ['email', 'profile']
  },

  mysql: {
    user: 'your-mysql-user-here',
    password: 'your-mysql-password-here',
    host: 'your-mysql-host-here'
  },

  mongodb: {
    url: 'your-mongo-url-here',
    collection: 'your-mongo-collection-here'
  },

  FirebaseConfig: {
	  BaseURL: 'https://asterix.firebaseio.com'
  },

  ElasticSearchConfig: {
	  BaseURL: 'http://1b3ec485645a42fe201d499442877842.us-east-1.aws.found.io:9200'
  },

  FireQueueConfig: {
    numWorkers: 2,
    sanitize: false,
    suppressStack: true
  }

};



