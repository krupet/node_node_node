const express = require('express');
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient

const app = express();
const port = 8000;

app.listen(port, () => {
    console.log('listen port 8000');
})

app.use(bodyParser.urlencoded({extended: true}))

MongoClient.connect('mongodb://localhost:27017/data', {useUnifiedTopology: true})
    .then(client => {
        const db = client.db('data')
        const quotesCollection = db.collection('quotes')

        app.get('/', (req, res) => {
            res.sendFile(__dirname + '/index.html')
        })

        app.post('/quotes', (req, res) => {
            quotesCollection.insertOne(req.body)
                .then(result => {
                    res.redirect('/')
                })
                .catch(error => console.error(error))
        })
    })