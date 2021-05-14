const express = require('express');
const app = express();
var cors = require('cors')
require('dotenv/config');

app.set('port', process.env.PORT || 3000);

app.use(express.urlencoded({ extended: true }));
app.use(cors());

const ligaRoute = require('./routes/liga');

app.use('/liga', ligaRoute);

app.get('/',(req, res)=>{
    res.send('We are on home');
});

app.listen(app.get('port'),() =>{
    console.log(`Server on port ${app.get('port')}`)
});


