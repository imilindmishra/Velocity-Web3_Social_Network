import React from 'react'
import NavBar from './components/NavBar'
import BlueCard from './components/BlueCard'
import LandingButton from './components/LandingButton'
import { useEffect } from 'react'
import Dive from './components/DiveButton'



const Home = () => {
    useEffect(() => {
        // When the component mounts, add the class to the body
        document.body.classList.add('overflow-hidden');
        // When the component unmounts, remove the class from the body
        return () => {
            document.body.classList.remove('overflow-hidden');
        };
    }, []);

    return (
    <div className="flex w-full min-h-screen">
            <div className='w-1/2'>
                <div className="bg-orange-100 min-h-screen">
                    <div className="relative z-10 flex flex-col items-center">
                        <h1 className="text-5xl md:text-5xl lg:text-5xl font-serif text-center leading-tight pt-28 mb-0">
                            Mint Your Identity<br />
                            Forge Your Community
                        </h1>
                    </div>
                    <LandingButton className="mb-24 mt-0"/>
                    <BlueCard />
                </div>
            </div>
            <div className='w-1/2'>
                <div className="bg-orange-100 min-h-screen">
                    <div className="relative z-10 flex flex-col items-center">
                        <h1 className="text-5xl md:text-5xl lg:text-5xl font-serif text-center leading-tight pt-28 mb-0">
                            Unlock the Future,<br />
                            One Bounty at a Time.
                        </h1>
                    </div>
                    <Dive className="mb-24 mt-0"/>
                    <BlueCard />
                </div>
            </div>
        </div>
  )
}

export default Home