import http from 'http'
import { router } from './router';


const PORT = 4000

router.get('/api/health', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: 'ok' }))
})

router.post('/api/test', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'POST works!' }));
});

const server = http.createServer((req, res) => {
    router.hanlde(req, res)
})

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});