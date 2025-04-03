import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { CreateChecklistButton } from "./create-button";

// Mock next/navigation and sonner
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("CreateChecklistButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  it("renders correctly", () => {
    render(<CreateChecklistButton />);
    expect(screen.getByText("Start New Checklist")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeEnabled();
  });

  it("disables button during API call", async () => {
    mockFetch.mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => 
        resolve({
          ok: true,
          json: () => Promise.resolve({ hash: "test123" }),
        }), 100))
    );

    render(<CreateChecklistButton />);
    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(button).toBeDisabled();
    await waitFor(() => expect(button).toBeEnabled());
  });

  it("handles successful checklist creation", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ hash: "test123" }),
    });

    render(<CreateChecklistButton />);
    fireEvent.click(screen.getByText("Start New Checklist"));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/checklists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Untitled Checklist",
        }),
      });
      expect(toast.success).toHaveBeenCalledWith("Checklist created successfully");
      expect(mockPush).toHaveBeenCalledWith("/c/test123");
    });
  });

  it("handles API errors with status text", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: "Forbidden",
      json: () => Promise.resolve({}),
    });

    render(<CreateChecklistButton />);
    fireEvent.click(screen.getByText("Start New Checklist"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to create checklist");
    });
  });

  it("handles API errors with error message", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: "Test error" }),
    });

    render(<CreateChecklistButton />);
    fireEvent.click(screen.getByText("Start New Checklist"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Test error");
    });
  });

  it("handles network errors", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<CreateChecklistButton />);
    fireEvent.click(screen.getByText("Start New Checklist"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Network error");
    });
  });

  it("handles invalid response format", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    render(<CreateChecklistButton />);
    fireEvent.click(screen.getByText("Start New Checklist"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid response from server");
    });
  });

  it("handles empty response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(null),
    });

    render(<CreateChecklistButton />);
    fireEvent.click(screen.getByText("Start New Checklist"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid response from server");
    });
  });

  it("handles malformed JSON response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.reject(new Error("Invalid JSON")),
    });

    render(<CreateChecklistButton />);
    fireEvent.click(screen.getByText("Start New Checklist"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid JSON");
    });
  });
});