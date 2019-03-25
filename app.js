const express = require('express');
const hbs = require('hbs');
const request = require("request");
var app = express();

const port = process.env.PORT || 9000;


hbs.registerPartials(__dirname + "/views/partials")

app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/views'));

hbs.registerHelper('getCurrentYear', () => {
    return new Date().getFullYear();
})

hbs.registerHelper('message', (text) => {
    return text;
})

// app.use('/', (request, response, next) => {
//     var time = new Date().toString();
//     var log = (`${time}: ${request.method} ${request.url}`);
//     fs.appendFile('server.log', log + '\n', (error) => {
//         if(error) {
//             console.log("Unable to log message");
//         }
//     });
//     next();
// });

// app.use((request, response, next) => {
//      response.render('Message.hbs', {
//         title: 'Site is under maintenance',
//         year: new Date().getFullYear(),
//         message: 'This site is curerntly under maintenance'
//     });
// });

app.get('/', (request, response) => {
    response.render("Message.hbs", {
        name: 'Your Name',
        school: [
        'BCIT',
        'SFU',
        'UBC'
        ]
    })
})

app.get('/info', (request, response) => {
    response.render('info.hbs', {
        title: 'Info page',
        year: new Date().getFullYear(),
        welcome: 'Hello'
    })
})

app.get('/home', (request, response) => {
    response.render('home.hbs', {
        title: 'Home page',
        year: new Date().getFullYear(),
        welcome: 'Hello'
    });
});

app.get('/404', (request, response) => {
    response.send({
        error: 'Page not found'
    })
})

var getCity = (country) =>{
    return new Promise((resolve, reject) => { 
        request({
            url:`https://restcountries.eu/rest/v2/name/${country}?fullText=true`,
            json:true
        }, (error, response, body) => {
            if(error){
                reject("Cannot connect")
                //console.log("Cannot connect to google maps")
            }
            else if(body.hasOwnProperty('status')){
                reject(body.status, body.message)
                //console.log('Cannot find requested address')
            }
            else if(body[0].hasOwnProperty('name')){
                resolve({
                    city:body[0].capital
                })
            }
            else{
                reject("UNKNOWN ERROR HAS OCCURRED (1)")
            }
        })
    })
}

var getWeather = (city) =>{
    return new Promise((resolve, reject) => {
        request({
            url:`http://api.openweathermap.org/data/2.5/weather?q=${city}guvubjh&APPID=7f253b3f0415a60df2a06fad4561a16b&units=imperial`,
            json:true
        }, (error, response, body) =>{
            if(error){
                reject("Cannot connect to weather")
            }
            else if(body.cod == 200){
                resolve({
                    city:body.name,
                    temp:body.main.temp,
                    des:body.wind.speed
                })
            }
            else{
                reject("UNKNOWN ERROR HAS OCCURRED (2)")
             }
        })
    })
}


var weather = undefined
getCity("Canada").then((result) => {
    return getWeather(result.city).then((result) => {
    weather = result.temp
}).catch((error) => {
    weather = error
})
})


app.get('/weather', (request, response) => {
    response.render('weather.hbs', {
        title: 'Weather page',
        year: new Date().getFullYear(),
        welcome: 'Hello',
        temp: weather
    })
})


app.listen(port, () => {
    console.log('Server is up on the port ${port}')
})