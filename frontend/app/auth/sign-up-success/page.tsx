"use client"
import {CheckCircle2} from 'lucide-react'
import { useRouter } from 'next/navigation';

export default function signUpSuccess(){
    const router =useRouter()
    const handleGoToLogin = () => {
        router.push('/');
    }
    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-200 via-purple-200 to-blue-200 p-4">
            <div className=" absolute top-0 bg-gradient-to-r from-blue-500 via-purple-400 to-blue-500 w-full h-fit p-6 md:p-8 shadow-lg">
                <h1 className=" text-white text-center text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">OTP Verified Successfully!</h1>
            </div>
            <div className='flex flex-col md:flex-row justify-center items-center gap-8 md:gap-12 w-full max-w-4xl'>
                <CheckCircle2 className='text-blue-500 h-32 w-32 md:h-64 md:w-64'
                    strokeWidth={2}/>
                <div className='flex flex-col justify-center items-center md:items-start gap-6'>
                    <p className="text-2xl md:text-3xl font-semibold text-gray-700">Verification Complete</p>
                    <button onClick={handleGoToLogin} className='bg-purple-300 rounded-lg outline-none text-gray-700 p-2 md:p-4 w-full
                        transition duration-300 hover:bg-purple-500 hover:ring-2 hover:ring-offset-2 hover:ring-blue-500'
                    >Continue</button>
                </div>
                
            </div>
        </div>
    );
}