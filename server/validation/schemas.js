const { z } = require("zod");

const nonEmptyTrimmedString = (label, maxLength) => z.string()
  .trim()
  .min(1, `${label} is required`)
  .max(maxLength, `${label} is too long`);

const emailSchema = z.string()
  .trim()
  .min(1, "Email is required")
  .max(150, "Email is too long")
  .email("A valid email address is required")
  .transform((value) => value.toLowerCase());

const tokenSchema = z.string().trim().min(1);
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must use YYYY-MM-DD");
const timeSchema = z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "time must use HH:MM or HH:MM:SS");
const eventIdSchema = z.union([z.string(), z.number()])
  .transform((value) => String(value).trim())
  .refine((value) => /^\d+$/.test(value), "eventId must be a numeric identifier");

const optionalNullableString = (maxLength) => z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().trim().max(maxLength).optional().nullable()
);

const optionalPositiveInteger = z.preprocess((value) => {
  if (value === "" || value === undefined || value === null) {
    return undefined;
  }

  return Number(value);
}, z.number().int("capacity must be a positive whole number when provided")
  .positive("capacity must be a positive whole number when provided")
  .optional());

const registerSchema = z.object({
  name: nonEmptyTrimmedString("Name", 100),
  email: emailSchema,
  password: z.string().min(6, "Password must be at least 6 characters").max(200, "Password is too long"),
  role: z.enum(["student", "organizer"], { errorMap: () => ({ message: "Invalid registration role" }) }),
  turnstileToken: tokenSchema,
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

const forgotPasswordSchema = z.object({
  email: emailSchema,
});

const verifyEmailSchema = z.object({
  token: tokenSchema.min(1, "Verification token is required"),
});

const resetPasswordSchema = z.object({
  token: tokenSchema.min(1, "Token is required"),
  password: z.string().min(8, "Password must be at least 8 characters").max(200, "Password is too long"),
});

const adminUnlockSchema = z.object({
  masterPassword: z.string().min(1, "Master password is required"),
});

const bookmarkCreateSchema = z.object({
  eventId: eventIdSchema,
});

const registrationCreateSchema = z.object({
  eventId: eventIdSchema,
  attendeeType: z.enum(["attendee", "volunteer"]).optional(),
  options: z.object({
    foodOption: z.string().trim().max(100).optional(),
    seatNumber: z.number().int().positive().optional(),
  }).partial().optional(),
});

const profileUpdateSchema = z.object({
  full_name: nonEmptyTrimmedString("Full name", 100),
  email: emailSchema,
});

const passwordUpdateSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters long").max(200, "New password is too long"),
});

const adminUserUpdateSchema = z.object({
  name: nonEmptyTrimmedString("Name", 100),
  email: emailSchema,
  role: z.enum(["student", "organizer", "admin"], { errorMap: () => ({ message: "Valid name, email, and role are required" }) }),
}).strip();

const categorySchema = z.object({
  name: nonEmptyTrimmedString("Category name", 50),
});

const eventStatusSchema = z.object({
  status: z.enum(["draft", "pending", "published", "rejected", "cancelled"], {
    errorMap: () => ({ message: "Invalid status" }),
  }),
});

const eventWriteSchema = z.object({
  title: nonEmptyTrimmedString("title", 150),
  description: nonEmptyTrimmedString("description", 5000),
  date: dateSchema,
  startTime: timeSchema,
  endTime: timeSchema,
  location: nonEmptyTrimmedString("location", 200),
  category: nonEmptyTrimmedString("category", 50),
  image: optionalNullableString(500),
  capacity: optionalPositiveInteger,
  registrationRequired: z.boolean().optional(),
  notes: optionalNullableString(5000),
  organizerId: z.preprocess(
    (value) => (value === "" || value === undefined || value === null ? undefined : String(value).trim()),
    z.string().regex(/^\d+$/, "organizerId must be a numeric identifier").optional()
  ),
  status: z.enum(["draft", "pending", "published", "rejected", "cancelled"]).optional(),
}).superRefine((data, ctx) => {
  const start = data.startTime.length === 5 ? `${data.startTime}:00` : data.startTime;
  const end = data.endTime.length === 5 ? `${data.endTime}:00` : data.endTime;

  if (end <= start) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["endTime"],
      message: "endTime must be later than startTime",
    });
  }
});

module.exports = {
  adminUnlockSchema,
  adminUserUpdateSchema,
  bookmarkCreateSchema,
  categorySchema,
  eventStatusSchema,
  eventWriteSchema,
  forgotPasswordSchema,
  loginSchema,
  passwordUpdateSchema,
  profileUpdateSchema,
  registerSchema,
  registrationCreateSchema,
  resetPasswordSchema,
  verifyEmailSchema,
};
