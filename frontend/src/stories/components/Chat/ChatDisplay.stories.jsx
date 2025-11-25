import React from "react";
import { http, HttpResponse } from "msw";

import ChatDisplay from "main/components/Chat/ChatDisplay";
import { chatMessageFixtures } from "fixtures/chatMessageFixtures";
import userCommonsFixtures from "fixtures/userCommonsFixtures";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";

export default {
  title: "components/Chat/ChatDisplay",
  component: ChatDisplay,
};

const Template = (args) => <ChatDisplay {...args} />;

export const Empty = Template.bind({});
Empty.args = { commonsId: 101 };

Empty.parameters = {
  msw: {
    handlers: [
      http.get("/api/currentUser", () =>
        HttpResponse.json(apiCurrentUserFixtures.adminUser),
      ),

      http.get("/api/chat/get", ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get("commonsId") === "101") {
          return HttpResponse.json({ content: [], last: true });
        }
        return HttpResponse.json({ content: [], last: true });
      }),

      http.get("/api/usercommons/commons/all", ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get("commonsId") === "101") {
          return HttpResponse.json([], { status: 200 });
        }
        return HttpResponse.json([], { status: 200 });
      }),
    ],
  },
};

export const OneMessage = Template.bind({});
OneMessage.args = { commonsId: 102 };

OneMessage.parameters = {
  msw: {
    handlers: [
      http.get("/api/currentUser", () =>
        HttpResponse.json(apiCurrentUserFixtures.adminUser),
      ),

      http.get("/api/chat/get", ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get("commonsId") === "102") {
          return HttpResponse.json(
            { content: chatMessageFixtures.oneChatMessage, last: true },
            { status: 200 },
          );
        }
        return HttpResponse.json({ content: [], last: true });
      }),

      http.get("/api/usercommons/commons/all", ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get("commonsId") === "102") {
          return HttpResponse.json(userCommonsFixtures.oneUserCommons, {
            status: 200,
          });
        }
        return HttpResponse.json([], { status: 200 });
      }),
    ],
  },
};

export const ThreeMessages = Template.bind({});
ThreeMessages.args = { commonsId: 103 };

ThreeMessages.parameters = {
  msw: {
    handlers: [
      http.get("/api/currentUser", () =>
        HttpResponse.json(apiCurrentUserFixtures.adminUser),
      ),

      http.get("/api/chat/get", ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get("commonsId") === "103") {
          return HttpResponse.json(
            { content: chatMessageFixtures.threeChatMessages, last: true },
            { status: 200 },
          );
        }
        return HttpResponse.json({ content: [], last: true });
      }),

      http.get("/api/usercommons/commons/all", ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get("commonsId") === "103") {
          return HttpResponse.json(userCommonsFixtures.threeUserCommons, {
            status: 200,
          });
        }
        return HttpResponse.json([], { status: 200 });
      }),
    ],
  },
};

export const TwelveMessages = Template.bind({});
TwelveMessages.args = { commonsId: 104 };

TwelveMessages.parameters = {
  msw: {
    handlers: [
      http.get("/api/currentUser", () =>
        HttpResponse.json(apiCurrentUserFixtures.adminUser),
      ),

      http.get("/api/chat/get", ({ request }) => {
        const url = new URL(request.url);
        const page = Number(url.searchParams.get("page"));
        const commonsId = url.searchParams.get("commonsId");

        if (commonsId === "104" && page === 0) {
          return HttpResponse.json(
            {
              content: chatMessageFixtures.twelveChatMessages.slice(-10),
              last: false,
            },
            { status: 200 },
          );
        }

        if (commonsId === "104" && page === 1) {
          return HttpResponse.json(
            {
              content: chatMessageFixtures.twelveChatMessages.slice(0, -10),
              last: true,
            },
            { status: 200 },
          );
        }

        return HttpResponse.json({ content: [], last: true });
      }),

      http.get("/api/usercommons/commons/all", ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get("commonsId") === "104") {
          return HttpResponse.json(userCommonsFixtures.tenUserCommons, {
            status: 200,
          });
        }
        return HttpResponse.json([], { status: 200 });
      }),
    ],
  },
};
