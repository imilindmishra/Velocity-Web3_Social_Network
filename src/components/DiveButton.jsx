import React from 'react';
import { useNavigate } from 'react-router-dom';

function DiveButton() {
    const navigate = useNavigate();

    const handleLandingClick = () => {
        navigate('/bounties');
    }   

    return (
        <div className="font-serif flex justify-center">
            <button
                className="bg-yellow-800 text-white mt-4 px-12 py-2 pt-3 pb-3 rounded-md text-x1 font-medium shadow-md hover:shadow-xl transition duration-300"
                onClick={handleLandingClick}
            >
                Dive In →
            </button>        
        </div>
    );
}

export default DiveButton;
