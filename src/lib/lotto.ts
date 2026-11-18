export const MIN = 1;
export const MAX = 45;
export const PICK = 6;

export type Options = {
  fixed: number[];
  excluded: number[];
  balanceOddEven: boolean; // 홀짝 2:4 ~ 4:2 만 허용
  sumRange: boolean; // 합계 100~175 만 허용
};

function randomInt(maxExclusive: number): number {
  // 모듈로 편향 없는 균등 난수
  const limit = Math.floor(0x100000000 / maxExclusive) * maxExclusive;
  const buf = new Uint32Array(1);
  let x: number;
  do {
    crypto.getRandomValues(buf);
    x = buf[0];
  } while (x >= limit);
  return x % maxExclusive;
}

function pickOnce(fixed: number[], excluded: number[]): number[] {
  const pool: number[] = [];
  for (let n = MIN; n <= MAX; n++) {
    if (!fixed.includes(n) && !excluded.includes(n)) pool.push(n);
  }
  const result = [...fixed];
  while (result.length < PICK) {
    result.push(pool.splice(randomInt(pool.length), 1)[0]);
  }
  return result.sort((a, b) => a - b);
}

function passes(nums: number[], opts: Options): boolean {
  if (opts.balanceOddEven) {
    const odd = nums.filter((n) => n % 2 === 1).length;
    if (odd < 2 || odd > 4) return false;
  }
  if (opts.sumRange) {
    const sum = nums.reduce((a, b) => a + b, 0);
    if (sum < 100 || sum > 175) return false;
  }
  return true;
}

export function validate(opts: Options): string | null {
  if (opts.fixed.length > PICK - 1) return `고정수는 최대 ${PICK - 1}개까지 가능합니다.`;
  if (MAX - opts.excluded.length < PICK) return "제외수가 너무 많아 6개를 뽑을 수 없습니다.";
  return null;
}

export function generate(opts: Options): number[] {
  // 필터 조건을 만족할 때까지 재시도 (불가능한 조건이면 마지막 결과 반환)
  let nums = pickOnce(opts.fixed, opts.excluded);
  for (let i = 0; i < 2000 && !passes(nums, opts); i++) {
    nums = pickOnce(opts.fixed, opts.excluded);
  }
  return nums;
}

export function ballColor(n: number): string {
  if (n <= 10) return "bg-yellow-400 text-yellow-950";
  if (n <= 20) return "bg-sky-500 text-white";
  if (n <= 30) return "bg-rose-500 text-white";
  if (n <= 40) return "bg-zinc-500 text-white";
  return "bg-emerald-500 text-white";
}
