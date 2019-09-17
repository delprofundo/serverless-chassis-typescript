/** ******************************************
* AUTH HARNESS PERMISSIONS MATRIX
* simple matrix mapping permissions to functions in
* this service.
* 22 March 2018
* delProfundo (@brunowatt)
* bruno@hypermedia.tech
******************************************* */
import * as logger from "log-winston-aws-level";
import * as R from "ramda";
import { PermissionCheckParameters } from "./sec.types";

const { SERVICE_BASE_PATH } = process.env;

/* const CLIENT_TYPES = {
    GATEWAY: "GATEWAY", // a partner service that is directly integrated
    CLIENT: "CLIENT", // a user authenticed interface, cognito/s3/react for instance
    NODE: "NODE", // an internal component of our system
    LEAF: "LEAF", // semi-intelligent data source only (ie: iot device)
    ADMIN: "ADMIN",
    AUTH_ADMIN: "AUTH_ADMIN",
    SYSTEM: "SYSTEM"
}; */

const MEMBER_ROLES = {
  MEMBER: "MEMBER",
  BRAND_ADMIN: "BRAND_ADMIN",
  PLATFORM_ADMIN: "PLATFORM_ADMIN",
  SYSTEM: "SYSTEM"
};

export interface ApiPermissionMatrix {
  readonly path: string,
  readonly resources: ApiResource[]
}

export interface ApiResource {
  readonly resource: string
  readonly methods: ResourceMethod[]
}

type Role = string;

export interface ResourceMethod {
  readonly method: HttpMethod
  readonly allow: Role[]
  readonly deny: Role[]
}

enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE"
}

export interface PermissionEffect {
  readonly effect: "allow" | "deny";
}

export const PERMISSION_DENY: PermissionEffect = { effect: "deny" };
export const PERMISSION_ALLOW: PermissionEffect = { effect: "allow" };
/**
 * This array stores an object for each API path with nested entries allowing simple lookup of permissions
 */
const permMatrix: ApiPermissionMatrix[] = [
  {
    path: `/${SERVICE_BASE_PATH}`,
    resources: [
      {
        resource: "/",
        methods: [
          {
            method: HttpMethod.GET,
            allow: [MEMBER_ROLES.MEMBER, MEMBER_ROLES.SYSTEM, MEMBER_ROLES.PLATFORM_ADMIN],
            deny: []
          },
          {
            method: HttpMethod.POST,
            allow: [MEMBER_ROLES.MEMBER, MEMBER_ROLES.PLATFORM_ADMIN],
            deny: []
          }
        ]
      },
      {
        resource: "/{id}",
        methods: [
          {
            method: HttpMethod.GET,
            allow: [MEMBER_ROLES.MEMBER, MEMBER_ROLES.SYSTEM, MEMBER_ROLES.PLATFORM_ADMIN],
            deny: []
          }
        ]
      },
      {
        resource: "/{id}/finalize",
        methods: [
          {
            method: HttpMethod.PUT,
            allow: [MEMBER_ROLES.MEMBER],
            deny: []
          }
        ]
      },
      {
        resource: "/echo",
        methods: [
          {
            method: HttpMethod.POST,
            allow: [MEMBER_ROLES.MEMBER],
            deny: []
          }
        ]
      }
    ]
  }
];

/**
 * matrix interface, returns the effect clause of a IAM role
 * @param path
 * @param resource
 * @param method
 * @param memberRole
 * @param clientType
 * @returns {Promise<{effect: string}>}
 */
export default async function validateAccess({
                                               path,
                                               resource,
                                               method,
                                               memberRole,
                                               clientType
                                             }: PermissionCheckParameters): Promise<PermissionEffect> {
  // this is to switch between users/clients
  let effectiveEntity;
  if (memberRole) {
    effectiveEntity = memberRole;
  } else if (clientType) {
    effectiveEntity = clientType;
  } else {
    logger.info("neither client or user type present, deny access");
    return PERMISSION_DENY;
  }

  return validateMappedResourceMethod(permMatrix, path, resource, method, effectiveEntity);
}

const validateMappedResourceMethod = (
  permissionMatrix: ApiPermissionMatrix[],
  path: string,
  resource: string,
  method: string,
  integratorRole: string
): PermissionEffect => {

  const basePathFilter = R.compose(R.chain(R.prop<string, ApiResource[]>("resources")), R.filter(R.propEq("path", path)));
  const resourcePathFilter = R.compose(R.chain(R.prop<string, ResourceMethod[]>("methods")), R.filter(R.propEq("resource", resource)));
  const httpMethodFilter = R.filter(R.propEq("method", method));

  const resourceAccess: ResourceMethod[] = R.compose(httpMethodFilter, resourcePathFilter, basePathFilter)(permissionMatrix);
  if (R.isEmpty(resourceAccess)) {
    return PERMISSION_DENY;
  } else {
    if (R.contains(integratorRole, resourceAccess[0].deny)) {
      return PERMISSION_DENY;
    }
    return R.contains(integratorRole, resourceAccess[0].allow)
      ? PERMISSION_ALLOW
      : PERMISSION_DENY;
  }
};
