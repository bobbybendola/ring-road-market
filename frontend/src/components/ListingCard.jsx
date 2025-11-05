import { useState } from 'react';

function ListingCard({ listing, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const isOwner = currentUser && currentUser.id === listing.user_id;

  const handleDelete = async () => {
    if (!confirm('Delete this listing?')) return;

    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/listings/${listing.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        onDelete(listing.id);
      }
    } catch (err) {
      alert('Error deleting');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {listing.image_url ? (
        <img
          src={`http://localhost:8000${listing.image_url}`}
          alt={listing.title}
          className="w-full h-48 object-cover rounded mb-3"
        />
      ) : (
        <div className="w-full h-48 bg-gray-200 rounded mb-3 flex items-center justify-center">
          <span className="text-gray-400">No image</span>
        </div>
      )}

      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
        {listing.category}
      </span>

      <h3 className="font-bold text-lg mt-2">{listing.title}</h3>
      <p className="text-2xl font-bold text-blue-600 mt-1">${listing.price}</p>
      
      {listing.description && (
        <p className="text-sm text-gray-600 mt-2">{listing.description}</p>
      )}

      <div className="flex gap-2 mt-4">
        <button className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Contact
        </button>
        {isOwner && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

export default ListingCard;