import http from 'http'

const PORT = 4000

const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`)

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Server is working!' }));
})

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });