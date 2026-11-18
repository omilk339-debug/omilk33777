import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "로또번호추첨기",
  description: "1~45 중 6개 번호를 무작위로 추천해 드립니다. 재미로만 이용하세요.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
