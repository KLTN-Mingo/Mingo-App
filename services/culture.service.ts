import {
  CultureTermDto,
  CultureTermsResponseDto,
  ReportTermRequestDto,
} from "@/dtos";
import { apiRequest } from "@/services/api-client";

class CultureService {
  /** GET /culture/posts/:postId/culture-terms — slang đã phát hiện trong post. */
  async getPostCultureTerms(postId: string): Promise<CultureTermDto[]> {
    const raw = await apiRequest<unknown>(
      `/culture/posts/${encodeURIComponent(postId)}/culture-terms`
    );
    return this.normalizeTerms(raw);
  }

  /** POST /culture/posts/:postId/reanalyze — gọi sau khi user edit post. */
  async reanalyzePost(postId: string): Promise<void> {
    await apiRequest<unknown>(
      `/culture/posts/${encodeURIComponent(postId)}/reanalyze`,
      { method: "POST" }
    );
  }

  /** POST /culture/posts/:postId/report-term — báo nghĩa sai. */
  async reportTerm(
    postId: string,
    payload: ReportTermRequestDto
  ): Promise<void> {
    await apiRequest<unknown>(
      `/culture/posts/${encodeURIComponent(postId)}/report-term`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  }

  private normalizeTerms(raw: unknown): CultureTermDto[] {
    if (Array.isArray(raw)) return raw as CultureTermDto[];
    if (raw && typeof raw === "object") {
      const o = raw as Partial<CultureTermsResponseDto>;
      if (Array.isArray(o.terms)) return o.terms;
    }
    return [];
  }
}

export const cultureService = new CultureService();
