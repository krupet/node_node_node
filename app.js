const express = require('express');
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient
const path = require('path')
const ObjectID = require('mongodb').ObjectID;

const app = express();
const port = 8000;

app.set('view engine', 'ejs')

app.use(express.json())
app.use(express.urlencoded({extended: true}))

const viewsDir = path.join(__dirname, 'views')
app.use(express.static(viewsDir))
app.use(express.static(path.join(__dirname, './public')))
app.use(express.static(path.join(__dirname, './weights')))
app.use(express.static(path.join(__dirname, './dist')))

app.listen(port, () => {
    console.log('listen port 8000');
})

app.use(bodyParser.urlencoded({extended: true}))

MongoClient.connect('mongodb://localhost:27017/data', {useUnifiedTopology: true})
    .then(client => {
        const db = client.db('data')
        const quotesCollection = db.collection('expressions')

        app.get('/', (req, res) => res.sendFile(path.join(viewsDir, 'index.html')))

        app.post('/data', (req, res) => {
            const payload = JSON.parse(req.body.data)
            payload._id = new ObjectID()
            quotesCollection.insertOne(payload)
                .then(result => { console.log("saved") })
                .catch(error => console.error(error))
        })

        app.get('/quotes', (req, res) => {
            db.collection('quotes').find().toArray()
                .then(results => {
                    res.render('analitics.ejs', {quotes: results})
                })
                .catch(error => console.error(error))
        })
    })