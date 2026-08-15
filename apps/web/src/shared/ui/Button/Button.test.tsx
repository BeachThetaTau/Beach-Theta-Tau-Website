import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";

describe("Button", () => {
  it("renders its label and handles clicks", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button text="Learn More" onClick={onClick} />);
    await user.click(screen.getByRole("button", { name: "Learn More" }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
