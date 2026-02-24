import { asyncHandler } from "@/shared/middleware/async-handler";
import { ApiResponse } from "@/shared/utils/api-response";
import { ApiError } from "@/shared/errors/api-error";
import { akunService } from "./akun.service";
import {
  buatAkunSchema,
  updateAkunSchema,
  queryAkunSchema,
  QueryAkunDTO,
} from "./akun.validation";

export const ambilSemuaAkun = asyncHandler<{}, {}, { data: QueryAkunDTO }>(
  async (req, res) => {
    const query = queryAkunSchema.safeParse(req.query);

    if (!query.success) {
      throw ApiError.validation(
        "Query parameter tidak valid",
        query.error.issues,
      );
    }

    const data = await akunService.ambilSemua(query.data);

    return ApiResponse.Success(res, "Berhasil mengambil data akun", data);
  },
);

export const ambilDetailAkun = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const data = await akunService.ambilSatuById(id);

  return ApiResponse.Success(res, "Berhasil mengambil detail akun", data);
});

export const buatAkun = asyncHandler(async (req, res) => {
  const body = buatAkunSchema.safeParse(req.body);

  if (!body.success) {
    throw ApiError.validation("Data akun tidak valid", body.error.issues);
  }

  const data = await akunService.buat(body.data);

  return ApiResponse.created(res, "Akun berhasil dibuat", data);
});

export const updateAkun = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const body = updateAkunSchema.safeParse(req.body);

  if (!body.success) {
    throw ApiError.validation("Data akun tidak valid", body.error.issues);
  }

  const data = await akunService.update(id, body.data);

  return ApiResponse.Success(res, "Akun berhasil diperbarui", data);
});

export const hapusAkun = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await akunService.hapus(id);

  return ApiResponse.Success(res, "Akun berhasil dihapus", null);
});
