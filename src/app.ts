import * as express from 'express';
import { getPackage } from './package';

/**
 * Bootstrap the application framework
 */
export function createApp() {
  const app = express();

  app.use(express.json());

  app.get('/package/:packageName/:version', getPackage);

  return app;
}
