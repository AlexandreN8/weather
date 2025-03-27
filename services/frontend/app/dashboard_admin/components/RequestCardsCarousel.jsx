import { motion } from 'framer-motion';
import { useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import RequestCard from './RequestCard';

export default function RequestCardsCarousel({ requests, removeRequest }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!requests || requests.length === 0) {
    return (
      <div className="border border-gray-100 rounded-lg bg-white shadow-sm h-full">
        <p className="p-4">Aucune demande de rôle en cours.</p>
      </div>
    );
  }

  const handleNext = () => {
    if (currentIndex < requests.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="relative h-full flex overflow-x-hidden">
      {/* Badge */}
      <div className="absolute top-0 right-0 bg-blue-500 text-white px-2 py-1 rounded-tr-lg rounded-bl-lg text-xs font-semibold z-20">
        {requests.length}
      </div>

      {/* Flex slider */}
      <motion.div
        className="flex h-full"
        style={{ width: `${requests.length * 100}%` }}
        animate={{ x: `-${currentIndex * 100}%` }}
        transition={{ duration: 0.5 }}
      >
        {requests.map((request) => (
          <div key={request.id} className="w-full flex-shrink-0 h-full">
            <RequestCard 
              request={request} 
              onRemoveRequest={removeRequest}
              className="h-full" 
            />
          </div>
        ))}
      </motion.div>

      {/* Left chevron */}
      <div className="absolute inset-y-0 left-[-15px] flex items-center px-2">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-200 disabled:opacity-50"
        >
          <FaChevronLeft className="text-gray-500" />
        </button>
      </div>

      {/* Right Chevron */}
      <div className="absolute inset-y-0 right-[-15px] flex items-center px-2">
        <button
          onClick={handleNext}
          disabled={currentIndex === requests.length - 1}
          className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-200 disabled:opacity-50"
        >
          <FaChevronRight className="text-gray-500" />
        </button>
      </div>

      {/* Bullets */}
      <div className="absolute bottom-3 w-full flex justify-center items-center space-x-2">
        {requests.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full ${index === currentIndex ? 'bg-blue-500' : 'bg-gray-300'}`}
          />
        ))}
      </div>
    </div>
  );
}
