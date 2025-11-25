import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import React from "react";

import ChatDisplay from "main/components/Chat/ChatDisplay";
import userCommonsFixtures from "fixtures/userCommonsFixtures";
import { chatMessageFixtures } from "fixtures/chatMessageFixtures";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const makeClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        cacheTime: 0,
        staleTime: 0,
      },
    },
  });

describe("ChatDisplay tests", () => {
  let axiosMock;
  const commonsId = 1;

  beforeEach(() => {
    axiosMock = new AxiosMockAdapter(axios);
  });

  afterEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
  });

  test("renders ChatDisplay container styles", async () => {
    axiosMock.onGet("/api/chat/get").reply(200, { content: [], last: true });
    axiosMock.onGet("/api/usercommons/commons/all").reply(200, []);

    render(
      <QueryClientProvider client={makeClient()}>
        <MemoryRouter>
          <ChatDisplay commonsId={commonsId} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("ChatDisplay")).toBeInTheDocument();
    });

    const div = screen.getByTestId("ChatDisplay");
    expect(div).toHaveStyle("display: flex");
    expect(div).toHaveStyle("overflowY: scroll");
    expect(div).toHaveStyle("maxHeight: 300px");
    expect(div).toHaveStyle("flexDirection: column-reverse");
  });

  test("displays no messages when backend returns empty content", async () => {
    axiosMock.onGet("/api/chat/get").reply(200, { content: [], last: true });
    axiosMock.onGet("/api/usercommons/commons/all").reply(200, []);

    render(
      <QueryClientProvider client={makeClient()}>
        <MemoryRouter>
          <ChatDisplay commonsId={commonsId} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("ChatDisplay")).toBeInTheDocument();
    });

    expect(screen.queryByText("Hello World")).not.toBeInTheDocument();
    expect(screen.queryByText("Anonymous")).not.toBeInTheDocument();
  });

  test("displays three messages with correct usernames and sorted newest to oldest", async () => {
    axiosMock.onGet("/api/chat/get").reply(200, {
      content: chatMessageFixtures.threeChatMessages,
      last: true,
    });

    axiosMock
      .onGet("/api/usercommons/commons/all")
      .reply(200, userCommonsFixtures.threeUserCommons);

    render(
      <QueryClientProvider client={makeClient()}>
        <MemoryRouter>
          <ChatDisplay commonsId={commonsId} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      const nodes = screen.getAllByTestId(/^ChatMessageDisplay-\d+$/);
      expect(nodes.length).toBe(3);
    });

    const container = screen.getByTestId("ChatDisplay").children;

    expect(container[0].getAttribute("data-testid")).toBe(
      "ChatMessageDisplay-3",
    );
    expect(container[1].getAttribute("data-testid")).toBe(
      "ChatMessageDisplay-2",
    );
    expect(container[2].getAttribute("data-testid")).toBe(
      "ChatMessageDisplay-1",
    );

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

    expect(screen.getByTestId("ChatMessageDisplay-3-User")).toHaveTextContent(
      "John Adams",
    );
  });

  test("displays one message with Anonymous username when userCommons has no username", async () => {
    axiosMock
      .onGet("/api/chat/get")
      .reply(200, { content: chatMessageFixtures.oneChatMessage, last: true });

    axiosMock.onGet("/api/usercommons/commons/all").reply(200, [{ userId: 1 }]);

    render(
      <QueryClientProvider client={makeClient()}>
        <MemoryRouter>
          <ChatDisplay commonsId={commonsId} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("ChatMessageDisplay-1")).toBeInTheDocument();
    });

    expect(screen.getByTestId("ChatMessageDisplay-1-User")).toHaveTextContent(
      "Anonymous",
    );
  });

  test("loads 10 messages first, then 2 older messages after clicking More messages", async () => {
    axiosMock
      .onGet("/api/chat/get", {
        params: { commonsId: 1, page: 0, size: 10 },
      })
      .reply(200, {
        content: chatMessageFixtures.twelveChatMessages.slice(0, 10),
        last: false,
      });

    axiosMock
      .onGet("/api/chat/get", {
        params: { commonsId: 1, page: 1, size: 10 },
      })
      .reply(200, {
        content: chatMessageFixtures.twelveChatMessages.slice(10),
        last: true,
      });

    axiosMock
      .onGet("/api/usercommons/commons/all", {
        params: { commonsId: 1 },
      })
      .reply(200, userCommonsFixtures.tenUserCommons);

    render(
      <QueryClientProvider client={makeClient()}>
        <MemoryRouter>
          <ChatDisplay commonsId={1} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      const topLevel = screen.getAllByTestId(/^ChatMessageDisplay-\d+$/);
      expect(topLevel).toHaveLength(10);
    });

    expect(screen.getByTestId("MoreMessagesButton")).toBeInTheDocument();

    screen.getByTestId("MoreMessagesButton").click();

    await waitFor(() => {
      const topLevel = screen.getAllByTestId(/^ChatMessageDisplay-\d+$/);
      expect(topLevel).toHaveLength(12);
    });

    expect(screen.getByTestId("NoMoreMessages")).toBeInTheDocument();
  });

  test("ChatDisplay does not retry failed requests", async () => {
    axiosMock.onGet("/api/chat/get").reply(500);
    axiosMock.onGet("/api/usercommons/commons/all").reply(200, []);

    render(
      <QueryClientProvider client={makeClient()}>
        <MemoryRouter>
          <ChatDisplay commonsId={commonsId} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBe(2);
    });
  });

  test("ChatDisplay does not refetch on window focus", async () => {
    axiosMock.onGet("/api/chat/get").reply(200, { content: [], last: true });
    axiosMock.onGet("/api/usercommons/commons/all").reply(200, []);

    render(
      <QueryClientProvider client={makeClient()}>
        <MemoryRouter>
          <ChatDisplay commonsId={commonsId} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const before = axiosMock.history.get.length;

    window.dispatchEvent(new Event("focus"));

    await Promise.resolve();
    expect(axiosMock.history.get.length).toBe(before);
  });
});
