import { get, setupTest } from "@nuxt/test-utils";
import buildJestConfig from "../test/setupConfig";

describe("ssr page rendering", () => {
  setupTest(buildJestConfig());

  it("should render index page", async () => {
    const { body } = await get("/about");
    expect(body).toContain("Udeshya Gurung");
  });
});
