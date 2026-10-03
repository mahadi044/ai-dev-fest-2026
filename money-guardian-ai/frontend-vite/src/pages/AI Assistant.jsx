import { useState } from "react";
import api from "../services/api";

function AIAssistant() {
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hello Mahadi! I'm your Money Guardian AI Assistant. Ask me anything about your spending, savings, transactions, or financial health.",
    },
  ]);

  const [loading, setLoading] = useState(false);

  const sendMessage = async (question = message) => {
    const trimmedMessage = question.trim();

    if (!trimmedMessage || loading) {
      return;
    }

    const userMessage = {
      role: "user",
      text: trimmedMessage,
    };

    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await api.post("/assistant/", {
        question: trimmedMessage,
      });

      const aiMessage = {
        role: "ai",
        text:
          response.data?.answer ||
          "I could not generate a response.",
      };

      setMessages((currentMessages) => [
        ...currentMessages,
        aiMessage,
      ]);
    } catch (error) {
      console.error("AI Assistant error:", error);

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "ai",
          text:
            "Sorry, I couldn't connect to Money Guardian's backend. Please make sure the backend server is running.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  const askQuickQuestion = (question) => {
    sendMessage(question);
  };

  return (
    <div className="ai-assistant-page">
      <div className="ai-assistant-header">
        <div>
          <span className="protected-badge">
            AI POWERED
          </span>

          <h1>AI Assistant</h1>

          <p>
            Your personal financial assistant powered by
            Money Guardian.
          </p>
        </div>
      </div>

      <div className="ai-assistant-layout">
        <div className="ai-chat-panel">
          <div className="ai-chat-header">
            <div className="ai-chat-avatar">
              ✦
            </div>

            <div>
              <h2>Money Guardian AI</h2>
              <span>Financial Assistant</span>
            </div>

            <div className="ai-online">
              <span></span>
              Online
            </div>
          </div>

          <div className="ai-chat-messages">
            {messages.map((item, index) => (
              <div
                key={index}
                className={`ai-message-row ${
                  item.role === "user"
                    ? "user-message-row"
                    : "assistant-message-row"
                }`}
              >
                {item.role === "ai" && (
                  <div className="ai-message-avatar">
                    AI
                  </div>
                )}

                <div
                  className={`ai-message ${
                    item.role === "user"
                      ? "user-message"
                      : "assistant-message"
                  }`}
                >
                  {item.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="ai-message-row assistant-message-row">
                <div className="ai-message-avatar">
                  AI
                </div>

                <div className="ai-message assistant-message">
                  Analyzing your financial data...
                </div>
              </div>
            )}
          </div>

          <div className="ai-chat-input-area">
            <input
              type="text"
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="Ask about your money..."
              disabled={loading}
            />

            <button
              className="ai-send-button"
              onClick={() => sendMessage()}
              disabled={loading}
            >
              →
            </button>
          </div>
        </div>

        <div className="ai-quick-panel">
          <h2>Ask Money Guardian</h2>

          <p>
            Try one of these questions:
          </p>

          <button
            onClick={() =>
              askQuickQuestion(
                "How much did I spend?"
              )
            }
            disabled={loading}
          >
            How much did I spend?
          </button>

          <button
            onClick={() =>
              askQuickQuestion(
                "How can I save more money?"
              )
            }
            disabled={loading}
          >
            How can I save more money?
          </button>

          <button
            onClick={() =>
              askQuickQuestion(
                "Where am I spending the most?"
              )
            }
            disabled={loading}
          >
            Where am I spending the most?
          </button>

          <button
            onClick={() =>
              askQuickQuestion(
                "Are my transactions safe?"
              )
            }
            disabled={loading}
          >
            Are my transactions safe?
          </button>

          <button
            onClick={() =>
              askQuickQuestion(
                "How is my financial health?"
              )
            }
            disabled={loading}
          >
            How is my financial health?
          </button>
        </div>
      </div>
    </div>
  );
}

export default AIAssistant;