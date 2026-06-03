// services/culture.service.ts
import { apiRequest } from "./api-client";

export interface CultureTerm {
  term: string;
  meaning: string;
  origin?: string;
  category?: string;
  confidence?: number;
}

export interface PostCultureTermsResponse {
  analyzed: boolean;
  terms: CultureTerm[];
}

class CultureService {
  /**
   * GET /api/culture/posts/:postId/culture-terms
   * Lấy danh sách thuật ngữ văn hóa (slang) trong một bài viết.
   */
  async getPostCultureTerms(postId: string): Promise<PostCultureTermsResponse> {
    return apiRequest<PostCultureTermsResponse>(
      `/culture/posts/${encodeURIComponent(postId)}/culture-terms`
    );
  }

  /**
   * POST /api/culture/posts/:postId/reanalyze
   * Yêu cầu BE phân tích lại bài viết (sau khi user chỉnh sửa).
   */
  async reAnalyzePost(postId: string): Promise<void> {
    return apiRequest<void>(
      `/culture/posts/${encodeURIComponent(postId)}/reanalyze`,
      { method: "POST" }
    );
  }

  /**
   * POST /api/culture/posts/:postId/report-term
   * Báo cáo một thuật ngữ bị giải thích sai.
   */
  async reportTerm(postId: string, term: string): Promise<void> {
    return apiRequest<void>(
      `/culture/posts/${encodeURIComponent(postId)}/report-term`,
      {
        method: "POST",
        body: JSON.stringify({ term }),
      }
    );
  }
}

export const cultureService = new CultureService();
