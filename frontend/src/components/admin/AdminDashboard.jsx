import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useState } from "react";
function AdminDashboard() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);


  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-200 dark:bg-[#151626] ">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setSidebarOpen(!isSidebarOpen)}
      />

      {/* Content */}
      <div
        className={`flex-1 flex flex-col items-center justify-center overflow-hidden transition-all ease-in-out overflow-y-auto ${
          isSidebarOpen ? "md:ml-64" : "ml-0"
        }`}
      >
        <Navbar />
        <div className="container mx-auto lg:w-3/5 w-full h-[95vh]">
          
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
