import chai, { assert } from "chai";
import chaiAsPromised from "chai-as-promised";
import { dynamoStreamEventPromisifier } from "../../../../src/lib/awsHelpers/dynamoStream.helper.library";
import { DynamoEventResponse, DynamoStreamAssembly } from "../../../../src/interface/types";

chai.use(chaiAsPromised);

describe("dynamoStream helper library", () => {
  context("process stream events", () => {
    let expectedResult: DynamoEventResponse;
    let expectedTarget: string;

    const eventProcessorFunction = (ev: DynamoEventResponse, t: string): void => {
      expectedResult = ev;
      expectedTarget = t;
    };

    it("convert insert stream event", () => {
      const assembly: DynamoStreamAssembly<string> = {
        assembly: "test blah",
        streamEvent: {
          Records: [{
            eventName: "INSERT",
            dynamodb: {
              NewImage: {
                ["value-one"]: {
                  S: "one-updated"
                },
                ["value-two"]: {
                  S: "two"
                }
              }
            }
          }]
        }
      };

      return dynamoStreamEventPromisifier(assembly, eventProcessorFunction, "blah").then(() => {
        assert.deepEqual(expectedResult, {
          delta: undefined,
          newRec: {
            ["value-one"]: "one-updated",
            ["value-two"]: "two"
          },
          oldRec: {},
          streamEventName: "INSERT"
        });
        assert.equal(expectedTarget, "blah");
      });
    });

    it("convert modify stream event", () => {
      const assembly: DynamoStreamAssembly<string> = {
        assembly: "test blah",
        streamEvent: {
          Records: [{
            eventName: "MODIFY",
            dynamodb: {
              StreamViewType: "NEW_AND_OLD_IMAGES",
              NewImage: {
                ["value-one"]: {
                  S: "one-updated"
                },
                ["value-two"]: {
                  S: "two"
                }
              },
              OldImage: {
                ["value-one"]: {
                  S: "one"
                },
                ["value-two"]: {
                  S: "two"
                }
              }
            }
          }]
        }
      };

      return dynamoStreamEventPromisifier(assembly, eventProcessorFunction, "blah").then(() => {
        assert.deepEqual(expectedResult, {
          delta: {
            diffList: [
              {
                diff: "updated",
                newVal: "one-updated",
                oldVal: "one",
                path: "value-one"
              }
            ],
            diffMap: {
              ["value-one"]: {
                newVal: "one-updated",
                oldVal: "one",
                type: "updated"
              },
              ["value-two"]: {
                newVal: "two",
                oldVal: "two",
                type: "unchanged"
              }
            }
          },
          newRec: {
            ["value-one"]: "one-updated",
            ["value-two"]: "two"
          },
          oldRec: {
            ["value-one"]: "one",
            ["value-two"]: "two"
          },
          streamEventName: "MODIFY"
        });
        assert.equal(expectedTarget, "blah");
      });
    });
  });
});
