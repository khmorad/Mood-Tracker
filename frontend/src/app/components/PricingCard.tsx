"use client";

import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";

interface PricingCardProps {
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  buttonText: string;
  gradient: string;
  onClick?: () => void;
  disabled?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({
  title,
  price,
  period,
  description,
  features,
  isPopular = false,
  buttonText,
  gradient,
  onClick,
  disabled = false,
}) => {
  return (
    <motion.div
      className={`relative bg-white/20 backdrop-blur-lg rounded-3xl p-8 shadow-xl border transition-all duration-300 ${
        isPopular
          ? "border-purple-400 scale-105 shadow-2xl"
          : "border-white/30 hover:border-white/50"
      } ${disabled ? "opacity-75" : ""}`}
      whileHover={{
        y: disabled ? 0 : -5,
        scale: isPopular ? 1.05 : disabled ? 1 : 1.02,
      }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {isPopular && (
        <motion.div
          className="absolute -top-4 left-1/2 transform -translate-x-1/2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
            <Star className="w-4 h-4" />
            Most Popular
          </div>
        </motion.div>
      )}

      {disabled && (
        <motion.div
          className="absolute top-4 right-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <Check className="w-3 h-3" />
            Active
          </div>
        </motion.div>
      )}

      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-4xl font-bold text-gray-800">{price}</span>
          <span className="text-gray-600">/{period}</span>
        </div>
      </div>

      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <motion.li
            key={index}
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 + 0.2 }}
          >
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Check className="w-3 h-3 text-white" />
            </div>
            <span className="text-gray-700">{feature}</span>
          </motion.li>
        ))}
      </ul>

      <motion.button
        className={`w-full bg-gradient-to-r ${gradient} text-white py-4 rounded-2xl font-semibold text-lg shadow-lg transition-all duration-300 ${
          disabled
            ? "opacity-60 cursor-not-allowed bg-gray-400"
            : "hover:shadow-xl"
        }`}
        whileHover={disabled ? {} : { scale: 1.02 }}
        whileTap={disabled ? {} : { scale: 0.98 }}
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
      >
        {buttonText}
      </motion.button>
    </motion.div>
  );
};

export default PricingCard;
