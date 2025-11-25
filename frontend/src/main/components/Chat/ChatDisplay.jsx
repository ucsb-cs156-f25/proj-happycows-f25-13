import React, { useState, useEffect, useRef } from "react";
import ChatMessageDisplay from "main/components/Chat/ChatMessageDisplay";
import { useBackend } from "main/utils/useBackend";

const ChatDisplay = ({ commonsId }) => {
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(0);
  // Stryker disable next-line all
  const [isLastPage, setIsLastPage] = useState(false);

  const processedMessageIds = useRef(new Set());

  // Stryker disable all
  const { data: messagesPage } = useBackend(
    ["/api/chat/get", commonsId, page],
    {
      method: "GET",
      url: "/api/chat/get",
      params: { commonsId, page, size: 10 },
    },
    { content: [], last: true }
  );

  const { data: userCommonsList } = useBackend(
    ["/api/usercommons/all", commonsId],
    {
      method: "GET",
      url: "/api/usercommons/all",
      params: { commonsId },
    },
    []
  );

  useEffect(() => {
    setPage(0);
    setMessages([]);
    processedMessageIds.current = new Set();
    setIsLastPage(false);
  }, [commonsId]);

  useEffect(() => {

    const newMessages = messagesPage.content.filter((msg) => {
      const isNew = !processedMessageIds.current.has(msg.id);
      processedMessageIds.current.add(msg.id);
      return isNew;
    });

    setMessages((old) => [...old, ...newMessages]);

    setIsLastPage(messagesPage.last);
  }, [messagesPage]);

  // Stryker restore all
  const userIdToUsername = userCommonsList.reduce((acc, user) => {
    acc[user.userId] = user.username || "";
    return acc;
  }, {});

  const sortedMessages = [...messages].sort((a, b) => b.id - a.id);

  return (
    <div
      data-testid="ChatDisplay"
      style={{
        display: "flex",
        flexDirection: "column-reverse",
        overflowY: "scroll",
        maxHeight: "300px",
      }}
    >
      {sortedMessages.map((m) => (
        <ChatMessageDisplay
          key={m.id}
          message={{
            ...m,
            username: userIdToUsername[m.userId],
          }}
        />
      ))}

      {!isLastPage ? (
        <button
          data-testid="MoreMessagesButton"
          onClick={() => setPage((p) => p + 1)}
        >
          More messages
        </button>
      ) : (
        <div data-testid="NoMoreMessages">[no more messages]</div>
      )}
    </div>
  );
};

export default ChatDisplay;
