import { Server } from './server';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const server = new Server(PORT);
server.start(); 