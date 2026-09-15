import { describe, it, expect, beforeEach } from "vitest";
import {
  getGoogleCalendarAuthUrl,
  exchangeGoogleCalendarCode,
  getGoogleCalendarAccessToken,
} from "./google-calendar";

describe("google-calendar", () => {
  beforeEach(() => {
    delete process.env.GOOGLE_CALENDAR_CLIENT_ID;
    delete process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
  });

  describe("getGoogleCalendarAuthUrl", () => {
    it("returns null when not configured", () => {
      const url = getGoogleCalendarAuthUrl("state", "http://localhost/callback");
      expect(url).toBeNull();
    });

    it("builds an auth URL with the expected params when configured", () => {
      process.env.GOOGLE_CALENDAR_CLIENT_ID = "client-id";
      process.env.GOOGLE_CALENDAR_CLIENT_SECRET = "client-secret";
      const url = getGoogleCalendarAuthUrl("my-state", "http://localhost/callback");
      expect(url).toContain("https://accounts.google.com/o/oauth2/v2/auth");
      expect(url).toContain("client_id=client-id");
      expect(url).toContain("state=my-state");
      expect(url).toContain("access_type=offline");
    });
  });

  describe("exchangeGoogleCalendarCode", () => {
    it("returns null when not configured", async () => {
      const result = await exchangeGoogleCalendarCode("code", "http://localhost/callback");
      expect(result).toBeNull();
    });
  });

  describe("getGoogleCalendarAccessToken", () => {
    it("returns null when not configured", async () => {
      const result = await getGoogleCalendarAccessToken("refresh-token");
      expect(result).toBeNull();
    });
  });
});
