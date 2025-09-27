import React from "react";
import { ChevronRight } from "lucide-react";

const StatCard = ({ title, value, message, icon: Icon, iconBg, iconColor, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="
        relative group cursor-pointer bg-white shadow-md rounded-2xl p-4 flex flex-col md:flex-row 
        md:items-center md:justify-between gap-4 
        transition-all duration-300 ease-in-out 
        hover:scale-105 hover:bg-gradient-to-r hover:from-sky-400 hover:to-sky-600
        hover:shadow-2xl hover:shadow-sky-500
      "
    >
      {/* Top-right arrow */}
      <div className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full transition-colors group-hover:bg-white">
        <ChevronRight className="w-4 h-4 text-sky-500 group-hover:text-black" />
      </div>

      {/* Content */}
      <div className="flex-1 text-center md:text-left flex flex-col gap-4">
        <h2 className="text-xl font-bold transition-colors group-hover:text-white">
          {title}
        </h2>
        <p className="text-sm text-gray-400 group-hover:text-white transition-colors">
          {message}
        </p>
      </div>


      {/* Icon */}
      {Icon && (
        <div
          className={`
            w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-full 
            mx-auto md:mx-0 ${iconBg}
            transition-all duration-300 ease-in-out group-hover:bg-white
          `}
        >
          <Icon className={`w-7 h-7 md:w-8 md:h-8 ${iconColor} group-hover:text-sky-500`} />
        </div>
      )}
    </div>
  );
};

export default StatCard;
