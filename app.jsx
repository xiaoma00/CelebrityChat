import React, { useState, useEffect, useRef } from 'react';

// --- Configuration ---
const apiKey = import.meta.env.VITE_GOOGLE_API_KEY; 

// --- Icons (Inline SVGs to remove external dependencies) ---
const IconArrowLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7"/>
    <path d="M19 12H5"/>
  </svg>
);

const IconPlus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/>
    <path d="M12 5v14"/>
  </svg>
);

const IconSend = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 2-7 20-4-9-9-4Z"/>
    <path d="M22 2 11 13"/>
  </svg>
);

const IconX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18"/>
    <path d="m6 6 12 12"/>
  </svg>
);

const IconMessageSquare = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

// --- Constants ---
const INITIAL_CELEBRITIES = [
  {
    id: 'charlie-munger',
    name: 'Charlie Munger',
    role: 'Investor & Philanthropist',
    description: 'Vice Chairman of Berkshire Hathaway. Known for his "lollapalooza" effects, mental models, and blunt, rational wisdom.',
    systemPrompt: 'You are Charlie Munger. You are known for your wit, wisdom, and reliance on "mental models". You value rationality, inversion, and long-term thinking. You are often blunt and use phrases like "I have nothing to add" if you agree. You dislike "bitcoin rat poison" and foolish speculation. Give advice based on multi-disciplinary thinking.',
    color: 'bg-slate-700',
    initials: 'CM'
  },
  {
    id: 'warren-buffett',
    name: 'Warren Buffett',
    role: 'The Oracle of Omaha',
    description: 'Chairman and CEO of Berkshire Hathaway. Famous for value investing, patience, and a folksy, humble demeanor.',
    systemPrompt: 'You are Warren Buffett. You are folksy, humble, and incredibly wise about money and life. You speak in simple metaphors. You believe in "wide moats", long-term holding, and buying wonderful companies at fair prices. You love Cherry Coke and See\'s Candies. Avoid complex technical jargon; keep it simple and grounded.',
    color: 'bg-emerald-700',
    initials: 'WB'
  },
  {
    id: 'elon-musk',
    name: 'Elon Musk',
    role: 'Technoking of Tesla',
    description: 'CEO of SpaceX and Tesla. Visionary, focused on first principles, multi-planetary life, and engineering.',
    systemPrompt: 'You are Elon Musk. You think in "first principles". You are obsessed with Mars, electric vehicles, and AI safety. You can be erratic, meme-loving, but deeply technical and visionary. You want to make humanity multi-planetary. Speak with a mix of engineering depth and internet culture.',
    color: 'bg-neutral-900',
    initials: 'EM'
  },
  {
    id: 'benjamin-franklin',
    name: 'Benjamin Franklin',
    role: 'Founding Father',
    description: 'Polymath, writer, scientist, and diplomat. Known for his 13 virtues, wit, and practical wisdom.',
    systemPrompt: 'You are Benjamin Franklin. You speak with the eloquence of the 18th century but the sharp wit of a satirist. You value industry, frugality, and virtue. You are curious about everything. You often use proverbs and maxims. You are diplomatic but clever.',
    color: 'bg-amber-700',
    initials: 'BF'
  },
  {
    id: 'mahatma-gandhi',
    name: 'Mahatma Gandhi',
    role: 'Leader of Independence',
    description: 'Leader of the Indian independence movement. Champion of non-violence (Ahimsa) and truth.',
    systemPrompt: 'You are Mahatma Gandhi. You speak softly but with immense conviction. You advocate for "Ahimsa" (non-violence) and "Satyagraha" (truth-force). You are humble, spiritual, and philosophical. You believe in simple living and high thinking. Address the user with respect and kindness.',
    color: 'bg-orange-600',
    initials: 'MG'
  }
];

// --- Utilities ---

// Simple Markdown Renderer Component
const MarkdownRenderer = ({ content }) => {
  if (!content) return null;

  // 1. Split by code blocks (```)
  const parts = content.split(/```/);

  return (
    <div className="space-y-2 max-w-full overflow-hidden">
      {parts.map((part, index) => {
        // Even indices are text, Odd indices are code
        if (index % 2 === 1) {
          return (
            <div key={index} className="bg-black/80 text-gray-100 p-3 rounded-lg overflow-x-auto my-2 text-xs font-mono border border-gray-700">
              <pre><code>{part.trim()}</code></pre>
            </div>
          );
        }

        // Parse regular text for Bold (**text**), HTML tags, and Headers (##)
        // Pre-process <br> to newlines for the line splitter
        const textContent = part.replace(/<br\s*\/?>/gi, '\n');

        return (
           <div key={index} className="whitespace-pre-wrap break-words">
              {textContent.split('\n').map((line, lineIdx) => {
                 // Check for headers (e.g. ## Title)
                 // Supported: # to ######
                 const isHeader = line.trim().match(/^(#{1,6})\s+(.*)/);
                 if (isHeader) {
                   const level = isHeader[1].length;
                   const content = isHeader[2];
                   // Map levels to tailwind classes
                   const classes = {
                     1: "text-xl font-bold mt-4 mb-2 border-b pb-1 border-gray-200",
                     2: "text-lg font-bold mt-3 mb-2",
                     3: "text-base font-bold mt-2 mb-1"
                   };
                   // Fallback for levels 4-6
                   const className = classes[level] || "font-bold mt-2";
                   
                   return (
                     <div key={lineIdx} className={className}>
                       {parseInline(content)}
                     </div>
                   );
                 }

                 // Check for bullet points
                 const isBullet = line.trim().match(/^(\*|-)\s(.*)/);
                 if (isBullet) {
                   return (
                     <div key={lineIdx} className="flex ml-2">
                       <span className="mr-2">•</span>
                       <span>{parseInline(isBullet[2])}</span>
                     </div>
                   );
                 }
                 
                 // Regular line (with potential bolding/html)
                 if (line === '') return <div key={lineIdx} className="h-2" />;
                 
                 return <div key={lineIdx}>{parseInline(line)}</div>;
              })}
           </div>
        );
      })}
    </div>
  );
};

// Helper to parse inline styles like **bold** and simple HTML tags
const parseInline = (text) => {
  if (!text) return null;
  
  // Split by bold syntax (**) and HTML tags (<b>, <strong>, <i>, <em>)
  // This regex matches: 
  // 1. **text**
  // 2. <b>text</b> or <strong>text</strong>
  // 3. <i>text</i> or <em>text</em>
  const regex = /(\*\*.*?\*\*|<\s*(?:b|strong)\s*>.*?<\s*\/\s*(?:b|strong)\s*>|<\s*(?:i|em)\s*>.*?<\s*\/\s*(?:i|em)\s*>)/g;
  
  const parts = text.split(regex);
  
  return parts.map((part, i) => {
    // Markdown Bold
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
    }
    // HTML Bold
    if (/^<\s*(?:b|strong)\s*>/.test(part)) {
       // Strip tags
       const content = part.replace(/^<\s*(?:b|strong)\s*>/, '').replace(/<\s*\/\s*(?:b|strong)\s*>$/, '');
       return <strong key={i} className="font-bold">{content}</strong>;
    }
    // HTML Italic
    if (/^<\s*(?:i|em)\s*>/.test(part)) {
       // Strip tags
       const content = part.replace(/^<\s*(?:i|em)\s*>/, '').replace(/<\s*\/\s*(?:i|em)\s*>$/, '');
       return <em key={i} className="italic">{content}</em>;
    }
    
    return <span key={i}>{part}</span>;
  });
};


export default function App() {
  const [celebrities, setCelebrities] = useState(INITIAL_CELEBRITIES);
  const [selectedCelebrity, setSelectedCelebrity] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [error, setError] = useState(null);
  
  // New celebrity form state
  const [newCelebName, setNewCelebName] = useState('');
  const [newCelebDesc, setNewCelebDesc] = useState('');

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSelectCelebrity = (celeb) => {
    setSelectedCelebrity(celeb);
    setMessages([{
      role: 'system',
      content: `You are now speaking with ${celeb.name}.`
    }]);
    setError(null);
  };

  const handleBack = () => {
    setSelectedCelebrity(null);
    setMessages([]);
    setInputText('');
    setError(null);
  };

  const handleAddCelebrity = (e) => {
    e.preventDefault();
    if (!newCelebName.trim()) return;

    const safeInitials = newCelebName
      .split(' ')
      .map(n => n[0] || '')
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const newCeleb = {
      id: Date.now().toString(),
      name: newCelebName,
      role: 'Custom Personality',
      description: newCelebDesc || 'A custom added personality.',
      systemPrompt: `You are ${newCelebName}. ${newCelebDesc}. Stay in character perfectly.`,
      color: 'bg-indigo-600',
      initials: safeInitials || '?'
    };

    setCelebrities([...celebrities, newCeleb]);
    setNewCelebName('');
    setNewCelebDesc('');
    setIsAddModalOpen(false);
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMsg = inputText;
    setInputText('');
    
    // Add user message to UI immediately
    const newMessages = [
      ...messages,
      { role: 'user', content: userMsg }
    ];
    setMessages(newMessages);
    setIsLoading(true);
    setError(null);

    try {
      // Filter out system UI messages for the API context
      const historyForApi = newMessages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        }));

      // Construct the API call
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: historyForApi,
          systemInstruction: {
            parts: [{ text: selectedCelebrity.systemPrompt }]
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (replyText) {
        setMessages(prev => [...prev, { role: 'model', content: replyText }]);
      } else {
        throw new Error('No response generated');
      }

    } catch (err) {
      console.error(err);
      setError("Failed to get a response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render Views ---

  if (selectedCelebrity) {
    return (
      <div className="flex flex-col h-screen bg-gray-50 text-gray-900 font-sans">
        {/* Chat Header */}
        <header className="bg-white border-b px-4 py-3 flex items-center shadow-sm sticky top-0 z-10">
          <button 
            onClick={handleBack}
            className="p-2 mr-3 hover:bg-gray-100 rounded-full transition-colors"
          >
            <div className="w-5 h-5 text-gray-600">
               <IconArrowLeft />
            </div>
          </button>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-3 ${selectedCelebrity.color}`}>
            {selectedCelebrity.initials}
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">{selectedCelebrity.name}</h1>
            <p className="text-xs text-gray-500">{selectedCelebrity.role}</p>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((msg, idx) => {
            if (msg.role === 'system') {
              return (
                <div key={idx} className="flex justify-center my-4">
                  <span className="text-xs text-gray-400 font-medium px-3 py-1 bg-gray-100 rounded-full">
                    {msg.content}
                  </span>
                </div>
              );
            }
            const isUser = msg.role === 'user';
            return (
              <div 
                key={idx} 
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs mr-2 mt-1 ${selectedCelebrity.color}`}>
                    {selectedCelebrity.initials}
                  </div>
                )}
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  isUser 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                }`}>
                  <MarkdownRenderer content={msg.content} />
                </div>
              </div>
            );
          })}
          {isLoading && (
            <div className="flex justify-start">
               <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs mr-2 ${selectedCelebrity.color}`}>
                  {selectedCelebrity.initials}
                </div>
                <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                  <span className="ml-2 text-xs text-gray-400">Thinking...</span>
                </div>
            </div>
          )}
          {error && (
            <div className="flex justify-center">
              <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm border border-red-100">
                {error}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t p-4">
          <div className="flex items-end bg-gray-100 rounded-2xl border border-transparent focus-within:border-blue-300 focus-within:bg-white transition-all">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={`Message ${selectedCelebrity.name}...`}
              className="flex-1 bg-transparent border-none focus:ring-0 p-3 max-h-32 min-h-[50px] resize-none text-sm text-gray-800 placeholder-gray-400"
              rows="1"
            />
            <button 
              onClick={sendMessage}
              disabled={isLoading || !inputText.trim()}
              className="p-3 mr-1 mb-1 text-blue-600 disabled:text-gray-300 disabled:cursor-not-allowed hover:bg-gray-50 rounded-full transition-colors"
            >
              <div className="w-5 h-5">
                <IconSend />
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Home / Selection View ---
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white border-b px-6 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Timeless Conversations</h1>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm hover:shadow-md"
          >
            <div className="w-4 h-4">
                <IconPlus />
            </div>
            <span>Add Person</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        <div className="mb-8 text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-gray-900">Choose a Personality</h2>
          <p className="text-gray-500">Select a historical figure or modern visionary to start a conversation.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {celebrities.map((celeb) => (
            <button
              key={celeb.id}
              onClick={() => handleSelectCelebrity(celeb)}
              className="group relative flex flex-col items-center bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all duration-300 text-left"
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4 shadow-md ${celeb.color} group-hover:scale-110 transition-transform duration-300`}>
                {celeb.initials}
              </div>
              <h3 className="text-lg font-bold text-gray-900">{celeb.name}</h3>
              <p className="text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">{celeb.role}</p>
              <p className="text-sm text-gray-500 text-center line-clamp-2">{celeb.description}</p>
              
              <div className="mt-4 flex items-center gap-2 text-sm font-medium text-gray-400 group-hover:text-blue-600 transition-colors">
                <div className="w-4 h-4">
                    <IconMessageSquare />
                </div>
                <span>Start Chat</span>
              </div>
            </button>
          ))}
          
          {/* Add New Placeholer Card */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 text-gray-400 hover:text-blue-600 min-h-[240px]"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <div className="w-6 h-6">
                  <IconPlus />
              </div>
            </div>
            <span className="font-medium">Create New</span>
          </button>
        </div>
      </main>

      {/* Add Celebrity Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800">Add a New Personality</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors"
              >
                <div className="w-5 h-5">
                    <IconX />
                </div>
              </button>
            </div>
            
            <form onSubmit={handleAddCelebrity} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Steve Jobs"
                  value={newCelebName}
                  onChange={(e) => setNewCelebName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Short Bio / Prompt Instructions</label>
                <textarea
                  required
                  placeholder="Describe who they are and how they should speak..."
                  value={newCelebDesc}
                  onChange={(e) => setNewCelebDesc(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all min-h-[100px]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  The more detail you provide about their personality, the better the AI will imitate them.
                </p>
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-blue-200"
                >
                  Create Personality
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
