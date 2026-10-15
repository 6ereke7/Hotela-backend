import dotenv from 'dotenv';
import app from './app.ts'
import { checkConnection } from './db/index.ts';

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  const dbStatus = await checkConnection(); 
  console.log(`
    Server is running on port: ${PORT}
    DataBase connection: ${dbStatus}
  `);
}); 