import { getEnv } from "@/lib/env";

// Validating the environment at boot makes the app fail fast instead of on the first request
// (MASTERPLAN §8). Next.js only logs errors thrown from `register`, so exit explicitly.
try {
    getEnv();
} catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
}
