import React, { useState } from 'react';

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
        <form onSubmit={handleSubmit} className="flex p-4 bg-gradient-to-r from-blue-800 to indigo-900 border-t border-gray-300 rounded-b-lg">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-grow p-2 border border-gray-300 rounded-lg mr-3 focus:outline-none focus:ring focus:ring-blue-200"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;