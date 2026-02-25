import { ApiError } from "@/shared/errors/api-error";
import { asyncHandler } from "@/shared/middleware/async-handler";
import { ApiResponse } from "@/shared/utils/api-response";
import { ArusKasService } from "./arus-kas.service";
import { QueryArusKasDTO, queryArusKasSchema } from "./arus-kas.validation";

export const arusKas = asyncHandler<{}, {}, { query: QueryArusKasDTO }>(
  async (req, res) => {
    const query = queryArusKasSchema.safeParse(req.query);

    if (!query.success) {
      throw ApiError.validation(
        "Query parameters tidak valid",
        query.error.issues,
      );
    }

    const data = await ArusKasService.ambilLaporan(query.data);
    return ApiResponse.Success(
      res,
      "Berhasil mengambil laporan arus kas",
      data,
    );
  },
);
