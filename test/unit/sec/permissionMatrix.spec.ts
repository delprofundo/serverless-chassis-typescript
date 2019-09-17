import dotenv from "dotenv";

dotenv.config();
import { assert } from "chai";
import validateAccess from "../../../src/sec/permissionsMatrix";
import { PermissionCheckParameters } from "../../../src/types/types";

describe("Permissions Matrix", () => {
  const denyEffect = { effect: "deny" };
  const allowEffect = { effect: 'allow' };

  context("validate access", () => {
    it("no member role or clientType", async () => {
      const permissionParams = {
        path: "testBasePath",
        resource: "/{id}",
        method: "GET"

      } as PermissionCheckParameters;
      const response = await validateAccess(permissionParams);
      assert.deepEqual(response, denyEffect);
    });

    it("no path in the matrix", async () => {
      const permissionParams = {
        path: "dodgyPath",
        resource: "/{id}",
        method: "GET",
        memberRole: "MEMBER"

      } as PermissionCheckParameters;
      const response = await validateAccess(permissionParams);
      assert.deepEqual(response, denyEffect);
    });
    it("no resource mapped in matrix", async () => {
      const permissionParams = {
        path: "/testBasePath",
        resource: "/dodgyResource",
        method: "GET",
        memberRole: "MEMBER"

      } as PermissionCheckParameters;
      const response = await validateAccess(permissionParams);
      assert.deepEqual(response, denyEffect);
    });
    it("No access for method of resource", async () => {
      const permissionParams = {
        path: "/testBasePath",
        resource: "/{id}",
        method: "PUT",
        memberRole: "MEMBER"

      } as PermissionCheckParameters;
      const response = await validateAccess(permissionParams);
      assert.deepEqual(response, denyEffect);
    });
    it("No access for member role", async () => {
      const permissionParams = {
        path: "/testBasePath",
        resource: "/{id}/finalize",
        method: "PUT",
        memberRole: "SYSTEM"

      } as PermissionCheckParameters;
      const response = await validateAccess(permissionParams);
      assert.deepEqual(response, denyEffect);
    });
    it("User has access", async () => {
      const permissionParams = {
        path: "/testBasePath",
        resource: "/{id}/finalize",
        method: "PUT",
        memberRole: "MEMBER"

      } as PermissionCheckParameters;
      const response = await validateAccess(permissionParams);
      assert.deepEqual(response, allowEffect);
    });
  });

});
