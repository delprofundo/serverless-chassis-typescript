/**
 * SERVICE SHARED TYPES
 * 04 Aug 2019
 * delprofundo (@brunowatt)
 * bruno@hypermedia.tech
 * @module common/types
 */
import { v4Uuid } from "./v4Uuid";
import { DynamoDBStreamEvent } from "aws-lambda";

/*
  Common Communication Types
 */
export interface AsyncResponse {
  readonly result: string;
  readonly recordId: v4Uuid;
  readonly recordType: string;
  readonly responseMessage?: string;
  readonly traceId?: string;
} // end AsyncResponse interface

export interface BaseQueryParameters {
  readonly TableName: string,
  readonly ExclusiveStartKey?: object,
  readonly Limit?: number
}

export interface DynamoStreamAssembly<T> {
  readonly assembly: T;
  readonly  streamEvent: DynamoDBStreamEvent;
}

export interface DynamoEventResponse {
  readonly newRec: object,
  readonly oldRec?: object,
  readonly streamEventName: string,
  readonly delta?: object
}
