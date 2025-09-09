import React from "react";
import { motion } from "framer-motion";

const StatsCard = ({
  icon: Icon,
  title,
  value,
  subText,
  borderColor = "border-gray-500",
  bgColor = "bg-gray-100",
  textColor = "text-gray-600",
  animate = true,
}) => {
  const Wrapper = animate ? motion.div : "div";
  const wrapperProps = animate ? { whileHover: { y: -5 } } : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${borderColor}`}
    >
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${bgColor} ${textColor} mr-4`}>
          <Icon className="text-2xl" />
        </div>
        <div>
          <h3 className="text-gray-600 font-medium">{title}</h3>
          <p className={`text-3xl font-bold ${textColor}`}>
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {subText && (
            <p className={`text-sm ${textColor.replace("600", "500")} mt-1`}>
              {subText}
            </p>
          )}
        </div>
      </div>
    </Wrapper>
  );
};

export default StatsCard;
