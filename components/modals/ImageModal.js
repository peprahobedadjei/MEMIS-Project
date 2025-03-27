import React from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

const ImageModal = ({ 
  isOpen = false, 
  onClose = () => {}, 
  imageUrl = '', 
  altText = '' 
}) => {
  // If isOpen is false or imageUrl is empty, don't render anything
  if (!isOpen || !imageUrl) return null;

  console.log(imageUrl)

  return (
    <div 
      className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="relative max-w-full max-h-full"
        onClick={(e) => e.stopPropagation()} 
      >
        <button 
          onClick={onClose} 
          className="absolute -top-8 right-0 text-white hover:text-gray-300"
        >
          <X size={24} />
        </button>
        <Image 
          src={imageUrl}
          alt={altText}
          width={500}
          height={500}
          objectFit='contain'
          className="max-w-full max-h-screen object-contain"
        />
      </div>
    </div>
  );
};

export default ImageModal;