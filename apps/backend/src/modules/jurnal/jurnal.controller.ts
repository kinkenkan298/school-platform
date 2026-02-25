import { ApiError } from "@/shared/errors/api-error";
import { asyncHandler } from "@/shared/middleware/async-handler";
import { ApiResponse } from "@/shared/utils/api-response";
import { JurnalService } from "./jurnal.service";
import {
  batalJurnalSchema,
  buatJurnalSchema,
  queryJurnalSchema,
  updateJurnalSchema,
} from "./jurnal.validation";

export const ambilSemuaJurnal = asyncHandler(async (req, res) => {
  const query = queryJurnalSchema.safeParse(req.query);

  if (!query.success) {
    throw ApiError.validation(
      "Query parameter tidak valid",
      query.error.issues,
    );
  }

  const data = await JurnalService.ambilSemua(query.data);

  return ApiResponse.Success(res, "Berhasil mengambil data jurnal", data);
});

export const ambilDetailJurnal = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const data = await JurnalService.ambilSatuById(id);

  return ApiResponse.Success(res, "Berhasil mengambil detail jurnal", data);
});

export const buatJurnal = asyncHandler(async (req, res) => {
  const body = buatJurnalSchema.safeParse(req.body);

  if (!body.success) {
    throw ApiError.validation("Data jurnal tidak valid", body.error.issues);
  }

  const data = await JurnalService.buat(body.data);

  return ApiResponse.created(res, "Jurnal berhasil dibuat", data);
});

export const updateJurnal = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const body = updateJurnalSchema.safeParse(req.body);

  if (!body.success) {
    throw ApiError.validation("Data jurnal tidak valid", body.error.issues);
  }

  const data = await JurnalService.update(id, body.data);

  return ApiResponse.Success(res, "Jurnal berhasil diperbarui", data);
});

export const postingJurnal = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const data = await JurnalService.posting(id);

  return ApiResponse.Success(res, "Jurnal berhasil diposting", data);
});

export const batalkanJurnal = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const body = batalJurnalSchema.safeParse(req.body);

  if (!body.success) {
    throw ApiError.validation("Data pembatalan tidak valid", body.error.issues);
  }

  const data = await JurnalService.batal(id, body.data);

  return ApiResponse.Success(res, "Jurnal berhasil dibatalkan", data);
});

export const hapusJurnal = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await JurnalService.hapus(id);

  return ApiResponse.Success(res, "Jurnal berhasil dihapus", null);
});
