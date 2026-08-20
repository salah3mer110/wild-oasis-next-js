import { getBookedDatesByCabinId, getCabin } from "@/app/_lib/data-service";

export async function GET(request, { params }) {
  const searchParams = await params;
  const { cabinId } = searchParams;
  try {
    const [cabin, bookedDates] = await Promise.all([
      getCabin(cabinId),
      getBookedDatesByCabinId(cabinId),
    ]);
    return Response.json({ cabin, bookedDates });
  } catch (err) {
    return Response.json({
      status: Response.status,
      message: `Cabin not found ${err.message}`,
    });
  }
}
