import serverless from 'serverless-http';
import app, { connectDB } from '../backend/app';

let handler: any;

export const handler = async (event: any, context: any) => {
  if (!handler) {
    await connectDB();
    handler = serverless(app);
  }
  return handler(event, context);
};
