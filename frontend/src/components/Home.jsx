import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Inputfeild from './Inputfeild';

function Home() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let ws = new WebSocket("ws://localhost:8000/api/chat");
    ws.onopen = () => ws.send("hello");
    ws.onmessage = (data) => {
      console.log('Received message from server:', data);
    };
    ws.onclose = () => {
      console.log("disconnected");
    };

    // Clean up WebSocket connection when component unmounts
    return () => {
      ws.close();
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />

      {/* Content */}
      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all ease-in-out ${isSidebarOpen ? 'md:ml-64' : 'ml-0'}`}
      >
        <Navbar />
        <div className="flex-1 overflow-y-auto bg-slate-200 dark:bg-slate-800">
        <Inputfeild />   
        </div>       
        
      </div>
    </div>
  );
}

export default Home;
