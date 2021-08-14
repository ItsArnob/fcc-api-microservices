const express = require('express');
const cors = require('cors');
const app = express();

app.set('trust proxy', true);
app.use(cors({ optionsSuccessStatus: 200 }));
app.get('/api/whoami', (req, res) => {
	res.json({
		ipaddress: req.ip,
		software: req.get('user-agent'),
		language: req.get('accept-language')
	});
});
app.get('/', (req, res) => {
	res.sendFile(`${__dirname}/views/index.html`);
});
const port = process.env.PORT;
app.listen(port, () => {
	console.log(`Request header parser microservice listening on port: ${port}`);
});
