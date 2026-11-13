import { getAuthHome, getAuthRouteAccess } from "@/features/auth/auth-state";

describe("authentication route access", () => {
  it("only exposes the loading route while session initialization is pending", () => {
    expect(getAuthRouteAccess("initializing")).toEqual({ loading: true, auth: false, app: false, recovery: false });
  });

  it("keeps app routes protected when the user is signed out", () => {
    expect(getAuthRouteAccess("signed-out")).toEqual({ loading: false, auth: true, app: false, recovery: false });
    expect(getAuthHome("signed-out")).toBe("/sign-in");
  });

  it("allows only app routes for a signed-in user", () => {
    expect(getAuthRouteAccess("signed-in")).toEqual({ loading: false, auth: false, app: true, recovery: false });
    expect(getAuthHome("signed-in")).toBe("/today");
  });

  it("exposes password reset only during recovery", () => {
    expect(getAuthRouteAccess("recovering")).toEqual({ loading: false, auth: false, app: false, recovery: true });
    expect(getAuthHome("recovering")).toBe("/reset-password");
  });
});
