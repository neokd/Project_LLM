import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useState } from "react";
function AdminDashboard() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const feedbackData = [
    "Great app! Very user-friendly.",
    "The support team is responsive and helpful.",
    "Some features are confusing. Can you provide more guidance?",
    "Love the new update!",
    "The app is a bit slow on my device.",
  ];

  const keyInsightsData = [
    "How to reset password?",
    "What are the system requirements?",
    "Is there a mobile app available?",
    "Can I customize my dashboard?",
    "How to export data?",
  ];

  // Function to get random items from an array
  const getRandomItems = (array, count) => {
    const shuffled = array.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const randomFeedback = getRandomItems(feedbackData, 5);
  const randomKeyInsights = getRandomItems(keyInsightsData, 5);

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
        <div className="container mx-auto lg:w-3/5 w-full">
          <div className="flex h-[94vh] w-full flex-col">
            <div className="flex flex-col md:flex-row h-screen bg-slate-200 dark:bg-[#151626] ">
              <div className="">
                <h2 className="text-3xl font-bold mb-4 p-4 text-white">User Overview</h2>
                <div className="flex space-x-4">
                  {/* Box-1 */}
                  <div className="flex-grow max-w-md bg-slate-50 p-8 pl-4 rounded-3xl text-slate-900 ring-1 ring-slate-300 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-300/20">
                    <div className="flex flex-col items-center">
                      <svg
                        xmlns="https://icons8.com/icon/124230/user"
                        className="h-8 w-8 flex-none text-blue-600"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path
                          stroke="none"
                          d="M0 0h24v24H0z"
                          fill="none"
                        ></path>
                        <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path>
                        <path d="M9 12l2 2l4 -4"></path>
                      </svg>

                      <h3
                        style={{ fontSize: "2.0rem" }}
                        className="font-semibold leading-8 mt-4"
                      >
                        Number Of Users
                      </h3>

                      <p className="mt-2 flex items-baseline gap-x-1">
                        <span className="text-5xl font-bold tracking-tight">
                          99
                        </span>
                      </p>
                    </div>
                  </div>
                  {/* box-2 */}
                  <div className="flex-grow max-w-md bg-slate-50 p-8 pl-4 rounded-3xl text-slate-900 ring-1 ring-slate-300 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-300/20">
                    <div className="flex flex-col items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 flex-none text-blue-600"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path
                          stroke="none"
                          d="M0 0h24v24H0z"
                          fill="none"
                        ></path>
                        <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path>
                        <path d="M9 12l2 2l4 -4"></path>
                      </svg>

                      <h3
                        style={{ fontSize: "2.0rem" }}
                        className="font-semibold leading-8 mt-4"
                      >
                        User Ratings
                      </h3>

                      <p className="mt-2 flex items-baseline gap-x-1">
                        <span className="text-5xl font-bold tracking-tight">
                          4.5
                        </span>
                      </p>
                    </div>
                  </div>
                  {/* box-3 */}
                  <div className="flex-grow max-w-md bg-slate-50 p-8 pl-4 rounded-3xl text-slate-900 ring-1 ring-slate-300 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-300/20">
                    <div className="flex flex-col items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 flex-none text-blue-600"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path
                          stroke="none"
                          d="M0 0h24v24H0z"
                          fill="none"
                        ></path>
                        <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path>
                        <path d="M9 12l2 2l4 -4"></path>
                      </svg>

                      <h3
                        style={{ fontSize: "2.0rem" }}
                        className="font-semibold leading-8 mt-4"
                      >
                        Uploaded Document
                      </h3>

                      <p className="mt-2 flex items-baseline gap-x-1">
                        <span className="text-5xl font-bold tracking-tight">
                          3
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4 mt-8 pd-10">
                  {/* Feedback Box */}
                  <div className="flex-grow bg-slate-50 p-8 pl-4 rounded-3xl text-slate-900 ring-1 ring-slate-300 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-300/20">
                    <div className="flex flex-col items-start">
                      {" "}
                      {/* Align text to the left */}
                      <h3
                        style={{ fontSize: "2.0rem" }}
                        className="font-semibold leading-8 mb-4"
                      >
                        Feedback
                      </h3>
                      {randomFeedback.map((feedback, index) => (
                        <div
                          key={index}
                          className="bg-slate-100 p-4 rounded-md mb-4 text-slate-900 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-300/20"
                        >
                          {feedback}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Insights Box */}
                  <div className="flex-grow bg-slate-50 p-8 pl-4 rounded-3xl text-slate-900 ring-1 ring-slate-300 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-300/20">
                    <div className="flex flex-col items-start">
                      {" "}
                      {/* Align text to the left */}
                      <h3
                        style={{ fontSize: "2.0rem" }}
                        className="font-semibold leading-8 mb-4"
                      >
                        Key Insights
                      </h3>
                      {randomKeyInsights.map((insight, index) => (
                        <div
                          key={index}
                          className="bg-slate-100 p-4 rounded-md mb-4 text-slate-900 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-300/20"
                        >
                          {insight}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
