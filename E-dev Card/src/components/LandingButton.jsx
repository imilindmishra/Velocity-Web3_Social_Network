import React from 'react';
import { useNavigate } from 'react-router-dom';

function LandingButton() {

    const navigate = useNavigate();

    const HandleLandingClick = () => {
        navigate('/create');
    }   


    return (
        <div className="flex justify-center">

            <button
                className="bg-blue-950 text-white mt-28 px-16 py-2 pt-3 pb-3 rounded-md text-sm font-medium"
                onClick={HandleLandingClick}
                >
                Create your own Dev Card →
            </button>
            
        </div>
    )

}

export default LandingButton
