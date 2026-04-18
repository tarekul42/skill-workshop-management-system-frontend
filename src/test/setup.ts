import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Hook into vitest's global expect if needed
// Or just rely on the side-effects of importing jest-dom

afterEach(() => {
  cleanup();
});
