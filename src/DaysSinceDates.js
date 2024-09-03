import React, { useState, useEffect, useCallback } from 'react';
import { differenceInDays, parse } from 'date-fns';
import { Heart, X, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';

const importantDates = [
  { date: '2022-11-19', event: '第一次在青藤上找到你' },
  { date: '2022-11-24', event: '第一次见面' },
  { date: '2022-12-19', event: '正式在一起' },
  { date: '2023-10-05', event: '订婚' },
  { date: '2023-10-30', event: '领结婚证' },
  { date: '2024-01-28', event: '结婚典礼' },
  { date: '2024-06-17', event: '怀孕' },
];

const FullScreenImage = ({ src, onClose, onNext, onPrev }) => {
  const handleKeyDown = useCallback((event) => {
    if (event.key === 'ArrowLeft') {
      onPrev();
    } else if (event.key === 'ArrowRight') {
      onNext();
    } else if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose, onNext, onPrev]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <button onClick={onClose} className="absolute top-4 right-4 text-white">
        <X size={32} />
      </button>
      <button onClick={onPrev} className="absolute left-4 text-white">
        <ChevronLeft size={32} />
      </button>
      <img src={src} alt="Full screen" className="max-h-full max-w-full object-contain" />
      <button onClick={onNext} className="absolute right-4 text-white">
        <ChevronRight size={32} />
      </button>
    </div>
  );
};

const DaysSinceDates = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const today = new Date();

  useEffect(() => {
    if (selectedDate) {
      setLoading(true);
      setError(null);
      setImages([]);

      const loadImages = async () => {
        try {
          const imageUrls = [];
          const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];

          for (let i = 1; i <= 10; i++) {
            let imageFound = false;
            for (const ext of imageExtensions) {
              const imageUrl = `/images/${selectedDate}/${i}.${ext}`;
              try {
                const response = await fetch(imageUrl);
                if (response.ok) {
                  const blob = await response.blob();
                  if (blob.type.startsWith('image/')) {
                    imageUrls.push(imageUrl);
                    imageFound = true;
                    break;
                  }
                }
              } catch (error) {
                console.error('Error fetching image:', error);
              }
            }
            if (!imageFound) {
              break;
            }
          }
          
          setImages(imageUrls);
          if (imageUrls.length === 0) {
            setError('没有找到图片');
          }
        } catch (err) {
          setError('加载图片时出错，请稍后再试。');
        } finally {
          setLoading(false);
        }
      };

      loadImages();
    }
  }, [selectedDate]);

  const handleCardClick = (date) => {
    setSelectedDate(date);
  };

  const closeImageViewer = () => {
    setSelectedDate(null);
    setImages([]);
  };

  const openFullScreenImage = (index) => {
    setFullScreenImage(index);
  };

  const closeFullScreenImage = () => {
    setFullScreenImage(null);
  };

  const nextFullScreenImage = useCallback(() => {
    setFullScreenImage((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevFullScreenImage = useCallback(() => {
    setFullScreenImage((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-100 to-purple-100 py-12 px-4 sm:px-6 lg:px-8 font-serif">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-pink-600 mb-12 italic">我们的爱情时光</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {importantDates.map((item, index) => {
            const date = parse(item.date, 'yyyy-MM-dd', new Date());
            const daysSince = differenceInDays(today, date);
            return (
              <div 
                key={index} 
                className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-500 hover:scale-105 border border-pink-200 cursor-pointer" 
                onClick={() => handleCardClick(item.date)}
              >
                <div className="p-6 relative">
                  <Heart className="absolute top-2 right-2 text-pink-400" size={24} />
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">{item.event}</h2>
                  <p className="text-gray-600 mb-4">{item.date}</p>
                  <p className="text-3xl font-bold text-pink-500">
                    {daysSince} 天的爱
                  </p>
                </div>
                <div className={`h-1 ${getColorClass(index)}`}></div>
              </div>
            );
          })}
        </div>
      </div>
      {selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-40">
          <div className="bg-white p-4 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{selectedDate} 的照片</h2>
              <button onClick={closeImageViewer} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            {loading ? (
              <div className="text-center py-10">
                <p>加载中...</p>
              </div>
            ) : error ? (
              <div className="text-center py-10 text-red-500">
                <p>{error}</p>
              </div>
            ) : images.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((img, index) => (
                  <div key={index} className="aspect-w-1 aspect-h-1 cursor-pointer" onClick={() => openFullScreenImage(index)}>
                    <img src={img} alt={`Memory ${index + 1}`} className="w-full h-full object-cover rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
                <p>暂无图片</p>
              </div>
            )}
          </div>
        </div>
      )}
      {fullScreenImage !== null && (
        <FullScreenImage
          src={images[fullScreenImage]}
          onClose={closeFullScreenImage}
          onNext={nextFullScreenImage}
          onPrev={prevFullScreenImage}
        />
      )}
    </div>
  );
};

const getColorClass = (index) => {
  const colors = [
    'bg-pink-300', 'bg-purple-300', 'bg-red-300', 
    'bg-orange-300', 'bg-yellow-300', 'bg-green-300', 'bg-blue-300'
  ];
  return colors[index % colors.length];
};

export default DaysSinceDates;