import serverless from 'serverless-http';
import app, { connectDB } from '../../backend/app';

let cachedHandler: any;

export const handler = async (event: any, context: any) => {
  // Prevent Lambda from waiting for the event loop to be empty (important for Mongoose)
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    if (!cachedHandler) {
      console.log('📡 Initializing backend and connecting to database...');
      await connectDB();
      cachedHandler = serverless(app);
    }
    
    return await cachedHandler(event, context);
  } catch (error) {
    console.error('❌ Netlify Function Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Internal Server Error', 
        error: error instanceof Error ? error.message : String(error) 
      })
    };
  }
};
