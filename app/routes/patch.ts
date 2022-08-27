import { json, LoaderFunction } from "@remix-run/node";
import invariant from "tiny-invariant";
import patchJson from "services/patchJson";

export const config = {
  runtime: "experimental-edge",
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const doc = url.searchParams.get("doc");
  const patch = url.searchParams.get("patch");
  invariant(doc, "doc parameter is required");
  invariant(patch, "patch parameter is required");

  return json(await patchJson(doc, patch), {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
};
