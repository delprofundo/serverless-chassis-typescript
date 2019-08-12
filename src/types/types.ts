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

/*
  Authentication Types
 */
export interface AuthenticationParameters {
  readonly maxTokenExpiry: string;
  readonly jwaPem: string;
  readonly userPoolId?: string;
  readonly systemMemberId?: string;
} // end AuthenticationParameters

interface FlexibleObject {
  readonly key: string;
  readonly value: string | number | object;
} // end FlexibleObject Interface

export interface PermissionCheckParameters {
  readonly path: string;
  readonly resource: string;
  readonly method: string;
  readonly memberRole?: string;
  readonly clientType?: string;
} // end PermissionCheckParameters Interface

export interface IamPolicyParameters {
  readonly memberId: v4Uuid;
  readonly effect: string;
  readonly resource: string;
  readonly context?: FlexibleObject;
} // end IamPolicyParameters Interface

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
