const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

require('dotenv').config();

const app = express();

app.use(bodyParser.json());

const withDB = async (operations, res) => {
	try {
		const client = await MongoClient.connect(
			`mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.e1noe.mongodb.net/my-blog`,
			{
				useNewUrlParser: true,
				useUnifiedTopology: true,
			}
		);
		const db = client.db('my-blog');

		await operations(db);

		client.close();
	} catch (error) {
		res.status(500).json({ message: 'Error connecting to db', error });
	}
};

app.get('/api/articles/:name', async (req, res) => {
	withDB(async db => {
		const articleName = req.params.name;

		const articleInfo = await db
			.collection('articles')
			.findOne({ name: articleName });

		res.status(200).json(articleInfo);
	}, res);
});

app.post('/api/articles/:name/upvote', async (req, res) => {
	withDB(async db => {
		const articleName = req.params.name;

		const articleInfo = await db
			.collection('articles')
			.findOne({ name: articleName });

		await db
			.collection('articles')
			.updateOne(
				{ name: articleName },
				{ $set: { upvotes: (articleInfo.upvotes += 1) } }
			);

		const updateArticleInfo = await db
			.collection('articles')
			.findOne({ name: articleName });

		res.status(200).json(updateArticleInfo);
	}, res);
});

app.post('/api/articles/:name/add-comment', (req, res) => {
	const { username, text } = req.body;
	const articleName = req.params.name;

	withDB(async db => {
		const articleInfo = await db
			.collection('articles')
			.findOne({ name: articleName });

		await db.collection('articles').updateOne(
			{ name: articleName },
			{
				$set: {
					comments: [...articleInfo.comments, { username, text }],
				},
			}
		);

		const updateArticleInfo = await db
			.collection('articles')
			.findOne({ name: articleName });

		res.status(200).json(updateArticleInfo);
	}, res);
});

app.listen(8000, () => console.log('Listening on port 8000'));
