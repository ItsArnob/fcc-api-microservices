const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({ optionsSuccessStatus: 200 }));

app.get('/', (req, res) => {
	res.sendFile(`${__dirname}/views/index.html`);
});
app.get('/api/:time', (req, res) => {
	const timeParam = Number(req.params.time)
		? Number(req.params.time)
		: req.params.time;
	const date = new Date(timeParam);
	if (date == 'Invalid Date') return res.json({ error: 'Invalid Date' });
	res.json({ unix: date.getTime(), utc: date.toUTCString() });
});
app.get('/api', (req, res) => {
	const date = new Date();
	res.json({ unix: date.getTime(), utc: date.toUTCString() });
});

const listener = app.listen(process.env.PORT, () => {
	console.log(
		`timestamp microservice listening on port: ${listener.address().port}`
	);
});
