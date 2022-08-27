import { applyPatch } from "fast-json-patch";
import invariant from "tiny-invariant";

export default async function patchJson(doc: string, patch: string) {
  const promises = [fetch(doc)];
  console.log({ doc, patch });
  const isInlinePatch = patch.startsWith("[");
  if (!isInlinePatch) promises.push(fetch(patch));
  const [docRes, patchRes] = await Promise.all(promises);
  invariant(docRes.ok, "Could not retrieve doc JSON");
  if (!isInlinePatch) invariant(patchRes.ok, "Could not retrieve patch JSON");

  const docJson = await docRes.json();
  const patchJson = isInlinePatch ? JSON.parse(patch) : await patchRes.json();

  const patched = applyPatch(docJson, patchJson);
  return patched.newDocument;
}
