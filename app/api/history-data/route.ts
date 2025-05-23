import prisma from "@/lib/prisma";
import { Period, Timeframe } from "@/lib/types";
import { currentUser } from "@clerk/nextjs";
import { error } from "console";
import { getDaysInMonth } from "date-fns";
import { redirect } from "next/navigation";
import { z } from "zod";

const getHistoryDataSchema = z.object({
  timeframe: z.enum(["month", "year"]),
  month: z.coerce.number().min(0).max(11).default(0),
  year: z.coerce.number().min(2000).max(3000),
});

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { searchParams } = new URL(request.url);
  const timeframe = searchParams.get("timeframe");
  const year = searchParams.get("year");
  const month = searchParams.get("month");

  const queryParams = getHistoryDataSchema.safeParse({
    timeframe,
    month,
    year,
  });

  if (!queryParams.success) {
    return Response.json(queryParams.error.message, {
      status: 400,
    });
  }

  const data = await getHistoryData( queryParams.data.timeframe, {
    month: queryParams.data.month,
    year: queryParams.data.year,
  });

  return Response.json(data);
}

export type GetHistoryDataResponseType = Awaited<
  ReturnType<typeof getHistoryData>
>;

async function getHistoryData(
  timeframe: Timeframe,
  period: Period
) {
  switch (timeframe) {
    case "year":
      return await getYearHistoryData(period.year);
    case "month":
      return await getMonthHistoryData(period.year, period.month);
  }
}

type HistoryData = {
  add: number;
  subtract: number;
  year: number;
  month: number;
  day?: number;
};

async function getYearHistoryData(year: number) {
  const result = await prisma.yearHistory.groupBy({
    by: ["month"],
    where: {
      year,
    },
    _sum: {
      add: true,
      subtract: true,
    },
    orderBy: [
      {
        month: "asc",
      },
    ],
  });

  if (!result || result.length === 0) return [];

  const history: HistoryData[] = [];

  for (let i = 0; i < 12; i++) {
    let add = 0;
    let subtract = 0;

    const month = result.find((row) => row.month === i);
    if (month) {
      add = month._sum.add || 0;
      subtract = month._sum.subtract || 0;
    }

    history.push({
      year,
      month: i,
      add,
      subtract,
    });
  }

  return history;
}

async function getMonthHistoryData(
  year: number,
  month: number
) {
  const result = await prisma.monthHistory.groupBy({
    by: ["day"],
    where: {
      year,
      month,
    },
    _sum: {
      add: true,
      subtract: true,
    },
    orderBy: [
      {
        day: "asc",
      },
    ],
  });

  if (!result || result.length === 0) return [];

  const history: HistoryData[] = [];
  for (let i = 1; i <= new Date(year, month, 0).getDate(); i++) {
    let add = 0;
    let subtract = 0;

    const day = result.find((row) => row.day === i);
    if (day) {
      add = day._sum.add || 0;
      subtract = day._sum.subtract || 0;
    }

    history.push({
      year,
      month,
      day: i,
      add,
      subtract,
    });
  }

  return history;
}