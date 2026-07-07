import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { PwaRegister } from "../PwaRegister";

describe("PwaRegister", () => {
  it("renders nothing", () => {
    const { container } = render(<PwaRegister />);
    expect(container.innerHTML).toBe("");
  });

  it("attempts to register service worker", () => {
    const register = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "serviceWorker", {
      value: { register },
      configurable: true,
    });
    render(<PwaRegister />);
    expect(register).toHaveBeenCalledWith("/sw.js");
  });
});
