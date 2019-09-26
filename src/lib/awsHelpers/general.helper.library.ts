import { AsyncResponse } from "../../types/types";
import { v4Uuid } from "../../types/v4Uuid";

/**
 * shortcut for unstringing a potentially stringed json thing
 * @param item
 * @returns {*}
 */
export const unstring = (item: string | object): object => {
  if (typeof item === "string") {
    return JSON.parse(item);
  }
  return item;
}; // end unstring

/**
 * common async response assembler
 * @param resultCode
 * @param recordId
 * @param recordType
 * @returns {{result: *, recordId: *, recordType: *}}
 */
export const generateAsyncResponse = (resultCode: string, recordId: v4Uuid, recordType: string): AsyncResponse => {
  return {
    result: resultCode,
    recordId,
    recordType
  };
}; // end generateAsyncResponse
