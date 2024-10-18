import React from 'react';

const Footer: React.FC = () => (
    <footer className='bg-gray-900 text-white py-8'>
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
                <h3 className='font-bold text-lg'>ClubLink</h3>
                <p className="text-gray-400 mt-2">Discover and manage your clubs in one place</p>
            </div>
            <div>
                <h4 className="font-medium">Quick Links</h4>
                <ul className='mt-4 space-y-2'>
                    <li><a href="#" className="hover:underline">About</a></li>
                    <li><a href="#" className="hover:underline">Contact</a></li>
                    <li><a href="#" className="hover:underline">Privacy Policy</a></li>
                </ul>
            </div>
            <div>
                <h4 className="font-medium">Stay Updated</h4>
                <form className="mt-4">
                    <input type="email" placeholder='Enter your email' className="w-full px-4 py-2 rounded bg-gray-800 border-none focus:outline-none" />
                    <button className='mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600'>Subscribe</button>
                </form>
            </div>
        </div>
        <div className='mt-8 text-center text-gray-500'>© 2024 Clublink. All rights reserved</div>
    </footer>
)

export default Footer