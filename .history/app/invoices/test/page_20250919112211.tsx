import React from 'react'

const test = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
      <div className="flex justify-center mb-4">
        {/* <img className="w-24 h-24 rounded-full border-4 border-blue-500 object-cover" 
         src="photo.jpg" alt="Profil"> */}
      </div>
      <div className="text-center ">
        <h2 className="text-xl font-bold text-gray-800">Alexandre Dupont</h2>
        <p className="text-gray-600 text-sm">Développeur Frontend</p>
      </div>
      <button className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">
        Suivre
      </button>
    </div>
  )
}

export default test
