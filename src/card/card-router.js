// Required dependencies
const express = require('express');
const uuid = require('uuid/v4');
const logger = require('../logger');
const { cards, lists } = require('../store');

// card-router setup
const cardRouter = express.Router();
const bodyParser = express.json();

// /card endpoint
cardRouter
	.route('/card')
	.get(handleGetCards)
	.post(bodyParser, handlePostNewCard);

function handleGetCards(req, res) {
	res.json(cards);
}

function handlePostNewCard(req, res) {
	const { title, content } = req.body;

	if (!title) {
		logger.error(`Title is required`);
		return res.status(400).send('Invalid data, card must have title');
	}

	if (!content) {
		logger.error(`Content is required`);
		return res.status(400).send('Invalid data, Card must have content');
	}

	const id = uuid();
	const newCard = {
		id,
		title,
		content
	};
	cards.push(newCard);

	logger.info(`Card with id ${id} created`);

	res.status(201)
		.location(`http://localhost:8000/card/${id}`)
		.json(newCard);
}

// /card/:id endpoint
cardRouter
	.route('/card/:id')
	.get(handleGetCardWithId)
	.delete(handleDeleteCardWithId);

function handleGetCardWithId(req, res) {
	const { id } = req.params;
	const card = cards.find(card => card.id == id);

	if (!card) {
		logger.error(`Card with id ${id} not found`);
		return res.status(404).send('Card Not Found');
	}

	res.json(card);
}

function handleDeleteCardWithId(req, res) {
	const { id } = req.params;

	const cardIndex = cards.findIndex(c => c.id == id);

	if (cardIndex === -1) {
		logger.error(`Card with id ${id} not found.`);
		return res.status(404).send('Card Not Found');
	}

	lists.forEach(list => {
		const cardIds = list.cardIds.filter(cid => cid !== id);
		list.cardIds = cardIds;
	});

	cards.splice(cardIndex, 1);

	logger.info(`Card with id ${id} deleted.`);

	res.status(204).end();
}

module.exports = cardRouter;
