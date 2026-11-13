/* eslint-disable import/first */
jest.mock("@/lib/supabase/client", () => ({ supabase: { from: jest.fn() } }));

import { supabase } from "@/lib/supabase/client";
import { getProfile, updateProfile } from "@/features/profile/profile-service";

const mockFrom = jest.mocked(supabase!.from);
const mockMaybeSingle = jest.fn();
const mockInsertSingle = jest.fn();
const mockUpdateMaybeSingle = jest.fn();
const mockInsert = jest.fn(() => ({ select: jest.fn(() => ({ single: mockInsertSingle })) }));
const mockSelect = jest.fn(() => ({ eq: jest.fn(() => ({ maybeSingle: mockMaybeSingle })) }));
const mockUpdate = jest.fn(() => ({ eq: jest.fn(() => ({ select: jest.fn(() => ({ maybeSingle: mockUpdateMaybeSingle })) })) }));
const mockProfile = { id: "user-1", display_name: null, unit_system: "metric", created_at: "now", updated_at: "now" };

describe("profile service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFrom.mockImplementation(() => ({ select: mockSelect, insert: mockInsert, update: mockUpdate } as never));
  });

  it("returns a profile when it exists", async () => {
    mockMaybeSingle.mockResolvedValue({ data: mockProfile, error: null });
    await expect(getProfile("user-1")).resolves.toEqual(mockProfile);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("repairs a missing profile by inserting only the Auth user id", async () => {
    mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null });
    mockInsertSingle.mockResolvedValue({ data: mockProfile, error: null });
    await expect(getProfile("user-1")).resolves.toEqual(mockProfile);
    expect(mockInsert).toHaveBeenCalledWith({ id: "user-1" });
  });

  it("updates only permitted profile fields and reports an RLS-filtered missing row", async () => {
    const input = { display_name: "Omar", unit_system: "imperial" as const };
    mockUpdateMaybeSingle.mockResolvedValueOnce({ data: { ...mockProfile, ...input }, error: null });
    await expect(updateProfile("user-1", input)).resolves.toMatchObject(input);
    expect(mockUpdate).toHaveBeenCalledWith(input);
    mockUpdateMaybeSingle.mockResolvedValueOnce({ data: null, error: null });
    await expect(updateProfile("user-1", input)).rejects.toMatchObject({ code: "profile_missing" });
  });
});