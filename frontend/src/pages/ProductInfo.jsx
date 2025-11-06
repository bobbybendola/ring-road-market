import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ProductInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:8000/listings/${id}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        setError('Cannot connect to server');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Product not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate('/dashboard')}
          className="mb-4 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow"
        >
          ← Back to Dashboard
        </button>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-8">
            
            {/* Product Image */}
            <div className="flex items-center justify-center bg-gray-100 rounded-lg p-8">
              {product.image_url ? (
                <img
                  src={`${API_URL}${product.image_url}`}
                  alt={product.title}
                  className="max-w-full h-auto object-cover rounded-lg"
                />
              ) : (
                <div className="text-gray-400">No image</div>
              )}
            </div>

            {/* Product Details */}
            <div className="flex flex-col justify-center">
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {product.title}
              </h1>
              
              <div className="text-3xl font-bold text-blue-600 mb-6">
                ${product.price.toFixed(2)}
              </div>

              <div className="mb-4">
                <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                  {product.category}
                </span>
              </div>

              {product.description && (
                <div className="text-gray-700 mb-6">
                  <p>{product.description}</p>
                </div>
              )}

              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition">
                Contact Seller
              </button>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;