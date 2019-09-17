import { v4Uuid } from "../types/v4Uuid";

interface FlexibleObject {
  readonly key: string;
  readonly value: string | number | object;
} // end FlexibleObject Interface

export interface IamPolicyParameters {
  readonly memberId: v4Uuid;
  readonly effect: string;
  readonly resource: string;
  readonly context?: FlexibleObject;
} // end IamPolicyParameters Interface

export interface PermissionCheckParameters {
  readonly path: string;
  readonly resource: string;
  readonly method: string;
  readonly memberRole?: string;
  readonly clientType?: string;
} // end PermissionCheckParameters Interface

export interface AuthenticationParameters {
  readonly maxTokenExpiry: string;
  readonly jwaPem: string;
  readonly userPoolId?: string;
  readonly systemMemberId?: string;
} // end AuthenticationParameters
