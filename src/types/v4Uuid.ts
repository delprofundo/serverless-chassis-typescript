import uuid from "uuid";

export type v4Uuid = string & { readonly _: unique symbol };

export function v4Uuid(): v4Uuid {
  return uuid.v4() as v4Uuid;
}
