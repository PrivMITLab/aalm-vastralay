// Next.js middleware entry point — must be in this file for framework recognition.
// All logic lives in ./proxy to keep it testable in isolation.
export { proxy as default, config } from "./proxy";
