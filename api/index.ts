import app, { connectDB } from '../backend/app';

export default async function handler(req: any, res: any) {
  await connectDB();
  return app(req, res);
}
