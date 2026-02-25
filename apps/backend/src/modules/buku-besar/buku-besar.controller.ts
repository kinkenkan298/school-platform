import { ApiError } from "@/shared/errors/api-error";
import { asyncHandler } from "@/shared/middleware/async-handler";
import { ApiResponse } from "@/shared/utils/api-response";
import { BukuBesarService } from "./buku-besar.service";
import {
  QueryBukuBesarDTO,
  queryBukuBesarSchema,
} from "./buku-besar.validation";

export const bukuBesar = asyncHandler<{}, {}, { query: QueryBukuBesarDTO }>(
  async (req, res) => {
    const query = queryBukuBesarSchema.safeParse(req.query);
    if (!query.success) {
      return ApiError.validation(
        "Query parameters tidak valid",
        query.error.issues,
      );
    }
    const data = await BukuBesarService.ambilLaporan(query.data);
    return ApiResponse.Success(
      res,
      "Berhasil mengambil laporan buku besar",
      data,
    );
  },
);
