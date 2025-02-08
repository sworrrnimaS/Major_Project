import { useQuery } from "@tanstack/react-query";
import NewPrompt from "../../components/newPrompt/NewPrompt";
import { useLocation } from "react-router-dom";
import "./chatPage.css";
import { DNA } from "react-loader-spinner";
import { useEffect, useRef } from "react";
// import { MarkdownConverter } from "../../utils/textToMarkdown";
import { convertToMarkdown } from "../../utils/textToMarkdown";
import { useAuth } from "@clerk/clerk-react";

// Yo page le chai specific chat history dekhaucha, which is identified by the session id in backend, basically purano session id hisab le purano chats haru herna lai chai yo ho, yaha GET garne ho session id hisab le old conversation

const ChatPage = () => {
  const { getToken } = useAuth();
  const path = useLocation().pathname;
  const sessionId = path.split("/").pop();

  const messageRef = useRef(null);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      messageRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    });
  };

  const { isLoading, error, data } = useQuery({
    queryKey: ["chats", sessionId],
    queryFn: async () => {
      const token = await getToken(); // Wait for the token

      const res = await fetch(
        `http://localhost:3000/chat/getAllChats/${sessionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }

      // console.log(res.json().then((data) => console.log(data)));
      return res.json();
    },
    staleTime: 5000,
    refetchOnWindowFocus: false, // Disable refetch on window focus
  });

  useEffect(() => {
    if (data) {
      scrollToBottom();
    }
  }, [data]);

  // console.log(data);

  return (
    <div className="chatPage">
      <div className="wrapper">
        <div className="chat">
          {isLoading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignContent: "center",
              }}
            >
              <DNA
                visible={true}
                height="100"
                width="100"
                ariaLabel="dna-loading"
                wrapperStyle={{}}
                wrapperClass="dna-wrapper"
              />
            </div>
          ) : error ? (
            "Something went wrong in ChatPage.jsx!"
          ) : (
            typeof data !== "string" &&
            data.length !== 0 &&
            data?.map((message, index) => (
              <div key={index}>
                <div className="message user">{message?.query}</div>
                {message?.error ? (
                  <div className="message error">Error processing request</div>
                ) : message?.isPending ? (
                  <div className="message loading">
                    <DNA visible={true} height="30" width="30" />
                  </div>
                ) : (
                  <div className="message response">
                    {convertToMarkdown(message?.response)}
                    {/* {message?.response} */}
                    {/* {MarkdownConverter(message?.response)} */}
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messageRef} />
        </div>
        {<NewPrompt data={data} sessionId={sessionId} />}
      </div>
    </div>
  );
};

export default ChatPage;
