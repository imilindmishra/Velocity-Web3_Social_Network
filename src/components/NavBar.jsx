import React from 'react'

const NavBar = () => {
  return (
    <nav className="bg-indigo-950 pt-3 pb-3">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between">
          <div className="flex text-3x1 mt-1 space-x-4 text-white font-bold">
            Developer's E-Card
          </div>
          <div className="flex items-center space-x-1">
            <button
              className="bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium"
              onClick={() => (window.location.href = "https://github.com/imilindmishra/E-dev-Card")}
            >
              Github Repo.
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavBar
