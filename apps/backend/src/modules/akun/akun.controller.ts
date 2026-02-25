import { ApiError } from "@/shared/errors/api-error";
import { asyncHandler } from "@/shared/middleware/async-handler";
import { ApiResponse } from "@/shared/utils/api-response";
import { AkunService } from "./akun.service";
import {
  buatAkunSchema,
  QueryAkunDTO,
  queryAkunSchema,
  updateAkunSchema,
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

    const data = await AkunService.ambilSemua(query.data);

    return ApiResponse.Success(res, "Berhasil mengambil data akun", data);
  },
);

export const ambilDetailAkun = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const data = await AkunService.ambilSatuById(id);

  return ApiResponse.Success(res, "Berhasil mengambil detail akun", data);
});

export const buatAkun = asyncHandler(async (req, res) => {
  const body = buatAkunSchema.safeParse(req.body);

  if (!body.success) {
    throw ApiError.validation("Data akun tidak valid", body.error.issues);
  }

  const data = await AkunService.buat(body.data);

  return ApiResponse.created(res, "Akun berhasil dibuat", data);
});

export const updateAkun = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const body = updateAkunSchema.safeParse(req.body);

  if (!body.success) {
    throw ApiError.validation("Data akun tidak valid", body.error.issues);
  }

  const data = await AkunService.update(id, body.data);

  return ApiResponse.Success(res, "Akun berhasil diperbarui", data);
});

export const hapusAkun = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await AkunService.hapus(id);

  return ApiResponse.Success(res, "Akun berhasil dihapus", null);
});
