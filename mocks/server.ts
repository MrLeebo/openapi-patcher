import { beforeAll, afterEach, afterAll } from "vitest";
import { installGlobals } from "@remix-run/node";
import { setupServer } from "msw/node";

installGlobals();
export const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
