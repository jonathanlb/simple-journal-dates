const express = require('express');
const findFiles = require('../src/find').findFiles;
const router = express.Router();

const contentDir = 'public/content';
const root = `${__dirname}/../${contentDir}`;

function exposeFileAsContent(fileName) {
	return fileName.replace(root, contentDir);	
}

/* GET dates for content type (file prefix) for all of time. */
router.get('/:prefix', function(req, res, next) {
	const prefix = req.params.prefix;
	
	const result = findFiles(root, `/${prefix}-.*\\.html$`, 3).
	map(exposeFileAsContent);
	
	res.send(JSON.stringify(result));
});

/* GET dates for content type (file prefix) for the year. */
router.get('/:prefix/:year/', function(req, res, next) {
	const prefix = req.params.prefix;
	const year = req.params.year;
	
	const result = findFiles(root, `/${year}/.*/${prefix}-.*\\.html$`, 3).
	map(exposeFileAsContent);
	
	res.send(JSON.stringify(result));
});

/* GET dates for content type (file prefix) for the month. */
router.get('/:prefix/:year/:month', function(req, res, next) {
  const prefix = req.params.prefix;
  const year = req.params.year;
  const month = req.params.month;
	
  const result = findFiles(root, `/${year}/${month}/${prefix}-.*\\.html$`, 3).
	map(exposeFileAsContent);
	
	res.send(JSON.stringify(result));
});

module.exports = router;
