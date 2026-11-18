"use client";

import { useEffect, useState } from "react";
import { ballColor, generate, MAX, MIN, validate, type Options } from "@/lib/lotto";

type Mode = "none" | "fixed" | "excluded";
type HistoryItem = { at: string; games: number[][] };

const HISTORY_KEY = "lotto-history";

function Ball({ n, small }: { n: number; small?: boolean }) {
  return (
    <span
      className={`${ballColor(n)} ${small ? "h-7 w-7 text-xs" : "h-10 w-10 text-base sm:h-11 sm:w-11"} inline-flex shrink-0 items-center justify-center rounded-full font-bold shadow-sm`}
    >
      {n}
    </span>
  );
}

export default function Home() {
  const [count, setCount] = useState(5);
  const [fixed, setFixed] = useState<number[]>([]);
  const [excluded, setExcluded] = useState<number[]>([]);
  const [mode, setMode] = useState<Mode>("fixed");
  const [balanceOddEven, setBalanceOddEven] = useState(false);
  const [sumRange, setSumRange] = useState(false);
  const [games, setGames] = useState<number[][]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) setHistory(JSON.parse(saved));
    } catch {}
  }, []);

  const saveHistory = (next: HistoryItem[]) => {
    setHistory(next);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    } catch {}
  };

  const toggleNumber = (n: number) => {
    setMessage(null);
    if (mode === "fixed") {
      setExcluded((e) => e.filter((x) => x !== n));
      setFixed((f) => {
        if (f.includes(n)) return f.filter((x) => x !== n);
        if (f.length >= 5) {
          setMessage("고정수는 최대 5개까지 선택할 수 있어요.");
          return f;
        }
        return [...f, n].sort((a, b) => a - b);
      });
    } else if (mode === "excluded") {
      setFixed((f) => f.filter((x) => x !== n));
      setExcluded((e) => (e.includes(n) ? e.filter((x) => x !== n) : [...e, n].sort((a, b) => a - b)));
    }
  };

  const onGenerate = () => {
    const opts: Options = { fixed, excluded, balanceOddEven, sumRange };
    const err = validate(opts);
    if (err) {
      setMessage(err);
      return;
    }
    setMessage(null);
    const result = Array.from({ length: count }, () => generate(opts));
    setGames(result);
    saveHistory([{ at: new Date().toLocaleString("ko-KR"), games: result }, ...history].slice(0, 20));
  };

  const copyGames = async (list: number[][]) => {
    const text = list.map((g, i) => `${String.fromCharCode(65 + i)}: ${g.join(", ")}`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setMessage("번호를 복사했어요.");
    } catch {
      setMessage("복사에 실패했어요. 직접 선택해서 복사해 주세요.");
    }
  };

  const numbers = Array.from({ length: MAX - MIN + 1 }, (_, i) => i + MIN);

  return (
    <main className="mx-auto max-w-xl px-4 py-8 sm:py-12">
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-extrabold sm:text-3xl">🎱 로또 번호 추천기</h1>
        <p className="mt-2 text-sm text-zinc-500">1~45 중 6개 번호를 무작위로 골라 드려요.</p>
      </header>

      {/* 결과 */}
      <section className="mb-6 rounded-2xl bg-white p-4 shadow-sm dark:bg-zinc-900">
        {games.length === 0 ? (
          <p className="py-8 text-center text-zinc-400">아래 버튼을 눌러 번호를 뽑아 보세요.</p>
        ) : (
          <ul className="space-y-3">
            {games.map((g, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="w-5 text-sm font-semibold text-zinc-400">{String.fromCharCode(65 + i)}</span>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {g.map((n) => (
                    <Ball key={n} n={n} />
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex gap-2">
          <button
            onClick={onGenerate}
            className="flex-1 rounded-xl bg-indigo-600 py-3 font-bold text-white transition hover:bg-indigo-700 active:scale-[0.98]"
          >
            번호 뽑기
          </button>
          {games.length > 0 && (
            <button
              onClick={() => copyGames(games)}
              className="rounded-xl border border-zinc-300 px-4 font-semibold hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              복사
            </button>
          )}
        </div>
        {message && <p className="mt-3 text-center text-sm text-indigo-600 dark:text-indigo-400">{message}</p>}
      </section>

      {/* 옵션 */}
      <section className="mb-6 space-y-4 rounded-2xl bg-white p-4 shadow-sm dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <label htmlFor="count" className="font-semibold">게임 수</label>
          <select
            id="count"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="rounded-lg border border-zinc-300 bg-transparent px-3 py-1.5 dark:border-zinc-700"
          >
            {[1, 2, 3, 4, 5, 10].map((n) => (
              <option key={n} value={n}>{n}게임</option>
            ))}
          </select>
        </div>

        <label className="flex items-center justify-between">
          <span>
            <span className="font-semibold">홀짝 균형</span>
            <span className="ml-2 text-xs text-zinc-500">홀수 2~4개</span>
          </span>
          <input type="checkbox" className="h-5 w-5 accent-indigo-600" checked={balanceOddEven} onChange={(e) => setBalanceOddEven(e.target.checked)} />
        </label>

        <label className="flex items-center justify-between">
          <span>
            <span className="font-semibold">합계 범위</span>
            <span className="ml-2 text-xs text-zinc-500">6개 합 100~175</span>
          </span>
          <input type="checkbox" className="h-5 w-5 accent-indigo-600" checked={sumRange} onChange={(e) => setSumRange(e.target.checked)} />
        </label>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="font-semibold">번호 지정</span>
            <div className="flex rounded-lg bg-zinc-100 p-0.5 text-sm dark:bg-zinc-800">
              <button
                onClick={() => setMode("fixed")}
                className={`rounded-md px-3 py-1 ${mode === "fixed" ? "bg-white font-semibold text-indigo-600 shadow dark:bg-zinc-700 dark:text-indigo-300" : "text-zinc-500"}`}
              >
                고정수 {fixed.length > 0 && `(${fixed.length})`}
              </button>
              <button
                onClick={() => setMode("excluded")}
                className={`rounded-md px-3 py-1 ${mode === "excluded" ? "bg-white font-semibold text-rose-600 shadow dark:bg-zinc-700 dark:text-rose-300" : "text-zinc-500"}`}
              >
                제외수 {excluded.length > 0 && `(${excluded.length})`}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-9 gap-1.5">
            {numbers.map((n) => {
              const isFixed = fixed.includes(n);
              const isExcluded = excluded.includes(n);
              return (
                <button
                  key={n}
                  onClick={() => toggleNumber(n)}
                  aria-pressed={isFixed || isExcluded}
                  className={`aspect-square rounded-lg text-sm font-semibold transition ${
                    isFixed
                      ? "bg-indigo-600 text-white"
                      : isExcluded
                        ? "bg-rose-100 text-rose-400 line-through dark:bg-rose-950 dark:text-rose-500"
                        : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                  }`}
                >
                  {n}
                </button>
              );
            })}
          </div>
          {(fixed.length > 0 || excluded.length > 0) && (
            <button
              onClick={() => {
                setFixed([]);
                setExcluded([]);
              }}
              className="mt-2 text-sm text-zinc-500 underline"
            >
              선택 초기화
            </button>
          )}
        </div>
      </section>

      {/* 기록 */}
      {history.length > 0 && (
        <section className="mb-6 rounded-2xl bg-white p-4 shadow-sm dark:bg-zinc-900">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">최근 기록</h2>
            <button onClick={() => saveHistory([])} className="text-sm text-zinc-500 underline">
              지우기
            </button>
          </div>
          <ul className="space-y-3">
            {history.map((h, i) => (
              <li key={i} className="border-t border-zinc-100 pt-3 first:border-0 first:pt-0 dark:border-zinc-800">
                <div className="mb-1.5 flex items-center justify-between text-xs text-zinc-500">
                  <span>{h.at}</span>
                  <button onClick={() => copyGames(h.games)} className="underline">복사</button>
                </div>
                <div className="space-y-1">
                  {h.games.map((g, j) => (
                    <div key={j} className="flex gap-1">
                      {g.map((n) => (
                        <Ball key={n} n={n} small />
                      ))}
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className="text-center text-xs leading-relaxed text-zinc-400">
        모든 번호 조합의 당첨 확률은 동일합니다. 재미로만 이용해 주세요.
        <br />
        과도한 복권 구매는 삼가 주세요.
      </footer>
    </main>
  );
}
