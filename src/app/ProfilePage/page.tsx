"use client"
import React, { useState, useRef, ChangeEvent } from "react"
import Layoutpage from "@/components/Navbar/Layout"
import { Camera, Pencil } from "lucide-react"

function Profile() {
  const [coverPhoto, setCoverPhoto] = useState(null)
  const [profilePhoto, setProfilePhoto] = useState(null)
  const coverPhotoInputRef = useRef(null)
  const profilePhotoInputRef = useRef(null)

  const handleCoverPhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0]
      if (file) {
        setCoverPhoto(URL.createObjectURL(file))
      }
    }
  }
  const handleProfilePhotoChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      const fileURL = URL.createObjectURL(file)
      setProfilePhoto(fileURL)
      localStorage.setItem("profilePhoto", fileURL)
    }
  }

  const triggerFileInput = (inputRef) => {
    if (inputRef && inputRef.current) {
      inputRef.current.click()
    }
  }

  return (
    <Layoutpage>
      <div className="bg-white -mt-6 pt-0 p-4 pl-2 tb:pl-32 pr-3 md:pl-64 md:pr-20">
        <div className="w-full h-72 rounded-md  relative bg-gray-100">
          {coverPhoto && (
            <img
              src={coverPhoto}
              alt="Cover"
              className="w-full h-72 object-cover rounded-md"
            />
          )}
          <div className="absolute right-0 bottom-0 p-1 border-4 border-white rounded-full bg-gray-50">
            <Camera
              className="cursor-pointer"
              onClick={() => triggerFileInput(coverPhotoInputRef)}
            />
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverPhotoChange}
            ref={coverPhotoInputRef}
            className="hidden"
          />
        </div>

        <div className="w-32 h-32 bg-gray-100 rounded-full ml-8 -mt-16 border-4 border-white relative">
          {profilePhoto && (
            <img
              src={profilePhoto}
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
            />
          )}
          <div className="absolute right-0 bottom-0 p-1 border-4 border-white rounded-full bg-gray-50">
            <Pencil
              className="cursor-pointer"
              onClick={() => triggerFileInput(profilePhotoInputRef)}
            />
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleProfilePhotoChange}
            ref={profilePhotoInputRef}
            className="hidden"
          />
        </div>
        <div className="-mt-14">
          <h2 className="text-xl font-bold ml-40">John Doe</h2>
          <p className="text-gray-500 ml-40">@john_doe</p>
          <p className="text-sm text-gray-700 mt-2 ml-32">
            Software Developer | React Enthusiast
          </p>
        </div>
      </div>
    </Layoutpage>
  )
}

export default Profile
