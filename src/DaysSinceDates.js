import React, { useState, useEffect, useCallback, useRef } from 'react';
import { differenceInDays, parse } from 'date-fns';
import { Heart, X, Image as ImageIcon, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import MusicPlayer from './MusicPlayer'; // 导入 MusicPlayer 组件
import { importantDates } from './importantDates'; // 导入 importantDates 数据

// 全屏图片查看组件
const FullScreenImage = ({ src, onClose, onNext, onPrev }) => {
    const touchStartX = useRef(null);
    const touchEndX = useRef(null);
    const [isSwiping, setIsSwiping] = useState(false);
    const [swipeDistance, setSwipeDistance] = useState(0);

    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
        setIsSwiping(true);
    };

    const handleTouchMove = (e) => {
        if (!isSwiping) return;
        touchEndX.current = e.touches[0].clientX;
        const distance = touchEndX.current - touchStartX.current;
        setSwipeDistance(distance);
    };

    const handleTouchEnd = () => {
        if (!isSwiping) return;
        setIsSwiping(false);
        if (Math.abs(swipeDistance) > 100) { // Increased threshold for more intentional swipes
            if (swipeDistance > 0) {
                onPrev();
            } else {
                onNext();
            }
        }
        setSwipeDistance(0);
    };

    const handleKeyDown = useCallback((event) => {
        if (event.key === 'ArrowLeft') {
            onPrev();
        } else if (event.key === 'ArrowRight') {
            onNext();
        } else if (event.key === 'Escape') {
            onClose();
        }
    }, [onClose, onNext, onPrev]);

    // 添加和移除键盘事件监听器
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    const imageStyle = {
        transform: `translateX(${swipeDistance}px)`,
        transition: isSwiping ? 'none' : 'transform 0.3s ease-out',
    };

    // 渲染全屏图片查看器
    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50" 
            onClick={onClose}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* 关闭按钮 */}
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="absolute top-4 right-4 text-white hover:text-pink-300 transition-colors duration-300">
                <X size={32} />
            </button>
            {/* 上一张图片按钮 */}
            <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="absolute left-4 text-white hover:text-pink-300 transition-colors duration-300">
                <ChevronLeft size={32} />
            </button>
            {/* 图片显示 */}
            <img 
                src={src} 
                alt="Full screen" 
                className="max-h-[90vh] max-w-[90vw] object-contain shadow-2xl" 
                onClick={(e) => e.stopPropagation()} 
                style={imageStyle}
            />
            {/* 下一张图片按钮 */}
            <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="absolute right-4 text-white hover:text-pink-300 transition-colors duration-300">
                <ChevronRight size={32} />
            </button>
        </div>
    );
};

// 主组件:展示重要日期和天数
const DaysSinceDates = () => {
    // 状态管理
    const [selectedDate, setSelectedDate] = useState(null); // 选中的日期
    const [images, setImages] = useState([]); // 图片数组
    const [loading, setLoading] = useState(false); // 加载状态
    const [error, setError] = useState(null); // 错误信息
    const [fullScreenImage, setFullScreenImage] = useState(null); // 全屏显示的图片索引
    const today = new Date(); // 当前日期

    // 处理卡片点击事件
    const handleCardClick = useCallback((date) => {
        setSelectedDate(date);
    }, []);

    // 加载选中日期的图片
    useEffect(() => {
        if (selectedDate) {
            setLoading(true);
            setError(null);
            setImages([]);

            const loadImages = async () => {
                try {
                    const imageUrls = [];
                    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];

                    // 尝试加载最多10张不同扩展名的图片
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

    // 关闭图片查看器
    const closeImageViewer = useCallback(() => {
        setSelectedDate(null);
        setImages([]);
    }, []);

    // 打开全屏图片
    const openFullScreenImage = useCallback((index) => {
        setFullScreenImage(index);
    }, []);

    // 关闭全屏图片
    const closeFullScreenImage = useCallback(() => {
        setFullScreenImage(null);
    }, []);

    // 显示下一张全屏图片
    const nextFullScreenImage = useCallback(() => {
        setFullScreenImage((prev) => (prev + 1) % images.length);
    }, [images.length]);

    // 显示上一张全屏图片
    const prevFullScreenImage = useCallback(() => {
        setFullScreenImage((prev) => (prev - 1 + images.length) % images.length);
    }, [images.length]);

    // 根据图片数量确定网格列数
    const getGridColumns = useCallback((imageCount) => {
        if (imageCount <= 1) return 'grid-cols-1';
        if (imageCount <= 2) return 'grid-cols-1 sm:grid-cols-2';
        if (imageCount <= 3) return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
        if (imageCount <= 4) return 'grid-cols-2 sm:grid-cols-2 md:grid-cols-4';
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5';
    }, []);

    // 根据图片数量确定容器宽度
    const getContainerWidth = useCallback((imageCount) => {
        if (imageCount <= 1) return 'max-w-md';
        if (imageCount <= 2) return 'max-w-xl';
        if (imageCount <= 3) return 'max-w-2xl';
        if (imageCount <= 4) return 'max-w-3xl';
        return 'max-w-6xl';
    }, []);

    // 渲染主组件
    return (
        <div className="min-h-screen bg-love-pattern bg-fixed pt-12 pb-24 px-4 sm:px-6 lg:px-8 font-serif"> {/* 增加底部 padding */}
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold text-center text-pink-600 mb-12 italic drop-shadow-lg">我们的爱情时光</h1>
                {/* 重要日期卡片网格 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {importantDates.map((item, index) => {
                        const date = parse(item.date, 'yyyy-MM-dd', new Date());
                        const daysSince = differenceInDays(today, date);
                        return (
                            <motion.div
                                key={index}
                                className="rounded-lg shadow-lg overflow-hidden cursor-pointer relative h-48"
                                onClick={() => handleCardClick(item.date)}
                                whileHover={{ 
                                    scale: 1.05,
                                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                                }}
                                whileTap={{ scale: 0.95 }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div 
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-300 ease-in-out transform hover:scale-110"
                                    style={{
                                        backgroundImage: `url(${item.image})`,
                                        filter: 'blur(3px) brightness(1.2)',
                                    }}
                                ></div>
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-60"></div>
                                <div className="absolute inset-0 flex flex-col justify-between p-4 z-10">
                                    <div>
                                        <h2 className="text-xl font-bold text-white mb-2 line-clamp-1 shadow-text transition-colors duration-300 hover:text-pink-300">{item.event}</h2>
                                        <div className="flex items-center text-white text-sm shadow-text">
                                            <Calendar size={14} className="mr-1" />
                                            <p>{item.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-end">
                                        <motion.p 
                                            className="text-5xl font-bold text-pink-300 mr-2 shadow-text"
                                            whileHover={{ scale: 1.1 }}
                                        >
                                            {daysSince}
                                        </motion.p>
                                        <p className="text-lg text-white mb-1 shadow-text">天的爱</p>
                                    </div>
                                </div>
                                <motion.div
                                    className="absolute top-2 right-2 text-pink-400 z-20"
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.8 }}
                                >
                                    <Heart size={24} />
                                </motion.div>
                                <div className={`h-1 ${getColorClass(index)} absolute bottom-0 left-0 right-0 z-20`}></div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
            {/* 图片查看器 */}
            {selectedDate && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-40 p-4" onClick={closeImageViewer}>
                    <div className={`bg-white rounded-lg overflow-hidden w-full ${getContainerWidth(images.length)} max-h-[90vh] flex flex-col shadow-2xl`} onClick={(e) => e.stopPropagation()}>
                        {/* 图片查看器标题 */}
                        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800">{selectedDate} 的照片</h2>
                            <button onClick={closeImageViewer} className="text-gray-500 hover:text-gray-700 transition-colors duration-300">
                                <X size={24} />
                            </button>
                        </div>
                        {/* 图片查看器内容 */}
                        <div className="flex-grow overflow-y-auto p-4">
                            {loading ? (
                                // 加载中状态
                                <div className="text-center py-10">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
                                    <p className="mt-4 text-gray-600">加载中...</p>
                                </div>
                            ) : error ? (
                                // 错误状态
                                <div className="text-center py-10 text-red-500">
                                    <p>{error}</p>
                                </div>
                            ) : images.length > 0 ? (
                                // 图片网格
                                <div className={`grid ${getGridColumns(images.length)} gap-4`}>
                                    {images.map((img, index) => (
                                        <div key={index} className="aspect-w-1 aspect-h-1 cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300" onClick={() => openFullScreenImage(index)}>
                                            <img src={img} alt={`Memory ${index + 1}`} className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                // 无图片状态
                                <div className="text-center py-10">
                                    <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
                                    <p className="text-gray-600">暂无图片</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* 全屏图片查看器 */}
            {fullScreenImage !== null && (
                <FullScreenImage
                    src={images[fullScreenImage]}
                    onClose={closeFullScreenImage}
                    onNext={nextFullScreenImage}
                    onPrev={prevFullScreenImage}
                />
            )}
            {/* 添加 MusicPlayer 组件 */}
            <div className="fixed bottom-0 left-0 right-0 z-50">
                <MusicPlayer />
            </div>
        </div>
    );
};

// 根据索引获取不同的颜色类名
const getColorClass = (index) => {
    const colors = [
        'bg-pink-300', 'bg-purple-300', 'bg-red-300',
        'bg-orange-300', 'bg-yellow-300', 'bg-green-300', 'bg-blue-300'
    ];
    // 使用模运算确保颜色循环使用
    return colors[index % colors.length];
};

// 导出DaysSinceDates组件
export default DaysSinceDates;