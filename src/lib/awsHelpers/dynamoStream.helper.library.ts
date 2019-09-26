/**
 * queue helper library
 * THESE HELPERS USED TO QUERY COLLECTIONS
 * 13 May 2019
 * delprofundo (@brunowatt)
 * bruno@hypermedia.tech
 * @module dynamodb/queryHelper
 */
import AWS from "aws-sdk";
import * as logger from "log-winston-aws-level";
import extractDynamoStreamDelta from "dynamo-stream-diff";
import { DynamoEventResponse } from "../../types/types";
import { DynamoDBRecord, DynamoDBStreamEvent } from "aws-lambda";

/**
 * helper to extract the useful contents from a dynamo stream record including new old and delta
 * @param dynamoRecord
 * @returns {{oldRec: any, newRec: any, streamEventName: DynamoDBStreams.OperationType}}
 */
const processIndividualDynamoRecord = (dynamoRecord: DynamoDBRecord): DynamoEventResponse => {
  const dynamoRecordParse = AWS.DynamoDB.Converter.output;
  let response: DynamoEventResponse = {
    newRec: dynamoRecordParse({ M: dynamoRecord.dynamodb.NewImage }),
    oldRec: dynamoRecordParse({ M: dynamoRecord.dynamodb.OldImage }),
    streamEventName: dynamoRecord.eventName,
    delta: undefined
  };
  if (dynamoRecord.eventName === "MODIFY") {
    response = { ...response, delta: extractDynamoStreamDelta(dynamoRecord) };
  }
  return response;
}; // end processIndividualDynamoRecord

/**
 * HOF that takes a dynamoDb stream event, a processor function and a target
 * @param streamEvent
 * @param eventProcessorFunction
 * @param target
 * @returns {Promise<any>}
 */
export const dynamoStreamEventPromisifier = async <T>(
  streamEvent: DynamoDBStreamEvent,
  eventProcessorFunction: (ev: DynamoEventResponse, target: T) => void,
  target: T
) => {
  const reducedEvents = streamEvent.Records.map(processIndividualDynamoRecord);
  try {
    await Promise.all(
      reducedEvents.map(async event => {
        return eventProcessorFunction(event, target);
      })
    );
  } catch (err) {
    logger.error("error in table stream PROMISIFIER", err);
    throw err;
  }
}; // end dynamoStreamEventPromisifier
