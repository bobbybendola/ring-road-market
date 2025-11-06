import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ListingCard({ listing, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const isOwner = currentUser && currentUser.id === listing.user_id;

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const handleDelete = async () => {
    if (!confirm('Delete this listing?')) return;

    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/listings/${listing.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        onDelete(listing.id);
      } else {
        alert('Failed to delete listing');
      }
    } catch (err) {
      alert('Error: Cannot connect to server');
    } finally {
      setDeleting(false);
    }
  };

  const handleViewDetails = () => {
    navigate(`/listing/${listing.id}`);
  };

  // Format price with 2 decimals
  const formattedPrice = typeof listing.price === 'number' 
    ? listing.price.toFixed(2) 
    : listing.price;

  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow flex flex-col h-full">
      {/* Image - clickable */}
      <div onClick={handleViewDetails} className="cursor-pointer">
        {listing.image_url ? (
          <img
            src={`${API_URL}${listing.image_url}`}
            alt={listing.title}
            className="w-full h-48 object-cover rounded mb-3 hover:opacity-90 transition-opacity"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 rounded mb-3 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
      </div>

      {/* Category badge */}
      <div>
        <span className="inline-block text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
          {listing.category}
        </span>
      </div>

      {/* Title - clickable */}
      <h3 
        onClick={handleViewDetails}
        className="font-bold text-lg mt-2 cursor-pointer hover:text-blue-600 transition-colors"
      >
        {listing.title}
      </h3>

      {/* Price */}
      <p className="text-2xl font-bold text-blue-600 mt-1">
        ${formattedPrice}
      </p>
      
      {/* Description - truncated */}
      {listing.description && (
        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
          {listing.description}
        </p>
      )}

      {/* Spacer to push buttons to bottom */}
      <div className="flex-grow"></div>

      {/* Buttons - always at bottom */}
      <div className="flex gap-2 mt-4">
        <button 
          onClick={handleViewDetails}
          className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
        >
          View Details
        </button>
        {isOwner && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50 transition-colors"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        )}
      </div>
    </div>
  );
}

export default ListingCard;