import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";

import ChatDisplay from "main/components/Chat/ChatDisplay";
import userCommonsFixtures from "fixtures/userCommonsFixtures";
import { chatMessageFixtures } from "fixtures/chatMessageFixtures";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

describe("ChatDisplay tests", () => {
  const queryClient = new QueryClient();
  const axiosMock = new AxiosMockAdapter(axios);
  const commonsId = 1;

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
    queryClient.clear();
  });

  test("renders without crashing", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatDisplay commonsId={commonsId} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("ChatDisplay")).toBeInTheDocument();
    });

    expect(screen.getByTestId("ChatDisplay")).toHaveStyle("overflowY: scroll");
    expect(screen.getByTestId("ChatDisplay")).toHaveStyle("maxHeight: 300px");
    expect(screen.getByTestId("ChatDisplay")).toHaveStyle("display: flex");
    expect(screen.getByTestId("ChatDisplay")).toHaveStyle(
      "flexDirection: column-reverse",
    );
  });

  test("does not crash when messagesPage is null", async () => {
    axiosMock.onGet(/\/api\/chat\/get.*/).reply(200, null);
    axiosMock.onGet(/\/api\/usercommons\/commons\/all.*/).reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatDisplay commonsId={commonsId} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("ChatDisplay")).toBeInTheDocument(),
    );
  });

  test("displays three messages correctly with usernames in the correct order", async () => {
    axiosMock.onGet(/\/api\/chat\/get.*/).replyOnce(200, {
      content: chatMessageFixtures.threeChatMessages,
      last: true,
    });
    axiosMock
      // .onGet("/api/usercommons/commons/all")
      .onGet(/\/api\/usercommons\/commons\/all.*/)
      .replyOnce(200, userCommonsFixtures.threeUserCommons);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatDisplay commonsId={commonsId} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // await waitFor(() => {
    //   expect(screen.getAllByTestId(/ChatMessageDisplay-/).length).toBe(3);
    // });

    await waitFor(() => {
      const topLevelCards = screen.getAllByTestId(/^ChatMessageDisplay-\d+$/);
      expect(topLevelCards).toHaveLength(3);
    });

    expect(screen.getByTestId("ChatMessageDisplay-1-User")).toHaveTextContent(
      "George Washington",
    );
    expect(
      screen.getByTestId("ChatMessageDisplay-1-Message"),
    ).toHaveTextContent("Hello World");
    expect(screen.getByTestId("ChatMessageDisplay-1-Date")).toHaveTextContent(
      "2023-08-17 23:57:46",
    );

    expect(screen.getByTestId("ChatMessageDisplay-2-User")).toHaveTextContent(
      "Thomas Jefferson",
    );
    expect(
      screen.getByTestId("ChatMessageDisplay-2-Message"),
    ).toHaveTextContent("Hello World How are you doing???");
    expect(screen.getByTestId("ChatMessageDisplay-2-Date")).toHaveTextContent(
      "2023-08-18 02:59:11",
    );

    expect(screen.getByTestId("ChatMessageDisplay-3-User")).toHaveTextContent(
      "John Adams",
    );
    expect(
      screen.getByTestId("ChatMessageDisplay-3-Message"),
    ).toHaveTextContent("This is another test for chat messaging");
    expect(screen.getByTestId("ChatMessageDisplay-3-Date")).toHaveTextContent(
      "2023-08-18 02:59:28",
    );
  });

  test("loads 10 messages first, then loads 2 older messages after clicking More messages", async () => {
    // --- Page 0 mock: IDs 3–12 ---
    axiosMock
      .onGet("/api/chat/get", {
        params: { commonsId: commonsId, page: 0, size: 10 },
      })
      .reply(200, {
        content: chatMessageFixtures.twelveChatMessages.slice(2),
        last: false,
      });

    // --- Page 1 mock: IDs 1–2 ---
    axiosMock
      .onGet("/api/chat/get", {
        params: { commonsId: commonsId, page: 1, size: 10 },
      })
      .reply(200, {
        content: chatMessageFixtures.twelveChatMessages.slice(0, 2),
        last: true,
      });

    // --- Users ---
    axiosMock
      .onGet("/api/usercommons/commons/all", { params: { commonsId } })
      .reply(200, userCommonsFixtures.tenUserCommons);

    // Render
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatDisplay commonsId={commonsId} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // PAGE 0 (first 10 messages)
    await waitFor(() => {
      const topLevel = screen.getAllByTestId(/^ChatMessageDisplay-\d+$/);
      expect(topLevel).toHaveLength(10);
    });

    expect(screen.getByTestId("ChatDisplay-More")).toBeInTheDocument();

    // Click more
    screen.getByTestId("ChatDisplay-More").click();

    // PAGE 1 (all 12 messages)
    await waitFor(() => {
      const topLevel = screen.getAllByTestId(/^ChatMessageDisplay-\d+$/);
      expect(topLevel).toHaveLength(12);
    });

    expect(screen.getByTestId("ChatDisplay-End")).toBeInTheDocument();
  });

  test("displays correct usernames for all 12 messages", async () => {
    axiosMock
      .onGet("/api/chat/get", {
        params: { commonsId, page: 0, size: 10 },
      })
      .reply(200, {
        content: chatMessageFixtures.twelveChatMessages.slice(2),
        last: false,
      });

    axiosMock
      .onGet("/api/chat/get", {
        params: { commonsId, page: 1, size: 10 },
      })
      .reply(200, {
        content: chatMessageFixtures.twelveChatMessages.slice(0, 2),
        last: true,
      });

    axiosMock
      .onGet("/api/usercommons/commons/all", { params: { commonsId } })
      .reply(200, userCommonsFixtures.tenUserCommons);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatDisplay commonsId={commonsId} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // Load first 10
    await waitFor(() => {
      const topLevel = screen.getAllByTestId(/^ChatMessageDisplay-\d+$/);
      expect(topLevel).toHaveLength(10);
    });

    // Load remaining 2
    screen.getByTestId("ChatDisplay-More").click();

    await waitFor(() => {
      const topLevel = screen.getAllByTestId(/^ChatMessageDisplay-\d+$/);
      expect(topLevel).toHaveLength(12);
    });

    const sortedFixtures = [...chatMessageFixtures.twelveChatMessages].sort(
      (a, b) => b.id - a.id,
    );

    sortedFixtures.forEach((msg) => {
      const username =
        userCommonsFixtures.tenUserCommons.find((u) => u.userId === msg.userId)
          ?.username || "Anonymous";

      expect(
        screen.getByTestId(`ChatMessageDisplay-${msg.id}-User`),
      ).toHaveTextContent(username);
    });
  });

  test("falls back to anonymous when username is missing", async () => {
    axiosMock.onGet(/\/api\/chat\/get.*/).reply(200, {
      content: [
        { id: 999, userId: 123, message: "Hi", timestamp: "2023-01-01" },
      ],
      last: true,
    });

    axiosMock
      .onGet(/\/api\/usercommons\/commons\/all.*/)
      .reply(200, [{ userId: 123 }]);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatDisplay commonsId={commonsId} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // UI renders "Anonymous"
    await waitFor(() => {
      expect(
        screen.getByTestId("ChatMessageDisplay-999-User"),
      ).toHaveTextContent("Anonymous");
    });
  });
});
