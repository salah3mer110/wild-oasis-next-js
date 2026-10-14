"use server";

import { revalidatePath } from "next/cache";
import { auth, signIn, signOut } from "./auth";
import { supabase } from "./supabase";
import { getBooking, getBookings } from "./data-service";
import { redirect } from "next/navigation";

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

export async function deleteReservation(bookingId) {
  const session = await auth();
  if (!session) throw new Error("Please sign in first!");

  const bookings = await getBookings(session.user.guestId);
  const guestBookings = bookings.map((booking) => booking.id);

  if (!guestBookings.includes(bookingId))
    throw new Error("You are not allowed to delete this Reservation");

  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId);

  if (error) throw new Error("Booking could not be deleted");

  revalidatePath("/account/reservations");
}
export async function updateReservation(formData) {
  const session = await auth();
  if (!session) throw new Error("Please sign in first!");

  const id = formData.get("id");
  const bookings = await getBookings(session.user.guestId);
  const guestBookings = bookings.map((booking) => booking.id);
  if (!guestBookings.includes(+id))
    throw new Error("You are not allowed to update this Reservation");

  const numGuests = formData.get("numGuests");
  const observations = formData.get("observations");
  const updatedFields = { numGuests, observations };
  const { error } = await supabase
    .from("bookings")
    .update(updatedFields)
    .eq("id", id);

  if (error) throw new Error("Booking could not be updated");

  revalidatePath("/account/reservations");
  revalidatePath(`/account/reservations/edit/${id}`);
  redirect("/account/reservations");
}

export async function createReservation(reservationData, formData) {
  const session = await auth();
  if (!session) throw new Error("Please sign in first!");

  const newReservation = {
    ...reservationData,
    guestId: session.user.guestId,
    numGuests: formData.get("numGuests"),
    observations: formData.get("observations").slice(0, 1000),
    extrasPrice: 0,
    totalPrice: reservationData.cabinPrice,
    isPaid: false,
    hasBreakfast: false,
    status: "unconfirmed",
  };
  const { error } = await supabase.from("bookings").insert([newReservation]);
  if (error) throw new Error("Booking could not be created");

  revalidatePath(`/cabins/${reservationData.cabinId}`);
}

export async function signInAction() {
  await signIn("google", { redirectTo: "/account" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
