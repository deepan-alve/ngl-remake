import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { MessageCard } from './components/MessageCard';
import { Footer } from './components/Footer';
import { SuccessPage } from './components/SuccessPage';
import { messageStore } from './store/messageStore';
import dpImage from './dp.jpg';

const randomMessages = [
  "How's your day going?",
  "What's your biggest dream?",
  "Tell me a secret!",
  "What makes you happy?",
  "What's your favorite memory?",
  "If you could travel anywhere, where would you go?",
  "What's your biggest achievement?",
  "What's your favorite food?",
];

const USERNAME = "@deepan.alve";

function App() {
  const [message, setMessage] = useState('');
  const [tapCount, setTapCount] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Initial count
    setTapCount(Math.floor(Math.random() * (300 - 200 + 1) + 200));

    // Update count randomly every 2-5 seconds
    const interval = setInterval(() => {
      const shouldUpdate = Math.random() > 0.3; // 70% chance to update
      if (shouldUpdate) {
        setTapCount(Math.floor(Math.random() * (300 - 200 + 1) + 200));
      }
    }, Math.floor(Math.random() * (5000 - 2000 + 1) + 2000));

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Send a request to the external link when the component mounts
    fetch('https://deepanalve.pythonanywhere.com/run-script')
      .then(response => response.text())
      .then(data => console.log('Script triggered:', data))
      .catch(error => console.error('Error triggering script:', error));
  }, []);

  const getRandomMessage = () => {
    const randomIndex = Math.floor(Math.random() * randomMessages.length);
    setMessage(randomMessages[randomIndex]);
  };

  const handleSend = () => {
    if (!message.trim() || isSending) return;

    setIsSending(true);
    try {
      messageStore.addMessage(message.trim());
      setMessage('');
      setShowSuccess(true);
    } finally {
      setIsSending(false);
    }
  };

  const handleGetMessages = () => {
    window.location.href = 'https://apps.apple.com/us/app/ngl-ask-me-anything/id1596550932?ppid=543cb167-5bdc-448f-a202-e5506f5d2837';
  };

  const handleBack = () => {
    setShowSuccess(false);
  };

  if (showSuccess) {
    return (
      <SuccessPage 
        tapCount={tapCount}
        onBack={handleBack}
        onGetMessages={handleGetMessages}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FF2A6D] via-[#FF4B2B] to-[#FF8751] p-4 flex flex-col items-center pb-48">
      <div className="w-full max-w-[640px] mx-auto pt-8">
        <MessageCard
          message={message}
          onMessageChange={setMessage}
          onRandomMessage={getRandomMessage}
          imageUrl={dpImage}
        />

        <button 
          onClick={handleSend}
          disabled={!message.trim() || isSending}
          className={`w-full mt-3 bg-black text-white py-3 rounded-full font-medium text-[15px] hover:bg-black/90 transition-all flex items-center justify-center ${
            !message.trim() ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          {isSending ? 'Sending...' : 'Send!'}
        </button>

        <div className="mt-3 text-center">
          <p className="text-white/90 text-sm flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" />
            anonymous q&a
          </p>
        </div>
      </div>

      <Footer tapCount={tapCount} />
    </div>
  );
}

export default App;
