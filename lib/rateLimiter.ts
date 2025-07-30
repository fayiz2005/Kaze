import { RateLimiterMemory } from "rate-limiter-flexible";


export const sensitiveActionLimiter = new RateLimiterMemory({
  points: 3,
  duration: 60 * 60, 
});
