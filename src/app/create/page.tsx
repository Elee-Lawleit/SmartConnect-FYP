"use client"
import React, { useState, useRef, useEffect } from "react"
import Layoutpage from "@/components/Navbar/Layout"
import CommentSection from "@/components/Comments/Comments"
import {
  Image,
  MoreVertical,
  Heart,
  MessageCircle,
  Bookmark,
  Repeat,
  Files,
  Trash2,
  ChevronLeftCircle,
  ChevronRightCircle,
} from "lucide-react"

function Create() {
  const [files, setFiles] = useState([])
  const [filePreviews, setFilePreviews] = useState([])
  const fileInputRef = useRef(null)
  const [postText, setPostText] = useState("")
  const [postedContent, setPostedContent] = useState([])
  const [profilePhoto, setProfilePhoto] = useState("")

  useEffect(() => {
    const savedProfilePhoto = localStorage.getItem("profilePhoto")
    if (savedProfilePhoto) {
      setProfilePhoto(savedProfilePhoto)
    }
  }, [])

  const handleSlideChange = (postId, direction) => {
    setPostedContent((currentPosts) =>
      currentPosts.map((post) => {
        if (post.id === postId) {
          let newSlide = post.currentSlide
          if (direction === "next") {
            newSlide = (newSlide + 1) % post.files.length // Loop back to the first slide after the last
          } else if (direction === "prev") {
            newSlide = (newSlide - 1 + post.files.length) % post.files.length // Loop to the last slide if going back from the first
          }
          return { ...post, currentSlide: newSlide }
        }
        return post
      })
    )
  }
  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files)
    const newFilePreviews = newFiles.map((file) => URL.createObjectURL(file))

    setFiles((prev) => [...prev, ...newFiles])
    setFilePreviews((prev) => [...prev, ...newFilePreviews])
  }

  const triggerFileInput = () => {
    fileInputRef.current.click()
  }

  const handleRemoveFile = (indexToRemove) => {
    setFiles(files.filter((_, index) => index !== indexToRemove))
    setFilePreviews(filePreviews.filter((_, index) => index !== indexToRemove))
  }

  const handlePost = (asNFT = false) => {
    if (asNFT && !file && !postText.trim()) {
      alert("Failed to post,select an image/video to post as NFT.")
      return
    }
    const newPosts = {
      id: Date.now(),
      text: postText,
      files: filePreviews,
      asNFT,
      currentSlide: 0,
    }
    // const newPosts = files.map((file, index) => ({
    //   id: Date.now(),
    //   text: postText,
    //   file: filePreviews[index],
    //   type: file ? file.type : "",
    //   asNFT,
    //   currentSlide: 0,
    // }));

    setPostedContent(postedContent.concat(newPosts))
    setPostText("")
    setFiles([])
    setFilePreviews([])
  }

  return (
    <Layoutpage>
      <div className="flex flex-col items-center justify-center -mt-4 pl-5 pr-5 md:pl-[200px] md:pr-[200px] tb:pl-32 tbb:pl-[300px] tbb:pr-[250px]">
        <div className="w-[270px] sbb:w-[300px] tb:w-[300px] tbb:w-[400px] md:w-[500px] lg:w-[600px] max-w-2xl bg-white rounded-lg shadow p-4">
          <div className="flex space-x-2 overflow-auto">
            {filePreviews.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="h-24 w-24 object-cover"
                />
                <Trash2
                  className="absolute top-0 right-0 text-red-500  p-1"
                  onClick={() => handleRemoveFile(index)}
                />
              </div>
            ))}
          </div>
          <textarea
            placeholder="Share your thoughts..."
            className="w-full border rounded-lg p-4 h-16 resize-none mt-3"
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
          ></textarea>
          <div className="flex justify-between items-center mt-4">
            <Image
              onClick={triggerFileInput}
              className="text-green-500 cursor-pointer"
            />
            <div>
              <button
                onClick={() => handlePost()}
                className="bg-gradient-to-r  bg-[#349E8D] hover:from-[#2EC7AB] hover:to-[#349E8D] px-4 py-2  text-white rounded transition duration-200 mr-2"
              >
                Post
              </button>
              <button
                onClick={() => handlePost(true)}
                className="bg-gradient-to-r  from-blue-500 to-purple-500 hover:from-purple-500 hover:to-blue-500 text-white px-4 py-2 rounded transition duration-200"
              >
                Post as NFT
              </button>
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            multiple
            className="hidden"
            accept="image/*, video/*"
            onChange={handleFileChange}
          />
        </div>
        {postedContent.map((content, index) => (
          <div
            key={index}
            className="w-[270px] sbb:w-[300px] tb:w-[300px] tbb:w-[400px] md:w-[500px] lg:w-[600px] rounded-lg shadow p-2 mt-4 flex flex-col items-center mb-2"
          >
            <div className="shadow-sm h-20 w-full">
              <div className="w-16 h-16 rounded-full overflow-hidden ml-3">
                <img
                  src={profilePhoto || "/Images/landing-image.png"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="ml-[90px] -mt-14 mr-8">
                <h4 className="text-1xl text-gray-800">Angela</h4>
                <p className="text-sm text-gray-700">2 min ago</p>
              </div>
              <div className="ml-[220px] sb:ml-[220px] sbb:ml-[250px] tb:ml-[250px] tbb:ml-[340px] md:ml-[430px] lg:ml-[540px] -mt-10">
                <MoreVertical />
              </div>
            </div>
            {content.files.map((file, fileIndex) => (
              <img
                key={fileIndex}
                src={file}
                alt={`Slide ${fileIndex}`}
                className={`w-full object-cover ${
                  fileIndex === content.currentSlide ? "block" : "hidden"
                }`}
                style={{ height: "500px" }}
              />
            ))}
            {content.files.length > 1 && (
              <>
                <button
                  onClick={() => handleSlideChange(content.id, "prev")}
                  className="absolute top-[700px] mr-[500px] transform bg-black bg-opacity-50 text-white p-1 rounded-full"
                >
                  <ChevronLeftCircle size="24" />
                </button>
                <button
                  onClick={() => handleSlideChange(content.id, "next")}
                  className="absolute top-[700px] -mr-[500px] transform bg-black bg-opacity-50 text-white p-1 rounded-full"
                >
                  <ChevronRightCircle size="24" />
                </button>
              </>
            )}

            {content.asNFT && (
              <span className="mt-2 px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-sm">
                NFT
              </span>
            )}

            {content.text && (
              <div className="w-full h-full border border-gray-50 mt-2 ">
                <p className="mt-2">{content.text}</p>
              </div>
            )}
            <div className="w-full mt-2 ml-4 mb-2">
              <div className="flex flex-row space-x-5 text-green-700">
                <div className="flex space-x-2">
                  <Heart />
                  <p>0</p>
                </div>
                <div className="flex space-x-2">
                  <MessageCircle />
                  <p>0</p>
                  <p className="hidden  md:block mdd:block xl:block">
                    Comment(s)
                  </p>
                </div>
              </div>
              <div className="ml-[220px] sb:ml-[220px] sbb:ml-[250px] tb:ml-[250px] tbb:ml-[250px] md:ml-[350px] lg:ml-[450px] -mt-6 text-green-700">
                <div className="flex space-x-2">
                  <p className="hidden  md:block mdd:block xl:block">
                    Share post
                  </p>
                  <Repeat />
                </div>
              </div>
            </div>
            <CommentSection />
          </div>
        ))}
      </div>
    </Layoutpage>
  )
}

export default Create
