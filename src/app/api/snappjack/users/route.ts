import { createUserHandler } from '@snappjack/sdk-js/server';

// add any needed auth checking here, e.g.
// if (!req.headers.authorization) {
//   return new Response('Unauthorized', { status: 401 });
// }
// if (!req.headers.authorization.startsWith('Bearer ')) {
//   return new Response('Unauthorized', { status: 401 });
// }
// const token = req.headers.authorization.split(' ')[1];
// const decoded = jwt.verify(token, process.env.JWT_SECRET);
// if (!decoded) {
//   return new Response('Unauthorized', { status: 401 });
// }

// create the handler
export const { POST } = createUserHandler();