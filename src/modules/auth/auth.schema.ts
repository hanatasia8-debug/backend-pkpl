import { z } from "zod";

export const signUpSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal harus 8 karakter"),
  name: z.string().min(2, "Nama minimal harus 2 karakter"),
});

export const signInSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password tidak boleh kosong"),
});

export const passwordRecoverySchema = z.object({
  email: z.string().email("Format email tidak valid"),
});

export const passwordUpdateSchema = z.object({
  password: z.string().min(8, "Password minimal harus 8 karakter"),
});

export type SignUpDTO = z.infer<typeof signUpSchema>;
export type SignInDTO = z.infer<typeof signInSchema>;
