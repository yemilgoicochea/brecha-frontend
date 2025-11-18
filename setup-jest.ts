import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';
setupZoneTestEnv();
import '@testing-library/jest-dom';
import 'zone.js';
import 'zone.js/testing';
// MSW disabled (server file present but optional). Uncomment when handlers are defined.
// import { server } from './test/msw-server';
// beforeAll(() => server.listen());
// afterEach(() => server.resetHandlers());
// afterAll(() => server.close());

const g: any = global;
if (!g.crypto || !g.crypto.randomUUID) {
  const { randomUUID } = require('crypto');
  g.crypto = { ...(g.crypto||{}), randomUUID };
}