import { ApiError } from "@/shared/errors/api-error";
import { asyncHandler } from "@/shared/middleware/async-handler";
import { ApiResponse } from "@/shared/utils/api-response";
import { LabaRugiService } from "./laba-rugi.service";
import { QueryLabaRugiDTO, queryLabaRugiSchema } from "./laba-rugi.validation";

export const labaRugi = asyncHandler<{}, {}, { query: QueryLabaRugiDTO }>(
  async (req, res) => {
    const query = queryLabaRugiSchema.safeParse(req.query);
    if (!query.success) {
      return ApiError.validation(
        "Query parameters tidak valid",
        query.error.issues,
      );
    }
    const transaksi = await LabaRugiService.ambilLaporan(query.data);
    return ApiResponse.Success(
      res,
      "Berhasil mengambil laporan laba rugi",
      transaksi,
    );
  },
);
