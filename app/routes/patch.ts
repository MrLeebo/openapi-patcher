import {
  json,
  LoaderFunction,
  ActionFunction,
  HeadersFunction,
} from "@remix-run/node";
import invariant from "tiny-invariant";
import patchJson from "services/patchJson";

// I dunno if vercel supports this or not for remix, guess we'll find out!
export const config = {
  runtime: "experimental-edge",
};

export const headers: HeadersFunction = () => ({
  "Access-Control-Allow-Origin": "*",
});

export const loader: LoaderFunction = async ({ request }) => {
  let doc, patch;
  try {
    const url = new URL(request.url);
    doc = url.searchParams.get("doc");
    patch = url.searchParams.get("patch");
    invariant(doc, "doc parameter is required");
    invariant(patch, "patch parameter is required");
  } catch (err) {
    return json(err instanceof Error ? err.message : err, {
      status: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  try {
    const result = await patchJson(doc, patch);
    return json(result, {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error(err);
    return json("Internal Server Error", {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
};

export const action: ActionFunction = async ({ request }) => {
  let doc, patch;
  try {
    const url = new URL(request.url);
    doc = url.searchParams.get("doc");
    patch = await request.json();
    invariant(typeof doc === "string", "doc parameter is required");
    invariant(patch, "patch data is required");
  } catch (err) {
    return json(err instanceof Error ? err.message : err, {
      status: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  try {
    const result = await patchJson(doc, patch);
    return json(result, {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error(err);
    return json("Internal Server Error", {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
};
