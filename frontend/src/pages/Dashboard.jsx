import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ListingCard from '../components/ListingCard';
import CreateListingModal from '../components/CreateListingModal';

function Dashboard({ user, onLogout }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('All');

  const categories = ['All', 'Textbooks', 'Furniture', 'Electronics', 'Clothing', 'Tickets', 'Housing', 'Other'];

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const response = await fetch('http://localhost:8000/listings');
      if (response.ok) {
        const data = await response.json();
        setListings(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    setListings(listings.filter(l => l.id !== id));
  };

  const handleSuccess = () => {
    setShowModal(false);
    fetchListings();
  };

  const filteredListings = filter === 'All' 
    ? listings 
    : listings.filter(l => l.category === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Browse Listings</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + New Listing
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded whitespace-nowrap ${
                filter === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Listings */}
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No listings found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredListings.map(listing => (
              <ListingCard key={listing.id} listing={listing} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <CreateListingModal onClose={() => setShowModal(false)} onSuccess={handleSuccess} />
      )}
    </div>
  );
}

export default Dashboard;