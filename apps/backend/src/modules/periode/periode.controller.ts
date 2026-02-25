import { ApiError } from "@/shared/errors/api-error";
import { asyncHandler } from "@/shared/middleware/async-handler";
import { ApiResponse } from "@/shared/utils/api-response";
import { PeriodeFiskalService } from "./periode.service";
import { buatPeriodeSchema } from "./periode.validation";

export const ambilSemuaPeriode = asyncHandler(async (_req, res) => {
  const data = await PeriodeFiskalService.ambilSemua();

  return ApiResponse.Success(
    res,
    "Berhasil mengambil data periode fiskal",
    data,
  );
});

export const ambilDetailPeriode = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const data = await PeriodeFiskalService.ambilSatuById(id);

  return ApiResponse.Success(
    res,
    "Berhasil mengambil detail periode fiskal",
    data,
  );
});

export const buatPeriode = asyncHandler(async (req, res) => {
  const body = buatPeriodeSchema.safeParse(req.body);

  if (!body.success) {
    throw ApiError.validation("Data periode tidak valid", body.error.issues);
  }

  const data = await PeriodeFiskalService.buat(body.data);

  return ApiResponse.created(res, "Periode fiskal berhasil dibuat", data);
});

export const tutupPeriode = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const data = await PeriodeFiskalService.tutup(id);

  return ApiResponse.Success(res, "Periode fiskal berhasil ditutup", data);
});
