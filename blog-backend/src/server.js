const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

require('dotenv').config();

const app = express();

app.use(bodyParser.json());

app.get('/api/articles/:name', async (req, res) => {
	try {
		const articleName = req.params.name;

		const client = await MongoClient.connect(
			`mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.e1noe.mongodb.net/my-blog`,
			{
				useNewUrlParser: true,
				useUnifiedTopology: true,
			}
		);
		const db = client.db('my-blog');

		const articleInfo = await db
			.collection('articles')
			.findOne({ name: articleName });
		res.status(200).json(articleInfo);

		client.close();
	} catch (error) {
		res.status(500).json({ message: 'Error connecting to db', error });
	}
});

app.post('/api/articles/:name/upvote', (req, res) => {
	const articleName = req.params.name;

	articlesInfo[articleName].upvotes += 1;
	res
		.status(200)
		.send(
			`${articleName} now has ${articlesInfo[articleName].upvotes} upvotes`
		);
});

app.post('/api/articles/:name/add-comment', (req, res) => {
	const { username, text } = req.body;
	const articleName = req.params.name;

	articlesInfo[articleName].comments.push({ username, text });

	res.status(200).send(articlesInfo[articleName]);
});

app.listen(8000, () => console.log('Listening on port 8000'));
