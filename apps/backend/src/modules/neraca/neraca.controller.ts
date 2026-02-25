import { ApiError } from "@/shared/errors/api-error";
import { asyncHandler } from "@/shared/middleware/async-handler";
import { ApiResponse } from "@/shared/utils/api-response";
import { NeracaService } from "./neraca,service";
import { QueryNeracaDTO, queryNeracaSchema } from "./neraca.validation";

export const neraca = asyncHandler<{}, {}, { query: QueryNeracaDTO }>(
  async (req, res) => {
    const query = queryNeracaSchema.safeParse(req.query);
    if (!query.success) {
      return ApiError.validation(
        "Query parameters tidak valid",
        query.error.issues,
      );
    }
    const data = await NeracaService.hitungLabaRugiBerjalan(query.data.sampai);
    return ApiResponse.Success(res, "Berhasil mengambil laporan neraca", data);
  },
);
