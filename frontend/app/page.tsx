"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema } from "@/lib/schemas";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useState } from "react";

type RegisterFormData = z.infer<typeof signUpSchema>;

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const handleRegister = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    console.log(data);
    toast.success("Registered successfully!");
    setIsSubmitting(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-cyan-500 via-purple-500 to-orange-500 px-4 py-12">
      <form
        onSubmit={handleSubmit(handleRegister)}
        className="w-full max-w-lg rounded-xl bg-white p-8 shadow-2xl md:p-10"
      >
        <h1 className="mb-8 text-center text-3xl font-bold text-gray-800">
          Create Account
        </h1>
        <div className="flex flex-col gap-6">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block font-medium text-gray-700"
            >
              Username
            </label>
            <input
              type="text"
              {...register("name")}
              className={`text-gray-700 w-full rounded-lg border px-4 py-2 transition-colors duration-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="email"
              className="mb-2 block font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              {...register("email")}
              className={`text-gray-700 w-full rounded-lg border px-4 py-2 transition-colors duration-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-2 block font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              {...register("password")}
              className={`text-gray-700 w-full rounded-lg border px-4 py-2 transition-colors duration-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <input
              type="password"
              {...register("confirmPassword")}
              className={`text-gray-700 w-full rounded-lg border px-4 py-2 transition-colors duration-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 ${
                errors.confirmPassword ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 w-full rounded-lg bg-cyan-500 px-5 py-3 font-semibold text-white transition duration-300 hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-purple-300"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}