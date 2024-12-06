import { useQuery } from "@tanstack/react-query";
import NewPrompt from "../../components/newPrompt/NewPrompt";
import { useLocation } from "react-router-dom";
import "./chatPage.css";
import { DNA } from "react-loader-spinner";

const ChatPage = () => {
  const path = useLocation().pathname;
  const chatId = path.split("/").pop();
  const { isPending, error, data } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_API_URL}/api/chat/${chatId}`, {
        credentials: "include",
      }).then((res) => res.json()),
  });
  return (
    <div className="chatPage">
      <div className="wrapper">
        <div className="chat">
          {isPending ? (
            <DNA
              visible={true}
              height="40"
              width="40"
              ariaLabel="dna-loading"
              wrapperStyle={{}}
              wrapperClass="dna-wrapper"
            />
          ) : error ? (
            "Something went wrong!"
          ) : (
            data?.history?.map((message, index) => (
              <div
                key={index}
                className={message.role === "user" ? "message user" : "message"}
              >
                {message.parts[0].text}
              </div>
            ))
          )}

          {data && <NewPrompt data={data} />}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
