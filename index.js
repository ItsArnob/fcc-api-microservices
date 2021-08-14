const express = require('express');
const cors = require('cors');
const multer = require('multer');
const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const port = process.env.PORT;

app.use(cors({ optionSuccessStatus: 200 }))
app.get('/', (req, res) => {
	res.sendFile(`${__dirname}/views/index.html`);
});
app.post('/api/fileanalyse', upload.single('upfile'), (req, res) => {
  if(!req.file) return res.json({error: "No file uploaded"})
	console.log('Got the uploaded file!');
	res.json({
		name: req.file.originalname,
		type: req.file.mimetype,
		size: req.file.size
	});
});

app.listen(port, () => {
	console.log(`File metadata microservice listening on port: ${port}`);
});
