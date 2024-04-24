import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

interface RelaxRequest extends FastifyRequest {
    params: {
        source: string,
        id: string,
        filename: string,
        index: string,
        query: string
    }
}

async function router (fastify: FastifyInstance): Promise<void> {
    fastify.route({
        method: 'GET',
        url: '/relax/api/:source/:id/:filename/:index/:query',
        handler: async (req: RelaxRequest, reply: FastifyReply) => {
            console.log(req.params);
            await reply.code(200).send('hello');
        }
    })
}

export default router;