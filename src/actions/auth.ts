"use server";

import { AuthService } from "../modules/auth/auth.service";

export async function signUp(values: any) {
  try {
    const user = await AuthService.signUp(values);
    return { success: true, data: user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function signIn(values: any) {
  try {
    const user = await AuthService.signIn(values);
    return { success: true, data: user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function signOut() {
  try {
    const result = await AuthService.signOut();
    return { success: true, ...result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
