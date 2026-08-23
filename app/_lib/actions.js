"use server";

import { revalidatePath } from "next/cache";
import { auth, signIn, signOut } from "./auth";
import { updateGuest } from "./data-service";

export async function UpdateProfile(formData) {
  const session = await auth();
  if (!session) throw new Error("Please sign in first to update profile");
  console.log(session);
  const nationalID = formData.get("nationalID");
  const [nationality, countryFlag] = formData.get("nationality").split("%");

  // const regex = /^[A-Za-z0-9]{6,12}$/;
  // if (!regex.test(nationalID))
  //   throw new Error("Please provide a valid national ID");

  await updateGuest(session.user.guestId, {
    nationalID,
    countryFlag,
    nationality,
  });
}

export async function signInAction() {
  await signIn("google", { redirectTo: "/account" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
