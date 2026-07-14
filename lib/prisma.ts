import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaNeonHTTP } from "@prisma/adapter-neon";
import { neon, types as neonTypes } from "@neondatabase/serverless";

/**
 * WHY THIS FILE EXISTS
 * -------------------
 * In development, Next's Hot Module Reload instantiates a brand-new module graph on
 * every save, which means `new PrismaClient()` would otherwise run on every edit —
 * blowing past Postgres' connection cap ("too many connections") within a few minutes.
 * We stash a single client on `globalThis` so all reloads reuse one connection pool.
 *
 * CRITICAL: We use the Prisma Neon HTTP adapter (`@prisma/adapter-neon`) which sends
 * all queries over HTTP — NOT TCP. TCP port 5432 is blocked from this environment,
 * so the default Prisma binary/library engine fails. The `neon()` HTTP function
 * talks to Neon's HTTP endpoint directly, bypassing the TCP restriction entirely.
 *
 * NOTE: HTTP mode does NOT support transactions. Most Prisma queries (reads, single
 * writes) work fine. Interactive multi-step transactions will throw at runtime.
 *
 * We also set `log: ["error","warn"]` so we surface N+1 warnings and bad queries in
 * dev without flooding prod logs.
 *
 * CUSTOM TYPE PARSERS — WHY THIS IS NECESSARY
 * The neon() HTTP function applies pg-types default parsers which convert timestamps
 * to Date objects and numerics to JS numbers. Prisma's WASM engine expects string
 * representations for DateTime, Decimal, and similar columns (matching the WebSocket
 * adapter's behavior). Without this override, Prisma throws:
 *   "Inconsistent column data: Conversion failed: expected a string in column 'createdAt', found {}"
 * The custom parsers below match the WebSocket adapter's customParsers in
 * @prisma/adapter-neon/dist/index.js (lines 334-354).
 */

/**
 * Custom type parsers for the Neon HTTP adapter.
 *
 * The neon() HTTP function uses pg-types default parsers which convert timestamps
 * to Date objects. Prisma's WASM engine expects strings for DateTime/Decimal columns
 * (matching the WebSocket adapter behavior). These overrides return raw strings so
 * Prisma handles the conversion itself.
 *
 * OID reference (PostgreSQL system catalogs):
 *   1114 = TIMESTAMP (without time zone)
 *   1184 = TIMESTAMPTZ (with time zone)
 *   1082 = DATE
 *   1083 = TIME
 *   1266 = TIMETZ
 *   1700 = NUMERIC
 *   114  = JSON
 *   3802 = JSONB
 *   17   = BYTEA
 */
const customTypeParsers = {
  getTypeParser: (oid: number, format: string) => {
    if (format === "text") {
      switch (oid) {
        case 1114: // TIMESTAMP — return string as-is
        case 1082: // DATE — return string as-is
        case 1083: // TIME — return string as-is
        case 1700: // NUMERIC — return string as-is (avoid float precision loss)
          return (val: string) => val;
        case 1184: // TIMESTAMPTZ — strip timezone suffix (match WS adapter)
        case 1266: // TIMETZ — strip timezone suffix
          return (val: string) => val.split("+")[0];
      }
    }
    // Fall back to pg-types defaults for all other types.
    // Cast to satisfy pg-types' overloaded signature (it accepts number + format
    // union, but its TS types expose a narrower overload set than its runtime API).
    return (neonTypes.getTypeParser as (oid: number, format: string) => any)(
      oid,
      format,
    );
  },
};

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Wraps the neon() HTTP function to inject custom type parsers into every query.
 * The adapter calls `this.client(sql, values, { arrayMode, fullResults })` — we
 * intercept that call and add `types` to the options so pg-types uses our parsers
 * instead of the defaults that break Prisma's WASM engine.
 */
function createNeonHttpClient(connectionString: string) {
  const baseNeon = neon(connectionString) as (
    sql: string,
    values?: any[],
    options?: Record<string, any>,
  ) => any;
  const client = (
    sql: string,
    values: any[],
    options: Record<string, any> = {},
  ) => {
    return baseNeon(sql, values, {
      ...options,
      types: customTypeParsers,
    });
  };
  // Preserve any static properties the adapter might check
  (client as any).types = (baseNeon as any).types;
  return client;
}

function createPrismaClient(): PrismaClient {
  const sql = createNeonHttpClient(process.env.DATABASE_URL!);
  const adapter = new PrismaNeonHTTP(sql as any);
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Convenience: a typed Prisma error detector for the `P2002` unique-constraint code.
 * Used by server actions to translate DB collisions into clean user-facing errors
 * ("That name is already taken.") instead of leaking internal Prisma detail.
 */
export function isUniqueConstraintError(
  err: unknown,
): err is Prisma.PrismaClientKnownRequestError {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2002"
  );
}

export type { PrismaClient } from "@prisma/client";
