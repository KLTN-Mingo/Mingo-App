import {
  CreateReportRequestDto,
  CreateUserReportRequestDto,
  PaginatedReportsDto,
  ReportEntityType,
  ReportReason,
  ReportResponseDto,
} from "@/dtos";
import { apiRequest } from "@/services/api-client";

class ReportService {
  /** POST /reports — báo cáo post hoặc comment. */
  async createReport(payload: CreateReportRequestDto): Promise<ReportResponseDto> {
    return apiRequest<ReportResponseDto>("/reports", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async reportPost(
    postId: string,
    reason: ReportReason,
    description?: string
  ): Promise<ReportResponseDto> {
    return this.createReport({
      entityType: ReportEntityType.POST,
      entityId: postId,
      reason,
      description,
    });
  }

  async reportComment(
    commentId: string,
    reason: ReportReason,
    description?: string
  ): Promise<ReportResponseDto> {
    return this.createReport({
      entityType: ReportEntityType.COMMENT,
      entityId: commentId,
      reason,
      description,
    });
  }

  /** POST /users/:userId/report — báo cáo user. */
  async reportUser(
    userId: string,
    payload: CreateUserReportRequestDto
  ): Promise<ReportResponseDto> {
    return apiRequest<ReportResponseDto>(
      `/users/${encodeURIComponent(userId)}/report`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  }

  async getMyReports(
    page = 1,
    limit = 20
  ): Promise<PaginatedReportsDto> {
    return apiRequest<PaginatedReportsDto>(
      `/reports/my?page=${page}&limit=${limit}`
    );
  }
}

export const reportService = new ReportService();
