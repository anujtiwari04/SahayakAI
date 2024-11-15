import React, { useState } from 'react';

const QUESTION_LIMIT = 20;
const COOLDOWN_HOURS = 2;

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setIsLoading(true);
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

    const requestBody = {
      contents: [{
        parts: [{ text: userMessage }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    };

    try {
      console.log('Making API request with body:', requestBody);
      
      const response = await fetch(`${apiUrl}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }); 

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      
      const botResponse = data.candidates[0].content.parts[0].text;
      setMessages(prev => [...prev, { type: 'bot', content: botResponse }]);
    } catch (error) {
      console.error('Detailed Error:', error);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: `Sorry, I encountered an error: ${error.message}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen w-full bg-gradient-to-r from-slate-900 to slate-700">
      <div className="w-full max-w-3xl h-[90vh] flex flex-col bg-gradient-to-r from-blue-800 to indigo-900 rounded-lg shadow-lg">
        <h1 className="text-center text-gray-800 p-4 bg-gradient-to-r from-blue-800 to indigo-900 border-b border-gray-300 text-3xl font-bold">
          SAHAYAK.AI
        </h1>

        <div className="flex-grow overflow-y-auto p-5 space-y-4">
          {messages.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-center text-black-200 text-2xl font-semibold">
                How can your Sahayak help you?
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`max-w-[70%] p-3 rounded-lg break-words ${
                  message.type === 'user' ? 'bg-blue-500 text-white ml-auto' : 'bg-white text-gray-800'
                }`}
              >
                {message.content}
              </div>
            ))
          )}
          {isLoading && (
            <div className="bg-gray-200 text-gray-600 p-3 rounded-lg max-w-[70%]">
              Thinking...
            </div>
          )}
        </div>

        <div className="text-center my-3 text-sm text-gray-600">
          Questions remaining today: {QUESTION_LIMIT - messages.length}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t border-gray-200">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={QUESTION_LIMIT - messages.length > 0 
              ? "Ask a question..." 
              : `Too many questions. Please wait ${COOLDOWN_HOURS} hours.`}
            disabled={QUESTION_LIMIT - messages.length <= 0 || isLoading}
            className={`flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
              ${QUESTION_LIMIT - messages.length <= 0 ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'}
              ${isLoading ? 'cursor-wait' : ''}`}
          />
          <button 
            type="submit" 
            disabled={QUESTION_LIMIT - messages.length <= 0 || isLoading}
            className={`px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold
              hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500
              transition-colors duration-200`}
          >
            Send
          </button>
        </form>

        {QUESTION_LIMIT - messages.length <= 0 && (
          <div className="text-center p-4 text-sm text-red-600 bg-red-50 rounded-lg mx-4 mb-4">
            You've reached the maximum number of questions. 
            Please try again in {COOLDOWN_HOURS} hours.
          </div>
        )}
      </div>
    </div>
  );
}

export default App;