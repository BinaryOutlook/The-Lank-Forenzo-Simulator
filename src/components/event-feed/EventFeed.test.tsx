import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EventFeed } from "./EventFeed";

describe("EventFeed", () => {
  it("shows only the 10 most recent history entries", () => {
    const history = Array.from({ length: 12 }, (_, index) => ({
      id: `entry-${index}`,
      round: 12 - index,
      source: "event" as const,
      title: `Entry ${index}`,
      body: `Body ${index}`,
      tone: "neutral" as const,
    }));

    render(<EventFeed history={history} />);

    expect(screen.getByText("Entry 0")).toBeInTheDocument();
    expect(screen.getByText("Entry 9")).toBeInTheDocument();
    expect(screen.queryByText("Entry 10")).not.toBeInTheDocument();
    expect(screen.queryByText("Entry 11")).not.toBeInTheDocument();
  });
});
