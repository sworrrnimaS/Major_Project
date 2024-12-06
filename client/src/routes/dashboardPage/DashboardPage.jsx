import { MoveUp } from "lucide-react";
import "./dashboardPage.css";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
const DashboardPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async (text) => {
      return await fetch(`${import.meta.env.VITE_API_URL}/api/chats`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      }).then((res) => res.json());
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["userChats"] });
      navigate(`/dashboard/chats/${id}`);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = e.target.text.value;
    if (!text) return;
    mutation.mutate(text);
  };
  return (
    <div className="dashboardPage">
      <div className="texts">
        <div className="logo">
          <img src="/logo.png" alt="" />
        </div>
        <div className="options">
          <div className="option">
            <span>Compare between different banks</span>
          </div>
          <div className="option">
            <span>Suggest me a savings account</span>
          </div>
          <div className="option">
            <span>Location of NMB</span>
          </div>
        </div>
      </div>
      <div className="formContainer">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Ask me anything about commercial banks in Nepal"
            name="text"
          />
          <button>
            {/* <img src="/arrow.png" alt="" /> */}
            <MoveUp className="upIcon" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default DashboardPage;
