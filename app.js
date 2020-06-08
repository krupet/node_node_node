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
        app.get('/sendMeToTheAnalytics', (req, res) => res.redirect('/analytics'))

        app.post('/data', (req, res) => {
            const payload = JSON.parse(req.body.data)
            payload._id = new ObjectID()
            quotesCollection.insertOne(payload)
                // .then(result => {
                //     console.log("saved")
                // })
                .catch(error => console.error(error))
        })

        const numberOfSamples = 16; // number of time samples used for chart generation
        app.get('/analytics', (req, res) => {
            db.collection('expressions').find({"expressions": {$exists: true, $ne: null}})
                .sort({ts: -1}).limit(numberOfSamples).toArray()
                .then(results => {

                    const pieData = {
                        neutral: 0.0,
                        happy: 0.0,
                        sad: 0.0,
                        angry: 0.0,
                        fearful: 0.0,
                        disgusted: 0.0,
                        surprised: 0.0
                    }

                    const lineData = {
                        neutral: [],
                        happy: [],
                        sad: [],
                        angry: [],
                        fearful: [],
                        disgusted: [],
                        surprised: [],
                        labels: []
                    }
                    const expressions = results.map(a => a.expressions)

                    for (let i = 0; i < expressions.length; i++) {

                        const expression = expressions[i]

                        pieData.neutral = (parseFloat(pieData.neutral) + parseFloat(expression.neutral)).toFixed(3)
                        pieData.happy = (parseFloat(pieData.happy) + parseFloat(expression.happy)).toFixed(3)
                        pieData.sad = (parseFloat(pieData.sad) + parseFloat(expression.sad)).toFixed(3)
                        pieData.angry = (parseFloat(pieData.angry) + parseFloat(expression.angry)).toFixed(3)
                        pieData.fearful = (parseFloat(pieData.fearful) + parseFloat(expression.fearful)).toFixed(3)
                        pieData.disgusted = (parseFloat(pieData.disgusted) + parseFloat(expression.disgusted)).toFixed(3)
                        pieData.surprised = (parseFloat(pieData.surprised) + parseFloat(expression.surprised)).toFixed(3)
                    }

                    // elemets go in DESCENDING order and we need ASCENDING order on the line chart
                    const reversed = results.reverse()
                    for (let i = 0; i < reversed.length; i++) {

                        let element = reversed[i];
                        const expression = element.expressions

                        lineData.neutral.push(parseFloat(expression.neutral).toFixed(3))
                        lineData.happy.push(parseFloat(expression.happy).toFixed(3))
                        lineData.sad.push(parseFloat(expression.sad).toFixed(3))
                        lineData.angry.push(parseFloat(expression.angry).toFixed(3))
                        lineData.fearful.push(parseFloat(expression.fearful).toFixed(3))
                        lineData.disgusted.push(parseFloat(expression.disgusted).toFixed(3))
                        lineData.surprised.push(parseFloat(expression.surprised).toFixed(3))

                        const date = new Date(element.ts)
                        lineData.labels.push(date.toISOString().replace(/T/, ' ').replace(/\..+/, ''))
                    }

                    res.render('analitics.ejs', {
                        pieData: pieData,
                        lineData: lineData
                    })
                })
                .catch(error => console.error(error))
        })
    })