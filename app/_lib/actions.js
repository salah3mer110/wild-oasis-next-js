"use server";

import { revalidatePath } from "next/cache";
import { auth, signIn, signOut } from "./auth";
import { supabase } from "./supabase";

export async function UpdateProfile(formData) {
  const session = await auth();
  if (!session) throw new Error("Please sign in first to update profile");
  const nationalID = formData.get("nationalID");
  const [nationality, countryFlag] = formData.get("nationality").split("%");

  // const regex = /^[A-Za-z0-9]{6,12}$/;
  // if (!regex.test(nationalID))
  //   throw new Error("Please provide a valid national ID");
  const updatedFields = {
    nationalID,
    countryFlag,
    nationality,
  };
  const { data, error } = await supabase
    .from("guests")
    .update(updatedFields)
    .eq("id", session.user.guestId);

  if (error) {
    throw new Error("Guest could not be updated");
  }

  revalidatePath("/account/profile");
}

export async function signInAction() {
  await signIn("google", { redirectTo: "/account" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
