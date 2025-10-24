import React from "react";
import { ChevronRight } from "lucide-react";

const StatCard = ({ title, message, icon: Icon, iconBg, iconColor, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="
        relative group cursor-pointer
        bg-white dark:bg-gray-800
        border border-gray-100 dark:border-gray-700
        rounded-2xl p-6 flex flex-col justify-between
        shadow-lg shadow-gray-300 dark:shadow-gray-900
        transition-transform transition-shadow duration-500 ease-in-out
        transform hover:scale-105
        hover:shadow-2xl hover:shadow-gray-400/30 dark:hover:shadow-gray-900/50
        hover:bg-gradient-to-r hover:from-sky-400 hover:to-sky-600
      "
    >
      {/* Top-right arrow */}
      <div className="
        absolute top-4 right-4 w-9 h-9 flex items-center justify-center
        rounded-full bg-gray-100 dark:bg-gray-700
        transition-colors duration-300
        group-hover:bg-white
      ">
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-sky-600 transition-colors duration-300" />
      </div>

      {/* Icon */}
      {Icon && (
        <div className={`
          w-16 h-16 flex items-center justify-center rounded-xl mb-4
          ${iconBg} ${iconColor}
          transition-all duration-500 ease-in-out
          group-hover:bg-white group-hover:text-sky-600
          shadow-md group-hover:shadow-xl
        `}>
          <Icon className="w-8 h-8" />
        </div>
      )}

      {/* Text Content */}
      <div className="flex flex-col">
        <h3 className="
          text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1
          group-hover:text-white transition-colors duration-300
        ">
          {title}
        </h3>
        <p className="
          text-sm text-gray-500 dark:text-gray-400
          group-hover:text-white transition-colors duration-300
        ">
          {message}
        </p>
      </div>

      {/* Footer Action */}
      <div className="mt-4">
        <button className="
          text-sm font-medium text-sky-600 dark:text-sky-400
          group-hover:text-white transition-colors duration-300
          flex items-center gap-1
        ">
          View Details
          <ChevronRight className="w-4 h-4 group-hover:text-white transition-colors duration-300" />
        </button>
      </div>
    </div>
  );
};

export default StatCard;
