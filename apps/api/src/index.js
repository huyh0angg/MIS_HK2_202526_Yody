import { createApp } from './app.js';
import { ensureDatabaseSeeded } from './db/connections.js';

const port = process.env.PORT || 4000;
const app = createApp();

try {
  await ensureDatabaseSeeded();
} catch (error) {
  console.error('Failed to bootstrap database:', error.message);
}

app.listen(port, () => {
  console.log(`Yody API listening on http://localhost:${port}`);
});
