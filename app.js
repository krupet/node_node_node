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
                .then(result => {
                    console.log("saved")
                })
                .catch(error => console.error(error))
        })

        app.get('/analytics', (req, res) => {
            db.collection('expressions').find().toArray()
                .then(results => {
                    const chartData = {
                        neutral: 0.0,
                        happy: 0.0,
                        sad: 0.0,
                        angry: 0.0,
                        fearful: 0.0,
                        disgusted: 0.0,
                        surprised: 0.0
                    }
                    const expressions = results.map(a => a.expressions)

                    for (let i = 0; i < expressions.length; i++) {

                        const expression = expressions[i]

                        chartData.neutral = (parseFloat(chartData.neutral) + parseFloat(expression.neutral)).toFixed(3)
                        chartData.happy = (parseFloat(chartData.happy) + parseFloat(expression.happy)).toFixed(3)
                        chartData.sad = (parseFloat(chartData.sad) + parseFloat(expression.sad)).toFixed(3)
                        chartData.angry = (parseFloat(chartData.angry) + parseFloat(expression.angry)).toFixed(3)
                        chartData.fearful = (parseFloat(chartData.fearful) + parseFloat(expression.fearful)).toFixed(3)
                        chartData.disgusted = (parseFloat(chartData.disgusted) + parseFloat(expression.disgusted)).toFixed(3)
                        chartData.surprised = (parseFloat(chartData.surprised) + parseFloat(expression.surprised)).toFixed(3)
                    }

                    res.render('analitics.ejs', {pieData: chartData})
                })
                .catch(error => console.error(error))
        })

        app.get('/pieData', (req, res) => {
            db.collection('expressions').find().toArray()
                .then(results => {
                    const chartData = {
                        neutral: 0.0,
                        happy: 0.0,
                        sad: 0.0,
                        angry: 0.0,
                        fearful: 0.0,
                        disgusted: 0.0,
                        surprised: 0.0
                    }
                    const expressions = results.map(a => a.expressions)

                    for (let i = 0; i < expressions.length; i++) {

                        const expression = expressions[i]

                        chartData.neutral = (parseFloat(chartData.neutral) + parseFloat(expression.neutral)).toFixed(3)
                        chartData.happy = (parseFloat(chartData.happy) + parseFloat(expression.happy)).toFixed(3)
                        chartData.sad = (parseFloat(chartData.sad) + parseFloat(expression.sad)).toFixed(3)
                        chartData.angry = (parseFloat(chartData.angry) + parseFloat(expression.angry)).toFixed(3)
                        chartData.fearful = (parseFloat(chartData.fearful) + parseFloat(expression.fearful)).toFixed(3)
                        chartData.disgusted = (parseFloat(chartData.disgusted) + parseFloat(expression.disgusted)).toFixed(3)
                        chartData.surprised = (parseFloat(chartData.surprised) + parseFloat(expression.surprised)).toFixed(3)
                    }

                    res.send(JSON.stringify(chartData))
                }).catch(error => console.error(error))
        })
    })