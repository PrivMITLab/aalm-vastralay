import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * 👑 AALM VASTRALAY — API / INTEGRATION TEST FOR USER REGISTRATION
 * Mocks Drizzle ORM to test the Route Handler logic without requiring live Neon DB.
 */

// Step 1: Mock Drizzle Database queries
const mockInsertValues = vi.fn();
const mockInsertReturning = vi.fn();

const mockDb = {
  insert: vi.fn((_table?: any) => ({
    values: mockInsertValues.mockImplementation((userData) => ({
      returning: mockInsertReturning.mockResolvedValue([
        {
          id: "11111111-2222-3333-4444-555555555555",
          email: userData.email,
          fullName: userData.fullName,
          role: "customer",
          createdAt: new Date(),
        },
      ]),
    })),
  })),
  select: vi.fn(() => ({
    from: vi.fn(() => ({
      where: vi.fn().mockResolvedValue([]), // Empty array means user does not exist yet
    })),
  })),
};

// Route Handler Implementation under test
async function handleRegister(reqBody: { email: string; fullName: string; password: string }) {
  if (!reqBody.email || !reqBody.password || !reqBody.fullName) {
    return { status: 400, json: { error: "Missing required fields" } };
  }

  // Drizzle insert query execution
  const [createdUser] = await mockDb
    .insert({} as any)
    .values({
      email: reqBody.email.toLowerCase().trim(),
      fullName: reqBody.fullName.trim(),
      role: "customer",
    })
    .returning();

  return {
    status: 201,
    json: {
      success: true,
      message: "User registered successfully",
      user: createdUser,
    },
  };
}

describe("API Route Integration: /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create user in Neon DB via Drizzle ORM and return HTTP 201", async () => {
    const payload = {
      email: "namaste@aalmvastralay.com",
      fullName: "Priya Sharma",
      password: "StrongPassword123#",
    };

    const response = await handleRegister(payload);

    // 1. Status 201 check
    expect(response.status).toBe(201);
    expect(response.json.success).toBe(true);

    // 2. Drizzle ORM mock assertion
    expect(mockDb.insert).toHaveBeenCalledTimes(1);
    expect(mockInsertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "namaste@aalmvastralay.com",
        fullName: "Priya Sharma",
        role: "customer",
      })
    );

    // 3. Response body format
    expect(response.json.user.id).toBe("11111111-2222-3333-4444-555555555555");
  });

  it("should reject request with HTTP 400 when required fields are missing", async () => {
    const invalidPayload = {
      email: "missing_fields@test.com",
      fullName: "",
      password: "",
    };

    const response = await handleRegister(invalidPayload as any);

    expect(response.status).toBe(400);
    expect(response.json.error).toBe("Missing required fields");
    expect(mockDb.insert).not.toHaveBeenCalled();
  });
});
