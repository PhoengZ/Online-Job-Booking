import {z} from "zod"

export const signUpSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Invalid email address").min(1, "Email is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please add your confirm your password")
})
.refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
})
