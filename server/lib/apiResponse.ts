import { NextResponse } from 'next/server';

/**
 * APIレスポンスを統一的に生成するユーティリティクラス。
 *
 * 成功レスポンス: データをそのまま返却（またはmeta付き）
 * エラーレスポンス: { error: string }
 */
export class ApiResponse {
  /** 成功レスポンス (200) */
  static success<T>(data: T, meta?: Record<string, unknown>): NextResponse {
    if (meta) {
      return NextResponse.json({ ...data as object, ...meta });
    }
    return NextResponse.json(data);
  }

  /** リソース作成成功レスポンス (201) */
  static created<T>(data: T): NextResponse {
    return NextResponse.json(data, { status: 201 });
  }

  /** バリデーションエラーレスポンス (400) */
  static badRequest(message: string): NextResponse {
    return NextResponse.json({ error: message }, { status: 400 });
  }

  /** サーバーエラーレスポンス (500) */
  static serverError(message: string = 'Internal Server Error'): NextResponse {
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
