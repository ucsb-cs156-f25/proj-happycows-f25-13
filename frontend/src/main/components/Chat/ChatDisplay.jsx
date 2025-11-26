import React, { useState, useEffect, useRef } from "react";
import ChatMessageDisplay from "main/components/Chat/ChatMessageDisplay";
import { useBackend } from "main/utils/useBackend";

const ChatDisplay = ({ commonsId }) => {
  const [size, setSize] = useState(10);

  const scrollContainerRef = useRef(null);
  // store scroll info when we click "More messages"
  const preserveScrollRef = useRef(null);

  const { data: messagesPage } = useBackend(
    ["/api/chat/get", commonsId, size],
    {
      method: "GET",
      url: "/api/chat/get",
      params: {
        commonsId,
        page: 0,
        size,
      },
    },
    { content: [], last: true },
    { refetchInterval: 2000 },
  );

  const { data: userCommonsList } = useBackend(
    ["/api/usercommons/commons/all", commonsId],
    {
      method: "GET",
      url: "/api/usercommons/commons/all",
      params: { commonsId },
    },
    [],
  );

  const userIdToUsername = userCommonsList.reduce((acc, user) => {
    acc[user.userId] = user.username || "";
    return acc;
  }, {});

  // oldest at top, newest at bottom
  const sortedMessages = [...(messagesPage.content || [])].sort(
    (a, b) => a.id - b.id,
  );

  const latestMessageId =
    sortedMessages.length > 0
      ? sortedMessages[sortedMessages.length - 1].id
      : null;

  // Auto-scroll to bottom on new message, preserve position when loading older ones
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    if (sortedMessages.length === 0) return;

    // If "More messages" was clicked, restore where user was
    if (preserveScrollRef.current !== null) {
      const { prevScrollTop, prevScrollHeight } = preserveScrollRef.current;
      const newScrollHeight = container.scrollHeight;
      const heightDiff = newScrollHeight - prevScrollHeight;

      container.scrollTop = prevScrollTop + heightDiff;
      preserveScrollRef.current = null;
      return;
    }

    // Normal auto-scroll to bottom when a new latest message arrives
    container.scrollTop = container.scrollHeight;
  }, [latestMessageId, sortedMessages.length]);

  const handleMoreMessages = () => {
    const container = scrollContainerRef.current;

    if (container) {
      preserveScrollRef.current = {
        prevScrollTop: container.scrollTop,
        prevScrollHeight: container.scrollHeight,
      };
    }

    setSize((old) => old + 10);
  };

  return (
    <div
      ref={scrollContainerRef}
      data-testid="ChatDisplay"
      style={{
        overflowY: "scroll",
        maxHeight: "300px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {!messagesPage.last ? (
        <button data-testid="MoreMessagesButton" onClick={handleMoreMessages}>
          More messages
        </button>
      ) : (
        <div data-testid="NoMoreMessages">[no more messages]</div>
      )}

      {sortedMessages.map((message) => (
        <ChatMessageDisplay
          key={message.id}
          message={{
            ...message,
            username: userIdToUsername[message.userId],
          }}
        />
      ))}
    </div>
  );
};

export default ChatDisplay;
