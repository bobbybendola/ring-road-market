function Navbar({ user, onLogout }) {
  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <img 
              src="/market-logo.png" 
              alt="Ring Road Market Logo" 
              className="h-10 w-10 object-contain"
            />
            <h1 className="text-xl font-bold text-blue-600">Ring Road Market</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm">Hello, {user.name}</span>
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