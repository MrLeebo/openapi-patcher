import { describe, test, beforeEach, expect } from "vitest";
import { rest } from "msw";
import { server } from "../mocks/server";
import jsdoc from "../mocks/jsdoc.json";
import patchJson from "./patchJson";

const url = "http://0.0.0.0/docs.json";
beforeEach(() =>
  server.use(rest.get(url, (_req, res, ctx) => res(ctx.json(jsdoc))))
);

describe("patchJson", () => {
  test("patches a basic path", async (ctx) => {
    const patch = [
      {
        op: "replace",
        path: `$[path=/contacts]/get/summary`,
        value: ctx.meta.name,
      },
    ];

    expect(jsdoc.paths["/contacts"].get.summary).toEqual(
      "Returns list of my contacts"
    );
    const actual = await patchJson<typeof jsdoc>(url, patch);
    expect(actual.paths["/contacts"].get.summary).toEqual(ctx.meta.name);
  });

  test("patches a parameterized path", async (ctx) => {
    const patch = [
      {
        op: "replace",
        path: `$[path=/contacts/{userUid}/icon]/get/responses/200/description`,
        value: ctx.meta.name,
      },
    ];

    expect(
      jsdoc.paths["/contacts/{userUid}/icon"].get.responses[200].description
    ).toEqual("OK");
    const actual = await patchJson<typeof jsdoc>(url, patch);
    expect(
      actual.paths["/contacts/{userUid}/icon"].get.responses[200].description
    ).toEqual(ctx.meta.name);
  });
});
