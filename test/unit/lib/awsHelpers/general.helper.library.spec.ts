import { unstring, generateAsyncResponse } from "../../../../src/lib/awsHelpers/general.helper.library";
import  v4  from "uuid/v4";
import { v4String } from "uuid/interfaces";

describe("general helper", () => {
  context("unstring", () => {
    it("parse json string", () => {
      const json: string = "{\"test\": 23}";
      return unstring(json).should.deep.equal({ test: 23 });
    });
    it("object is not parsed", () => {
      const json = {blah: "da-value"};
      return unstring(json).should.deep.equal({blah: "da-value"});
    });
    context("generate async response", () => {
      it("should convert to async response", () => {
        const v4RecordId: v4String = v4;
        generateAsyncResponse("200", v4RecordId, "record-type").should.deep.equal(
        {
          recordId: v4RecordId,
          recordType: "record-type",
          result: "200"
        });
      });
    })
  });

});
