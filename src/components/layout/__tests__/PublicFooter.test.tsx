import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PublicFooter } from "../PublicFooter";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("PublicFooter", () => {
  it("renders the brand name", () => {
    render(<PublicFooter />);
    const brandElements = screen.getAllByText(/Skill Workshop/i);
    expect(brandElements.length).toBeGreaterThan(0);
  });

  it("renders the copyright text", () => {
    render(<PublicFooter />);
    expect(screen.getByText(/Skill Workshop\. All rights reserved/i)).toBeInTheDocument();
  });

  it("renders Privacy Policy link", () => {
    render(<PublicFooter />);
    const privacyLink = screen.getByText("Privacy Policy");
    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink.closest("a")).toHaveAttribute("href", "/privacy");
  });

  it("renders Terms of Service link", () => {
    render(<PublicFooter />);
    const termsLink = screen.getByText("Terms of Service");
    expect(termsLink).toBeInTheDocument();
    expect(termsLink.closest("a")).toHaveAttribute("href", "/terms");
  });

  it("renders contact email", () => {
    render(<PublicFooter />);
    expect(screen.getByText("info@skillworkshop.com")).toBeInTheDocument();
  });

  it("renders contact phone", () => {
    render(<PublicFooter />);
    expect(screen.getByText("+880 1712-345678")).toBeInTheDocument();
  });

  it("renders office address", () => {
    render(<PublicFooter />);
    expect(screen.getByText("Dhaka, Bangladesh")).toBeInTheDocument();
  });

  it.each([
    ["Browse Workshops", "/workshops"],
    ["Categories", "/categories"],
    ["About Us", "/about"],
    ["Contact Us", "/contact"],
    ["FAQ", "/faq"],
  ])("renders platform link '%s' with href '%s'", (label, href) => {
    render(<PublicFooter />);
    const links = screen.getAllByText(label);
    const match = links.find((l) => l.closest("a")?.getAttribute("href") === href);
    expect(match).toBeTruthy();
  });

  it.each([
    ["Become an Instructor", "/register?role=instructor"],
    ["Instructor Dashboard", "/instructor/dashboard"],
    ["FAQ", "/faq"],
    ["Contact Support", "/contact"],
  ])("renders instructor link '%s' with href '%s'", (label, href) => {
    render(<PublicFooter />);
    const links = screen.getAllByText(label);
    const match = links.find((l) => l.closest("a")?.getAttribute("href") === href);
    expect(match).toBeTruthy();
  });

  it.each(["Facebook", "Twitter", "LinkedIn", "YouTube"])(
    "renders social link with aria-label '%s'",
    (label) => {
      render(<PublicFooter />);
      const link = screen.getByRole("link", { name: label });
      expect(link).toBeInTheDocument();
    }
  );

  it("renders the Platform section heading", () => {
    render(<PublicFooter />);
    expect(screen.getByText("Platform")).toBeInTheDocument();
  });

  it("renders the For Instructors section heading", () => {
    render(<PublicFooter />);
    expect(screen.getByText("For Instructors")).toBeInTheDocument();
  });

  it("renders the Contact Info section heading", () => {
    render(<PublicFooter />);
    expect(screen.getByText("Contact Info")).toBeInTheDocument();
  });
});
