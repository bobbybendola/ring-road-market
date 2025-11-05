function Navbar({ user, onLogout }) {
  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-xl font-bold text-blue-600">UCI Marketplace</h1>
          
          <div className="flex items-center gap-4">
            <span className="text-sm">Hi, {user.name}</span>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;