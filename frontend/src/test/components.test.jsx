import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Avatar from "../components/Avatar";
import InlineForm from "../components/InlineForm";
import NavBar from "../components/NavBar";
import Toast from "../components/Toast";

// ── Avatar ──────────────────────────────────────────────
describe("Avatar", () => {
  it("shows initials when no thumbnailUrl", () => {
    render(<Avatar user={{ name: "John Doe" }} />);
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("renders image when thumbnailUrl provided", () => {
    render(<Avatar user={{ name: "Jane", thumbnailUrl: "/uploads/jane.jpg" }} />);
    // alt="" makes role presentation; query by class instead
    const img = document.querySelector(".avatar-img");
    expect(img).toHaveAttribute("src", "/uploads/jane.jpg");
  });

  it("applies size class", () => {
    const { container } = render(<Avatar user={{ name: "A" }} size="xl" />);
    expect(container.firstChild).toHaveClass("avatar-xl");
  });
});

// ── InlineForm ───────────────────────────────────────────
describe("InlineForm", () => {
  it("calls onSubmit with trimmed text and clears input", async () => {
    const onSubmit = vi.fn();
    render(<InlineForm onSubmit={onSubmit} placeholder="Write…" />);
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "  hello  ");
    fireEvent.submit(input.closest("form"));
    expect(onSubmit).toHaveBeenCalledWith("hello");
    expect(input.value).toBe("");
  });

  it("does not call onSubmit when input is empty", () => {
    const onSubmit = vi.fn();
    render(<InlineForm onSubmit={onSubmit} placeholder="Write…" />);
    fireEvent.submit(screen.getByRole("textbox").closest("form"));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

// ── NavBar ───────────────────────────────────────────────
describe("NavBar", () => {
  const tabs = ["home", "directory", "messages", "profile"];

  it("marks active tab with nav-active class", () => {
    render(<NavBar activePage="messages" onNavigate={() => {}} />);
    const active = screen.getByRole("tab", { name: /messages/i });
    expect(active).toHaveClass("nav-active");
  });

  it("sets aria-selected=true on active tab only", () => {
    render(<NavBar activePage="directory" onNavigate={() => {}} />);
    tabs.forEach((tab) => {
      const btn = screen.getByRole("tab", { name: new RegExp(tab, "i") });
      expect(btn.getAttribute("aria-selected")).toBe(tab === "directory" ? "true" : "false");
    });
  });

  it("calls onNavigate with correct page on click", async () => {
    const onNavigate = vi.fn();
    render(<NavBar activePage="home" onNavigate={onNavigate} />);
    await userEvent.click(screen.getByRole("tab", { name: /profile/i }));
    expect(onNavigate).toHaveBeenCalledWith("profile");
  });
});

// ── Toast ────────────────────────────────────────────────
describe("Toast", () => {
  it("renders message text", () => {
    render(<Toast message="Saved!" type="success" />);
    expect(screen.getByText("Saved!")).toBeInTheDocument();
  });

  it("applies error class for error type", () => {
    const { container } = render(<Toast message="Oops" type="error" />);
    expect(container.firstChild).toHaveClass("toast-error");
  });

  it("renders nothing when message is empty", () => {
    const { container } = render(<Toast message="" type="success" />);
    expect(container.firstChild).toBeNull();
  });
});
