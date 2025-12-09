import React from 'react'


const InputForm = ({value, key, type, isSelected}) => {

  return (
    <div
      className={`cursor-pointer p-4 border-2 rounded-lg ${isSelected ? 'border-black bg-blue-100 text-black' : 'border-gray-300'} flex items-center space-x-2`} >
      <div className={`w-4 h-4 rounded-full border-2 ${isSelected ? 'bg-black' : 'border-gray-300'}`}/>
      <label htmlFor={key} className="cursor-pointer">
        {value}
      </label>
      <input
        id={key}
        type={type}
        className="hidden"
      />
    </div>
  )
}

export default InputForm