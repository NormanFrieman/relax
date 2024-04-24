import fastify from 'fastify';
import router from './router';

const server = fastify({ logger: false });
server.register(router);

server.listen({ port: 8082 }, () => {
    console.log('running on port 8082');
})