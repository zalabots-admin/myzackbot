
import { useState } from 'react';

function ZackBot() {

    const [menuOpen, setMenuOpen] = useState(false);

    return (

        <div className="min-h-dvh w-full overflow-hidden">
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 py-3 bg-white shadow-md w-full lg:h-[100px]">
                <div className="text-xl"><a href="/"><span className="font-bold">ZALA</span>BOTS</a></div>

                {/* Hamburger button - visible on mobile */}
                <button
                className="sm:hidden p-2 focus:outline-none"
                onClick={() => setMenuOpen(!menuOpen)}
                >
                {/* Simple hamburger icon */}
                <div className="w-6 h-0.5 bg-black mb-1"></div>
                <div className="w-6 h-0.5 bg-black mb-1"></div>
                <div className="w-6 h-0.5 bg-black"></div>
                </button>

                {/* Menu links - visible on larger screens */}
                <div className="hidden sm:flex space-x-6">
                <a href="#home" className="hover:text-gray-700">Home</a>
                <a href="#bots" className="hover:text-gray-700">Meet the Bots</a>
                <a href="/contactus" className="hover:text-gray-700">Contact Us</a>
                </div>
            </div>
            {/* Rest of the page */}
            <div id="main" className="flex flex-col items-center overflow-y-auto h-[calc(100vh-50px)] lg:h-[calc(100vh-100px)] scroll-smooth">
            </div>
        </div>

    );

}

export default ZackBot;