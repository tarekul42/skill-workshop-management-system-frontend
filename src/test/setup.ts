import "@testing-library/jest-dom";
import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Hook into vitest's global expect if needed
// Or just rely on the side-effects of importing jest-dom

afterEach(() => {
  cleanup();
});
