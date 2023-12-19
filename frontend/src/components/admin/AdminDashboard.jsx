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
        className={`flex-1 flex flex-col overflow-hidden transition-all ease-in-out overflow-y-auto ${isSidebarOpen ? "md:ml-64" : "ml-0"
          }`}
      >
        <Navbar />
        <div className="h-[95vh] container mx-auto">

          <h1 className="text-3xl font-semibold text-start text-slate-900 dark:text-slate-50">
            Admin Dashboard
          </h1>

        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
