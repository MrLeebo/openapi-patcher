import type { ActionFunction, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { useState } from "react";
import invariant from "tiny-invariant";

export let meta: MetaFunction = () => ({
  title: "OpenAPI Patcher",
});

export const action: ActionFunction = async ({ request }) => {
  const body = await request.formData();
  const action = body.get("action");
  const doc = body.get("doc");
  const patch = body.get("patch");

  invariant(typeof doc === "string", "doc parameter is required");
  if (action !== "viewDoc")
    invariant(typeof patch === "string", "patch parameter is required");

  switch (action) {
    case "viewDoc":
      return redirect(doc);
    case "viewPatch":
      return redirect(String(patch));
    default:
      return redirect(
        `/patch?${new URLSearchParams({ doc, patch: String(patch) })}`
      );
  }
};

type Modes = "inline" | "url";
interface Draft {
  doc: string;
  mode: Modes;
  patch: string;
}

const examples = {
  docUrl: "https://rebrickable.com/api/v3/swagger/?format=openapi",
  patchUrl:
    "https://gist.githubusercontent.com/MrLeebo/8922280f94a8946cad0e1ed97d49c06c/raw/7ff0633fb5f6795256632862138469ee4b84182b/patch.json",
  inlinePatch: `[
    { "op": "replace", "path": "/host", "value": "patched host name" }
  ]`,
  fetchSearchParams: `fetch(\`https://openapi-patcher.vercel.app/patch?\${
  new URLSearchParams({
    doc: "https://someapi.com/docs.json",
    patch: "https://gist.githubusercontent.com/username/gist/raw/patch.json",
  })
}\`)
`,
  fetchBody: `fetch(\`https://openapi-patcher.vercel.app/patch?\${
  new URLSearchParams({ doc: "https://someapi.com/docs.json" })
}\`, {
  method: 'put',
  body: \`[{"op": "replace", "path": "/host", "value": "patched host name" }]\`
})
`,
};

export default function Index() {
  const [draft] = useState<Draft>(() =>
    "localStorage" in global
      ? JSON.parse(localStorage.getItem("formData") ?? "null")
      : null
  );
  const [mode, setMode] = useState<Modes>(draft?.mode);

  return (
    <div className="centered-container">
      <fieldset>
        <p>
          The patch file should be in the{" "}
          <a
            href="https://jsonpatch.com/"
            target="_blank"
            rel="noreferrer noopener"
          >
            JSON Patch
          </a>{" "}
          format, although I plan on adding some operations that are specific to
          JSON:API to make it easier to patch docs.
        </p>

        <hr />

        <Form
          method="post"
          style={{ padding: "1rem" }}
          reloadDocument
          onBlur={(e) => {
            const formData = new FormData(e.currentTarget);
            localStorage.setItem(
              "formData",
              JSON.stringify(formData.entries())
            );
          }}
        >
          <label htmlFor="doc">OpenAPI / Swagger JSON URL</label>
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
            <input
              id="doc"
              name="doc"
              type="text"
              defaultValue={draft?.doc ?? examples.docUrl}
              style={{ flexGrow: 1 }}
            />
            <button name="action" value="viewDoc" style={{ width: 100 }}>
              View Doc
            </button>
          </div>

          <label>Patch Doc using:</label>
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
            <label>
              <input
                type="radio"
                checked={mode === "url"}
                onChange={() => setMode("url")}
              />{" "}
              URL
            </label>
            <label>
              <input
                type="radio"
                checked={mode === "inline"}
                onChange={() => setMode("inline")}
              />{" "}
              Inline Text
            </label>
          </div>

          {mode === "inline" ? (
            <>
              <label htmlFor="patch">Patch File Content</label>
              <textarea
                id="patch"
                name="patch"
                rows={6}
                style={{ width: "100%" }}
                defaultValue={draft?.patch ?? examples.inlinePatch}
              />
            </>
          ) : mode === "url" ? (
            <>
              <label htmlFor="patch">Patch File JSON URL</label>
              <div
                style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}
              >
                <input
                  id="patch"
                  name="patch"
                  type="text"
                  defaultValue={draft?.patch ?? examples.patchUrl}
                  style={{ flexGrow: 1 }}
                />
                <button name="action" value="viewPatch" style={{ width: 100 }}>
                  View Patch
                </button>
              </div>
            </>
          ) : null}

          {mode != null ? (
            <button name="action" value="apply">
              Submit
            </button>
          ) : null}
        </Form>

        <hr />

        <details>
          <summary>Fetching patched docs programmatically</summary>
          <p>
            You can programmatically get patched results by fetching the /patch
            endpoint with ?doc and ?patch query string parameters.
          </p>
          <p>For example:</p>
          <pre>
            <code
              dangerouslySetInnerHTML={{
                __html: examples.fetchSearchParams,
              }}
            />
          </pre>
          <p>
            You can also send the data as a POST or PUT request with the request
            body consisting of the inline JSON patches.
          </p>
          <pre>
            <code
              dangerouslySetInnerHTML={{
                __html: examples.fetchBody,
              }}
            />
          </pre>
          <p>
            Source code is available{" "}
            <a
              href="https://github.com/MrLeebo/openapi-patcher"
              rel="noreferrer noopener"
            >
              here
            </a>
            .
          </p>
        </details>
      </fieldset>
    </div>
  );
}
