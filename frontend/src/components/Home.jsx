import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

function Home() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let ws = new WebSocket("ws://localhost:8000/api/chat");
    ws.onopen = () => {
      console.log("connected");
    };
    ws.onmessage = (e) => {
      console.log(e.data);
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

        {/* Main content of your page */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto container mx-auto">
          <h1>Hello World</h1>
        </div>
      </div>
    </div>
  );
}

export default Home;
