const express = require('express');
const dotenv = require('dotenv');
const cookieParser=require('cookie-parser');
const connectDB = require('./config/db');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const {xss} = require('express-xss-sanitizer');
const rateLimit=require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

dotenv.config({ path: './config/config.env' });
connectDB();

const restaurants = require('./routes/restaurants');
const reserves = require('./routes/reserves');
const auth = require('./routes/auth');
const limiter=rateLimit({
    windowMs:10*60*1000,
    max:100
})

const app = express();

const swaggerOptions={
    swaggerDefinition:{
        openapi:'3.0.0',
        info:{
            title: 'Library API',
            version: '1.0.0',
            description: 'A simple Express Restaurant API'
        },
        servers:[
            {
                url: process.env.HOST + ':' + PORT + '/api/v1' 
            }
        ],
    },
    apis:['./routes/*.js'],
}
const swaggerDocs = swaggerJsDoc(swaggerOptions);

app.use(express.json());
app.use(mongoSanitize());
app.use(cookieParser());
app.use(helmet());
app.use(xss());
app.use(hpp());
app.use(cors());
app.use(limiter);
app.use('/api-docs',swaggerUI.serve, swaggerUI.setup(swaggerDocs));
app.use('/api/v1/restaurants', restaurants);
app.use('/api/v1/auth',auth);
app.use('/api/v1/reserves',reserves);


const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, console.log('Server running in', process.env.NODE_ENV, ' mode on port ', PORT));

process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});