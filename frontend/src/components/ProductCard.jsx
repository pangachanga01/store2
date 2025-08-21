import React from 'react';

const ProductCard = ({ product }) => {
  const formatPrice = (cents) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <div className="overflow-hidden bg-white rounded-lg shadow-md">
      <img
        src={product.main_image_url || 'https://via.placeholder.com/400x300'}
        alt={product.name}
        className="object-cover w-full h-48"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <p className="mt-1 text-sm text-gray-500">{product.category_name}</p>
        <div
          className="mt-2 text-sm text-gray-700"
          dangerouslySetInnerHTML={{ __html: product.description_html }}
        />
        <p className="mt-4 text-xl font-bold text-right text-gray-900">
          {formatPrice(product.price_cents)}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;
