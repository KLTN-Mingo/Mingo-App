import {
  CallHistoryDto,
  CallHistoryStatus,
  CreateCallRequestDto,
  PaginatedCallHistoryDto,
  UpdateCallStatusRequestDto,
} from "@/dtos";
import { apiRequest } from "@/services/api-client";

/** REST signaling — BE chỉ làm signaling, media truyền P2P. */
class CallService {
  /** GET /messages/calls/history — lịch sử cuộc gọi. */
  async getHistory(
    page = 1,
    limit = 20,
    status?: CallHistoryStatus
  ): Promise<PaginatedCallHistoryDto> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (status) params.set("status", status);

    const raw = await apiRequest<unknown>(
      `/messages/calls/history?${params.toString()}`
    );

    const calls = Array.isArray((raw as any)?.calls)
      ? (raw as any).calls
      : Array.isArray(raw)
        ? raw
        : [];

    const pagination = (raw as any)?.pagination ?? {
      page,
      limit,
      total: calls.length,
      totalPages: 1,
      hasMore: false,
    };

    return { calls: calls as CallHistoryDto[], pagination };
  }

  /** POST /messages/calls — tạo cuộc gọi mới (signaling, không truyền media). */
  async createCall(payload: CreateCallRequestDto): Promise<CallHistoryDto> {
    return apiRequest<CallHistoryDto>("/messages/calls", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  /** PATCH /messages/calls/:callId — cập nhật trạng thái cuộc gọi. */
  async updateCallStatus(
    callId: string,
    payload: UpdateCallStatusRequestDto
  ): Promise<CallHistoryDto> {
    return apiRequest<CallHistoryDto>(
      `/messages/calls/${encodeURIComponent(callId)}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      }
    );
  }
}

export const callService = new CallService();
