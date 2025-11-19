// import React from "react";
import React, { useState, useEffect } from "react";
import ChatMessageDisplay from "main/components/Chat/ChatMessageDisplay";
import { useBackend } from "main/utils/useBackend";

// Props for storybook manual injection

const ChatDisplay = ({ commonsId }) => {
  const initialMessagePageSize = 10;
  const refreshRate = 2000;

  const [page, setPage] = useState(0);
  const [allMessages, setAllMessages] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const { data: messagesPage } = useBackend(
    [
      `/api/chat/get?page=${page}&size=${initialMessagePageSize}&commonsId=${commonsId}`,
    ],
    {
      method: "GET",
      url: `/api/chat/get`,
      params: {
        commonsId: commonsId,
        page: page,
        size: initialMessagePageSize,
      },
    },
    { content: [], last: true },
    { refetchInterval: refreshRate },
  );

  const { data: userCommonsList } = useBackend(
    [`/api/usercommons/commons/all`],
    {
      method: "GET",
      url: "/api/usercommons/commons/all",
      params: {
        commonsId: commonsId,
      },
    },
    [],
    { refetchInterval: refreshRate },
  );

  // Stryker restore all

  // when messagesPage updates, merge into allMessages
  useEffect(() => {
    if (messagesPage && Array.isArray(messagesPage.content)) {
      if (page === 0) {
        setAllMessages(messagesPage.content);
      } else {
        setAllMessages((prev) => [...prev, ...messagesPage.content]);
      }
      setHasMore(!messagesPage.last);
    }
  }, [messagesPage, page]);

  // const sortedMessages = allMessages.sort((a, b) => b.id - a.id);
  const sortedMessages = [...allMessages].sort((a, b) => b.id - a.id);

  const userIdToUsername = userCommonsList.reduce((acc, user) => {
    acc[user.userId] = user.username || "";
    return acc;
  }, {});

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column-reverse",
        overflowY: "scroll",
        maxHeight: "300px",
      }}
      data-testid="ChatDisplay"
    >
      {Array.isArray(sortedMessages) &&
        sortedMessages.map((message) => (
          <ChatMessageDisplay
            key={message.id}
            message={{
              ...message,
              username: userIdToUsername[message.userId],
            }}
          />
        ))}

      {hasMore && (
        <button
          onClick={() => setPage((p) => p + 1)}
          data-testid="ChatDisplay-More"
          style={{ marginTop: "8px" }}
        >
          More messages
        </button>
      )}
      {!hasMore && (
        <div
          data-testid="ChatDisplay-End"
          style={{ textAlign: "center", opacity: 0.7, marginTop: "4px" }}
        >
          No more messages
        </div>
      )}
    </div>
  );
};

export default ChatDisplay;
