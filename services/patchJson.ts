import { applyPatch, escapePathComponent, Operation } from "fast-json-patch";
import invariant from "tiny-invariant";

export default async function patchJson<T = unknown>(
  doc: string,
  patch: string | unknown
) {
  const promises = [fetch(doc)];

  const isStringPatch = typeof patch === "string";
  const isInlinePatch = isStringPatch && patch.startsWith("[");
  if (isStringPatch && !isInlinePatch) promises.push(fetch(patch));
  const [docRes, patchRes] = await Promise.all(promises);
  invariant(docRes.ok, "Could not retrieve doc JSON");
  if (isStringPatch && !isInlinePatch)
    invariant(patchRes.ok, "Could not retrieve patch JSON");

  const docJson: unknown = await docRes.json();
  let operations: Operation[] = !isStringPatch
    ? patch
    : isInlinePatch
    ? JSON.parse(patch)
    : await patchRes.json();

  operations = operations.map(transformOperation);

  const patched = applyPatch(docJson, operations);
  return patched.newDocument as T;
}

const transforms: Array<
  [RegExp, (val: string, path: string, method: string) => string]
> = [
  [/\$\[path=(.+?)\]/, (_val, path) => `/paths/${escapePathComponent(path)}`],
];

function transformOperation(operation: Operation): Operation {
  return {
    ...operation,
    path: transforms.reduce(
      (memo, transform) => memo.replace(...transform),
      operation.path
    ),
  };
}
