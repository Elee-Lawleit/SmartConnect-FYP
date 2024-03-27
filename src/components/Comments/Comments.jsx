'use client';
import React, { useState, useRef } from 'react';
import { Send } from "lucide-react";

function CommentSection() {
  const [postComment, setPostComment] = useState('');
  const [postedContent, setPostedContent] = useState([]);
  const handlePost = () => {
    const newComment = { text:postComment };
    setPostedContent([...postedContent, newComment]);
    setPostComment('');
  };

  return (
<div className='w-full h-full'>
  <div className='w-full h-full border border-gray-100 flex p-2'>
      <div className="w-8 h-8 rounded-full overflow-hidden ml-2 mt-1
      ">
        <img
          src="/Images/landing-image.png"
          alt="Profile"
          className="w-full h-full object-cover"
        />
      </div>
      <textarea
            placeholder="post a comment"
            className=' w-full h-6 resize-none m-2 '
            value={postComment}
            onChange={(e) => setPostComment(e.target.value)}
          ></textarea>
          <Send className='text-green-700 mt-2' onClick={() => handlePost()}/>
          </div>
          <div className='w-full h-full justify-between items-center border border-gray-50'>
        <p className='bold text-sm text-center pt-1'>Comments</p>
        {postedContent.length === 0 ? ( <p className='ml-1 text-sm text-gray-500'>No Comments yet...</p>):(
            postedContent.map((content, index) => (
              <div key={index} className=''>
                 {content.text && (
                  <div className='w-full h-full  mt-2 flex'>
                    <div className="w-8 h-8 rounded-full overflow-hidden ml-1">
                    <img
                      src="/Images/landing-image.png"
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                    <p className="m-2">{content.text}</p>
                  </div>
                )}
                </div>
                 ))
        )}
    </div>
    </div>
  );
}

export default CommentSection;
