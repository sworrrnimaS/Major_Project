import { useQuery } from "@tanstack/react-query";
import NewPrompt from "../../components/newPrompt/NewPrompt";
import { useLocation } from "react-router-dom";
import "./chatPage.css";
import { DNA } from "react-loader-spinner";
import { useEffect, useRef } from "react";
// import { MarkdownConverter } from "../../utils/textToMarkdown";
import { convertToMarkdown } from "../../utils/textToMarkdown";

// Yo page le chai specific chat history dekhaucha, which is identified by the session id in backend, basically purano session id hisab le purano chats haru herna lai chai yo ho, yaha GET garne ho session id hisab le old conversation

const ChatPage = () => {
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
    queryFn: () =>
      fetch(`http://localhost:3000/chat/getAllChats/${sessionId}`).then(
        (res) => {
          if (!res.ok) {
            throw new Error(`Error: ${res.status}`);
          }
          return res.json();
        }
      ),
    staleTime: 5000,
    refetchOnWindowFocus: false, // Add this line to disable refetch on focus
  });
  console.log(data);

  useEffect(() => {
    if (data) {
      scrollToBottom();
    }
  }, [data]);

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
                height="60"
                width="60"
                ariaLabel="dna-loading"
                wrapperStyle={{}}
                wrapperClass="dna-wrapper"
              />
            </div>
          ) : error ? (
            "Something went wrong!"
          ) : (
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
        {data && <NewPrompt data={data} sessionId={sessionId} />}
      </div>
    </div>
  );
};

export default ChatPage;
