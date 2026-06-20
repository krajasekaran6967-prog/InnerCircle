import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import LandingScreen from "../screens/LandingScreen";

// Mock api module
vi.mock("../api.js", () => ({
  api: {
    login: vi.fn(),
    signup: vi.fn(),
  },
}));

import { api } from "../api.js";

beforeEach(() => vi.clearAllMocks());

// ── LandingScreen ────────────────────────────────────────
describe("LandingScreen", () => {
  it("navigates to login on button click", async () => {
    const onNavigate = vi.fn();
    render(<LandingScreen onNavigate={onNavigate} />);
    await userEvent.click(screen.getByRole("button", { name: /log in/i }));
    expect(onNavigate).toHaveBeenCalledWith("login");
  });

  it("navigates to signup on button click", async () => {
    const onNavigate = vi.fn();
    render(<LandingScreen onNavigate={onNavigate} />);
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));
    expect(onNavigate).toHaveBeenCalledWith("signup");
  });
});

// ── LoginScreen ──────────────────────────────────────────
describe("LoginScreen", () => {
  it("calls onLogin with user on success", async () => {
    const user = { id: "1", name: "Alice", email: "alice@test.com" };
    api.login.mockResolvedValue({ user });
    const onLogin = vi.fn();

    render(<LoginScreen onLogin={onLogin} onNavigate={() => {}} />);
    await userEvent.type(screen.getByLabelText(/email/i), "alice@test.com");
    await userEvent.type(screen.getByLabelText(/password/i), "password1");
    await userEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => expect(onLogin).toHaveBeenCalledWith(user));
  });

  it("shows error message on failure", async () => {
    api.login.mockRejectedValue(new Error("Invalid credentials."));
    render(<LoginScreen onLogin={() => {}} onNavigate={() => {}} />);
    await userEvent.type(screen.getByLabelText(/email/i), "bad@test.com");
    await userEvent.type(screen.getByLabelText(/password/i), "wrongpass");
    await userEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => expect(screen.getByText("Invalid credentials.")).toBeInTheDocument());
  });
});

// ── SignupScreen ─────────────────────────────────────────
describe("SignupScreen", () => {
  it("calls onLogin with user on success", async () => {
    const user = { id: "2", name: "Bob", email: "bob@test.com" };
    api.signup.mockResolvedValue({ user });
    const onLogin = vi.fn();

    render(<SignupScreen onLogin={onLogin} onNavigate={() => {}} />);
    await userEvent.type(screen.getByLabelText(/full name/i), "Bob");
    await userEvent.type(screen.getByLabelText(/email/i), "bob@test.com");
    await userEvent.type(screen.getByLabelText(/department/i), "Design");
    await userEvent.type(screen.getByLabelText(/password/i), "password1");
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => expect(onLogin).toHaveBeenCalledWith(user));
  });

  it("shows error on failure", async () => {
    api.signup.mockRejectedValue(new Error("Email already in use."));
    render(<SignupScreen onLogin={() => {}} onNavigate={() => {}} />);
    await userEvent.type(screen.getByLabelText(/full name/i), "Dup");
    await userEvent.type(screen.getByLabelText(/email/i), "dup@test.com");
    await userEvent.type(screen.getByLabelText(/department/i), "Eng");
    await userEvent.type(screen.getByLabelText(/password/i), "password1");
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => expect(screen.getByText("Email already in use.")).toBeInTheDocument());
  });
});
