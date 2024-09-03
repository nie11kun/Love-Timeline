import React, { useState, useEffect, useCallback } from 'react';
import { differenceInDays, parse } from 'date-fns';
import { Heart, X, Image as ImageIcon, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const importantDates = [
  { date: '2022-11-19', event: '第一次在青藤上找到你', image: '/images/2022-11-19/1.jpg' },
  { date: '2022-11-24', event: '第一次见面', image: '/images/2022-11-24/1.jpg' },
  { date: '2022-12-19', event: '正式在一起', image: '/images/2022-12-19/1.jpg' },
  { date: '2023-10-05', event: '订婚', image: '/images/2023-10-05/1.jpg' },
  { date: '2023-10-30', event: '领结婚证', image: '/images/2023-10-30/1.jpg' },
  { date: '2024-01-28', event: '结婚典礼', image: '/images/2024-01-28/1.jpg' },
  { date: '2024-06-17', event: '怀孕', image: '/images/2024-06-17/1.jpg' },
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
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50" onClick={onClose}>
      <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="absolute top-4 right-4 text-white hover:text-pink-300 transition-colors duration-300">
        <X size={32} />
      </button>
      <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="absolute left-4 text-white hover:text-pink-300 transition-colors duration-300">
        <ChevronLeft size={32} />
      </button>
      <img src={src} alt="Full screen" className="max-h-[90vh] max-w-[90vw] object-contain shadow-2xl" onClick={(e) => e.stopPropagation()} />
      <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="absolute right-4 text-white hover:text-pink-300 transition-colors duration-300">
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

  const handleCardClick = useCallback((date) => {
    setSelectedDate(date);
  }, []);

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

  const closeImageViewer = useCallback(() => {
    setSelectedDate(null);
    setImages([]);
  }, []);

  const openFullScreenImage = useCallback((index) => {
    setFullScreenImage(index);
  }, []);

  const closeFullScreenImage = useCallback(() => {
    setFullScreenImage(null);
  }, []);

  const nextFullScreenImage = useCallback(() => {
    setFullScreenImage((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevFullScreenImage = useCallback(() => {
    setFullScreenImage((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const getGridColumns = useCallback((imageCount) => {
    if (imageCount <= 1) return 'grid-cols-1';
    if (imageCount <= 2) return 'grid-cols-1 sm:grid-cols-2';
    if (imageCount <= 3) return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
    if (imageCount <= 4) return 'grid-cols-2 sm:grid-cols-2 md:grid-cols-4';
    return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5';
  }, []);

  const getContainerWidth = useCallback((imageCount) => {
    if (imageCount <= 1) return 'max-w-md';
    if (imageCount <= 2) return 'max-w-xl';
    if (imageCount <= 3) return 'max-w-2xl';
    if (imageCount <= 4) return 'max-w-3xl';
    return 'max-w-6xl';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-100 to-purple-100 py-12 px-4 sm:px-6 lg:px-8 font-serif">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-pink-600 mb-12 italic">我们的爱情时光</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {importantDates.map((item, index) => {
            const date = parse(item.date, 'yyyy-MM-dd', new Date());
            const daysSince = differenceInDays(today, date);
            return (
              <div 
                key={index} 
                className="rounded-lg shadow-lg overflow-hidden transform transition duration-500 hover:scale-105 hover:shadow-xl cursor-pointer relative h-64" 
                onClick={() => handleCardClick(item.date)}
                style={{
                  backgroundImage: `url(${item.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-white bg-opacity-80 p-6 flex flex-col justify-between">
                  <div>
                    <Heart className="absolute top-2 right-2 text-pink-400" size={24} />
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2">{item.event}</h2>
                    <div className="flex items-center text-gray-600 mb-4">
                      <Calendar size={18} className="mr-2" />
                      <p>{item.date}</p>
                    </div>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-pink-500">
                    {daysSince} 天的爱
                  </p>
                </div>
                <div className={`h-1 ${getColorClass(index)} absolute bottom-0 left-0 right-0`}></div>
              </div>
            );
          })}
        </div>
      </div>
      {selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-40 p-4" onClick={closeImageViewer}>
          <div className={`bg-white rounded-lg overflow-hidden w-full ${getContainerWidth(images.length)} max-h-[90vh] flex flex-col shadow-2xl`} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">{selectedDate} 的照片</h2>
              <button onClick={closeImageViewer} className="text-gray-500 hover:text-gray-700 transition-colors duration-300">
                <X size={24} />
              </button>
            </div>
            <div className="flex-grow overflow-y-auto p-4">
              {loading ? (
                <div className="text-center py-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
                  <p className="mt-4 text-gray-600">加载中...</p>
                </div>
              ) : error ? (
                <div className="text-center py-10 text-red-500">
                  <p>{error}</p>
                </div>
              ) : images.length > 0 ? (
                <div className={`grid ${getGridColumns(images.length)} gap-4`}>
                  {images.map((img, index) => (
                    <div key={index} className="aspect-w-1 aspect-h-1 cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300" onClick={() => openFullScreenImage(index)}>
                      <img src={img} alt={`Memory ${index + 1}`} className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">暂无图片</p>
                </div>
              )}
            </div>
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