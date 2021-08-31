const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
const Handlebars = require('handlebars');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const MongoStore = require('connect-mongo');
const cache = require('express-cache-ctrl');
const dotenv =  require('dotenv');
const cors = require('cors');
const passport = require('passport');
const path = require('path');

const publicPath = path.resolve(__dirname,'public');
const port = process.env.PORT || 8080;

const connectDB = require('./config/db-connection');

dotenv.config({ path: './config/config.env' });

//Connecting to the Database
connectDB();

app.use(cors()); //for cross-origin-resourses
app.use(express.json({limit: '50mb'}));
app.use(express.static(publicPath));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(session({
  secret: "keyword",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: 2592000000
  },
  store: MongoStore.create({ 
    mongoUrl: process.env.MONGO_URI,
    mongooseConn: mongoose.connection 
  })
}));

// =============PASSPORT============
/**
  * Passport middleware
  * require passport config
  */ 
 require('./config/passport')(passport);
 app.use(passport.initialize());
 app.use(passport.session());
 
 app.use(flash());

app.engine('hbs', exphbs({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: './views/layouts',
    partialsDir: './views/partials',
    /**
     * This is to allow the new version of express-handlebars
     * to be able to view information from the database
     */
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    /**
     * Personal exphbs helpers to do specific functions
     */
    helpers: {
       is: function(a,operator,b,options){
            switch(operator){
              case '==':
                return (a == b)? options.fn(this):options.inverse(this);
              case '!=':
                return (a != b)? options.fn(this):options.inverse(this);
              case '||':
                return (a || b)? options.fn(this):options.inverse(this);
              case '&&':
                return (a && b)? options.fn(this):options.inverse(this);
              case '<':
                return (a < b)? options.fn(this):options.inverse(this);
              case '>':
                return (a > b)? options.fn(this):options.inverse(this);
              case '<=':
                return (a <= b)? options.fn(this):options.inverse(this);
              case '>=':
                return (a >= b)? options.fn(this):options.inverse(this);
              case '===':
                return (a === b)? options.fn(this):options.inverse(this);
              case '!==':
                return (a !== b)? options.fn(this):options.inverse(this);
              default:
                return options.inverse(this);
            }
      },
      spliter: (a,b,c) => {
        if(a == null || a == undefined) return 0;
        // if(typeof(a) != 'number') return a;
        a = a.toString();
        b = parseInt(b);
        if(a.length > b){
            var i = 0, a_array = [];
            a = a.split('').reverse().join('');
            while(i < a.length){
                a_array.push(a.slice(i,i+b).split('').reverse().join(''));
                i += b;
            }
            return a_array.reverse().join(c);
        }

        return a
      },
      hypenator: (a) => {
        a = a.split(' ');
        a = a.join('-');
        a = a.replace(/\(|,|:|\/|\[|\]|\\|\.|\)|\`|\~|\'|\"|\?|\’|\‘|!/g,'');
        return a;
      },
      capitalize: (a) => {
        a = a.replace(/\(|,|:|\/|\[|\]|\\|\.|\)|\`|\~|\'|\"|\?|\’|\‘/g,'');
        a = a.split(' ');
        a = a.map(b => {
            return b[0].toUpperCase() + b.substring(1, b.length);
        })
        return a.join(' ');
      },
      stringIt: (a)=>{
          return JSON.stringify(a);
      },
      firstdate: (a)=>{
        return a = a[0].date;
      },
      firsttime: (a)=>{
        return a = a[0].time;
      }
    }
}));

app.set('view engine', 'hbs');

app.use('/', cache.disable(), require('./routes/index'));
app.use('/admin', cache.disable(), require('./routes/admin'));

app.listen(port, ()=>{ console.log(`Server running on port: ${port}`) });