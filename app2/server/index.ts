import express from "express";
import path from "path";

const port = 3000;
const app = express();

console.log(express.static(path.join(__dirname, 'public')));
app.use('/', express.static(path.join(__dirname, 'public')))

app.use('/api', (req, res) => {
  res.send('Hello World!')
});

app.listen(port, () => {
    console.log('http://localhost:' + port);

})

