import { createServer } from './route';

const { app, port } = createServer();
app.listen(port, '127.0.0.1', () => {
    console.log(`Server running at http://127.0.0.1:${port}`);
}); 