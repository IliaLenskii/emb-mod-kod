'use strict';


if(!global.hasOwnProperty('KServerApi'))
    global.KServerApi = {};

global.KServerApi.RootPath = __dirname;


global.KServerApi.pluginProduction = (function() {
    var procENV = process.env;
    var procExArg = process.execArgv || [];

    if(!procENV)
        return true;

    if(procENV['NODE_ENV'] === 'production')
        return true;


    var dbm = procExArg.filter(function(el, i, arr){

        if(!el)
            return false;

            return (el === '--inspect');
    });

    if(dbm.length > 0)
	return false;

    return true;
})();

global.sessTimers = {};

const http = require('http')
    , url = require('url')
    , express = require('express')
    , fs = require('fs')
    , async = require('async')
    , path = require('path')
    , util = require('util')
    , eventEmitter = require('events') //.EventEmitter
    , handlebars = require('express-handlebars')
    , i18n = require("i18n")
    , mongoose = require('mongoose')
    , bodyParser = require('body-parser')
    , log = require('./libs/winston-init')(module)
    , session = require('express-session')
    , cookieParser = require('cookie-parser')
    , PGPool = require('pg').Pool
    , xlsxPop = require('xlsx-populate')
;

/*
 * Тестирование
 */
const testClass = require('./libs/test-class');

/*
var multer = require('multer'); // v1.0.5
var upload = multer({'dest': './uploads/'});

var cpUpload = upload.fields([{'name': 'upl', maxCount: 1}]);

app.post('/form-action', cpUpload, function(req, res){ 
*/


/*
var em = new eventEmitter.EventEmitter();
em.on('myEvt', () => {
});

//Событие генерируется для объекта методом EventEmitter.emit() при выполнении некоторого условия:
en.emit('data', ...args);

function myClass(){}

// Наследование метода прототипа другого класса
util.inherits(myClass, EventEmitter /-*require('events').EventEmitter*-/);
*/

const app = express();

app.disable('x-powered-by');


i18n.configure({
     locales:['ru-RU', 'en-US']
    ,defaultLocale: 'ru-RU'
    ,objectNotation: true
    ,directory: __dirname +'/locales'
 });

/*
 333101000 - Подсистема классификации НД

 функционалы

 333101101 - Администратор (общее администрирование)
 333101102 - Разработчик (права Эксперта + изменение значений классификаторов)
 333101103 - Эксперт (специалист с правами проведения процедуры классификации)
 333101104 - Отчеты (пользователь с правами чтения отчетов по классификациям)

 */

/*
* Пользовательские настройки и библиотеки
*/

const userConf = require(__dirname +'/config');
const userConfSite = userConf['site'];

const baseUseRoutes = require('./routes/base-use');
const baseGETRoutes = require('./routes/base-get');
const basePOSTRoutes = require('./routes/base-post');

const panGetPostRoutes = require('./routes/pan/pan');

const baseUSEHTTErrRoutes = require('./routes/base-use-errors-http');
const baseUSEHTTAccessError = require('./routes/base-use-access-error');

const handlebars_helpers = require('./libs/helpers');
const otherFunc = require('./libs/other');

const pluginRoute = global.KServerApi.Route;

const templatesPath = (__dirname +'/views');

/**
 * Проверяем существование dbconf.json (настройки базы),
 * если нет - создаем из userConfSite['db']
 */
const fname = global.KServerApi.StoragePath + '/dbconf.json';
let existconf = fs.existsSync( fname );
let DBs = existconf ? require( fname ) : userConfSite['db'];
const DBParr = DBs.mongodb;
const PGParr = DBs.pg;
if ( DBs.outline ) {
    DBs.servers = {
        remarksSubsystem: {
            host: DBs.outline.host,
            protocol: DBs.outline[ 'outline-protocol' ],
            port: DBs.outline.port
        }
    };
    delete DBs.outline;
    fs.unlinkSync( fname );
    existconf = false;
}
global.kwServers = DBs.servers;

if ( !existconf )
    fs.writeFile( fname, JSON.stringify( DBs ) );

/**
 * PostgreSQL
 */
const pgpool = new PGPool( PGParr );

/*
Чтобы убрать:

DeprecationWarning: Mongoose: mpromise (mongoose's default promise library) is deprecated, plug in your own promise library instead: mongoosejs.com/docs/promises.html
 */
mongoose.Promise = global.Promise;

if(!global.KServerApi.pluginProduction)
    mongoose.set('debug', true /*function (collectionName, method, query, doc, options) {

        console.log('mongo collection: %s method: %s', collectionName, method);
    }*/);

/**
 * Если в DBParr[ 'host' ] указано несколько хостов через запятую, то коннект вида
 * mongodb://user:password@xxx1.mongo.somehost.com:27017,xxx2.mongo.somehost.com:27017/database
 */
var moDB = ~DBParr[ 'host' ].indexOf( ',' ) // multiple connections?
                ? mongoose.createConnection( 'mongodb://'
                        + ( DBParr[ 'opts' ][ 'user' ] ? DBParr[ 'opts' ][ 'user' ] + ':' + DBParr[ 'opts' ][ 'pass' ] + '@' : '' )
                        + DBParr[ 'host' ] + '/' + DBParr['database']
                    , DBParr['opts'] )
                : mongoose.createConnection( DBParr['host'], DBParr['database'], DBParr['port'], DBParr['opts'] );

moDB.on('error', (err) => {

    console.error('Mongoose. '+ err);
});

moDB.on('connected', () => {

    if(!global.KServerApi.pluginProduction)
        console.log('Mongoose default connection');
});

moDB.on('disconnected', () => {

    if(!global.KServerApi.pluginProduction)
        console.log('Mongoose default connection disconnected'); 
});

moDB.on('open', () => {

    if(!global.KServerApi.pluginProduction)
        console.log('Mongoose default open');

    global.KServerApi.mongooseModels = require('./libs/mongoose-model/model-schema')(moDB);
});


app.engine('.html', handlebars({
     'defaultLayout': 'main'
    ,'layoutsDir': templatesPath
    ,'partialsDir': templatesPath
    ,'extname': '.html'
    ,'helpers': handlebars_helpers
}));

app.set('view engine', '.html');
app.set('views', templatesPath);

app.set('view cache', global.KServerApi.pluginProduction);
app.set('port', global.KServerApi.SocketPath);

app.use('/'+ pluginRoute, express.static(__dirname +'/public'));


app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.urlencoded({extended: true, limit: '100mb', parameterLimit: 1000000}));

app.use(cookieParser(userConfSite['secretKeyCookie']));


app.use(session({
    resave: false
    ,saveUninitialized: true
    ,secret: userConfSite['secretKeySession']
    ,httpOnly: true
    ,mongoUsrID: null
    ,cookie: { 'expires': new Date( Date.now() + userConfSite['sessionTimeout'] ), 'maxAge': userConfSite['sessionTimeout'] }
    //,store: new mongoStore({
    //    url: config.db,
    //    collection : 'sessions'
    //})
}));

/**
 * DBs
 */
app.use((req, res, next) => {

    if(moDB._hasOpened) {

        req.moDB = moDB;
        req.mongooseModels = global.KServerApi.mongooseModels;

    }

    /**
     * Работа с PostgreSQL
     */
    pgpool.connect( err => {
        if ( err && err.name ) console.log( 'Postgres connect error', err )
    });
    req.pg = {
        query: ( sql, fn ) => {
            pgpool.query( sql, ( err, result ) => {
                if ( err && err.name ) {
                    console.log( 'SQL query error', err, 'sql not execute', sql );
                    if ( fn ) fn( err );
                }
                else if ( fn ) fn( err, result );
            });
        },
        init: () => {
            req.pg.query( 'SELECT * FROM actions', ( err, result ) => {
                if ( err && err.name ) return err;
                let actions = result.rows.map( a => a.action );
                Object.keys( userConf[ 'userEvents' ] )
                    .filter( ue => !~actions.indexOf( ue ) )
                    .forEach( ue => req.pg.query( `INSERT INTO actions (action, title) VALUES ('${ ue }', '${ i18n.__( ue ) }')` ) );
            });
        },
        end: () => pgpool.end()
    };
    req.pg.init();

    next();
});

/**
 * Hook
 */
app.use( require( __dirname + '/libs/hook' ) );

/*
* Routes
* Global .use()
*/
app.use('/'+ pluginRoute, baseUseRoutes);

/*
* Routes
* Global .get()
*/
app.use('/'+ pluginRoute, baseGETRoutes);


/*
* TEST routes .get()
*/
if(!global.KServerApi.pluginProduction)
    app.use('/'+ pluginRoute, require('./routes/test-tmp/get-method'));

/*
* Routes
* Global .post()
*/
app.use('/'+ pluginRoute, basePOSTRoutes);


/*
* Подсистема Аналитики
* Pan
*/
app.use('/'+ pluginRoute +'/pan', panGetPostRoutes);


/*
 * 
 */

baseUSEHTTAccessError(app);

/*
 * Routes
 * Global use-errors
 */
baseUSEHTTErrRoutes(app);


/*
 app.param('userId', function(req, res, next, id) {
    User.get(id, function(err, user) {
        if (err) return next(err);
        if (!user) return next(new Error('failed to find user'));
        req.user = user;
        next();
    });
});
 */


app.listen(app.get('port'), function() {

    //log.debug('start httpd '+ app.get('port'));
});
