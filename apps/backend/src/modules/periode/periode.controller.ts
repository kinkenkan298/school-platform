import { asyncHandler } from "@/shared/middleware/async-handler";
import { ApiResponse } from "@/shared/utils/api-response";
import { ApiError } from "@/shared/errors/api-error";
import { periodeFiskalService } from "./periode.service";
import { buatPeriodeSchema } from "./periode.validation";

export const ambilSemuaPeriode = asyncHandler(async (_req, res) => {
  const data = await periodeFiskalService.ambilSemua();

  return ApiResponse.Success(
    res,
    "Berhasil mengambil data periode fiskal",
    data,
  );
});

export const ambilDetailPeriode = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const data = await periodeFiskalService.ambilSatuById(id);

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

  const data = await periodeFiskalService.buat(body.data);

  return ApiResponse.created(res, "Periode fiskal berhasil dibuat", data);
});

export const tutupPeriode = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const data = await periodeFiskalService.tutup(id);

  return ApiResponse.Success(res, "Periode fiskal berhasil ditutup", data);
});
