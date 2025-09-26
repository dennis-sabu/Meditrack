import Image from 'next/image'
import React from 'react'

const Logo = ({text, white}:{text:boolean, white:boolean}) => {
  return (
    <div className='text-3xl font-bold flex items-center gap-2'>
          <Image src="/meditrackdoc.png" alt="alt" className="w-15 h-15" width={600} height={400} />
            {text && <span className={`text-2xl ${white ? 'text-white' : 'text-black'}`}>MediTrack</span>}
    </div> 
  )
}

export default Logo