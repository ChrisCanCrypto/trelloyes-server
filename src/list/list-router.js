// Required dependencies
const express = require('express');
const uuid = require('uuid/v4');
const logger = require('../logger');
const { cards, lists } = require('../store');

// list-router setup
const listRouter = express.Router();
const bodyParser = express.json();

// /list endpoint

listRouter
	.route('/list')
	.get(handleGetLists)
	.post(bodyParser, handlePostNewList);

function handleGetLists(req, res) {
	res.json(lists);
}

function handlePostNewList(req, res) {
	const { header, cardIds = [] } = req.body;

	if (!header) {
		logger.error('Header is required');
		return res.status(400).send('Invalid data, header is required');
	}

	if (cardIds.length > 0) {
		let valid = true;
		cardIds.forEach(cid => {
			const card = cards.find(c => c.id == cid);
			if (!card) {
				logger.error(`Card with id ${cid} not found in the cards array.`);
				valid = false;
			}
		});

		if (!valid) {
			return res.status(400).send('invalid data');
		}
	}

	const id = uuid();

	const newList = {
		id,
		header,
		cardIds
	};

	lists.push(newList);

	logger.info(`List with id ${id} created`);

	res.status(201)
		.location(`http://localhost:8000/list/${id}`)
		.json({ id });
}

// /list/:id endpoint
listRouter
	.route('/list/:id')
	.get(handleGetListWithId)
	.delete(handleDeleteListWithId);

function handleGetListWithId(req, res) {
	const { id } = req.params;
	const list = lists.find(list => list.id == id);

	if (!list) {
		logger.error(`List with id ${id} not found`);
		return res.status(404).send('List Not Found');
	}

	res.json(list);
}

function handleDeleteListWithId(req, res) {
	const { id } = req.params;

	const listIndex = lists.findIndex(li => li.id == id);

	if (listIndex === -1) {
		logger.error(`List with id ${id} not found.`);
		return res.status(404).send('List Not Found');
	}

	lists.splice(listIndex, 1);

	logger.info(`List with id ${id} deleted.`);
	res.status(204).end();
}

module.exports = listRouter;
