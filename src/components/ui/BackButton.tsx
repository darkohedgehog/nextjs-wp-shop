'use client'
import { useRouter } from 'next/navigation';
import { GiReturnArrow } from 'react-icons/gi';


const BackButton = () => {
    const router = useRouter();
  return (
    <div className='flex items-center justify-center mt-8'>
          <button
          type='button' 
          className='mt-8 bg-[#f8f9fa] hover:bg-[#dee2e6] cursor-pointer flex items-center px-4 py-2 rounded-3xl transition border-2 border-[#adb5bd] shadow-lg shadow-[#adb5bd] gap-2 text-[#007bff]'
        onClick={() => router.back()}>
          <span className='uppercase text-sm font-bold flex items-center justify-center gap-2'>
          <GiReturnArrow className='w-5 h-5' />
            Nazad
            </span>
        </button>  
          </div>
  )
}

export default BackButton;