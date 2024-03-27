'use client'
import { useState } from 'react';
import CreateGroupModal from './CreateGroupModal';
import JoinGroup from './JoinGroups';
import { Plus } from 'lucide-react';

function CreateGroup(){
   
    const [isModalOpen, setModalOpen] = useState(false);
    const [groups, setGroups] = useState([]);
  
    const addGroup = (groupData) => {
      setGroups([...groups, groupData]);
      setModalOpen(false);
    };
    
  
    return (
      <div className=" items-center justify-center ">
         <div className="md:flex tbb:flex tb:flex shadow-sm h-50 md:w-[550px] ml-2 mr-2 tb:ml-28 tb:h-36 tb:pr-2 tbbb:h-24 tbb:ml-28 tbb:h-24 tbb:pr-2 md:ml-[170px] mdd:ml-[400px] xl:ml-[400px] space-x-4 border border-gray-100 rounded-lg pt-3 pl-8">
         <Plus className='mt-4 text-green-300 tb:mt-9 tb:-ml-3 tbb:mt-6 tbbb:mt-6'  />
          <div className='pl-2 tb:pl-0'>
        <p className='text-lg  text-[#10676B] -mt-7 ml-3 tb:mt-2 tb:ml-0'>Create new Group</p>
        <p className='text-gray-300 ml-3 md:mr-20 tb:ml-0 tbbb:pr-9 tbb:mr-32'>create public or private group</p></div>
        <div className='m-3 tb:mt-7 tbb:mt-3 tbbb:mt-3'>
        <button
         className=" text-white rounded bg-gradient-to-r  from-[#95EEE0] to-[#2EC7AB] hover:from-[#2EC7AB] hover:to-[#349E8D] h-10 w-20 transition duration-200 mt-2 "
          onClick={() => setModalOpen(true)}
        >
          Create
        </button></div>
        </div>
        <JoinGroup/>

        {isModalOpen && <CreateGroupModal onClose={() => setModalOpen(false)} onAddGroup={addGroup} />}
        <div className="mt-10 w-full max-w-3xl ml-72">
          {groups.map((group, index) => (
            <div key={index} className="bg-white shadow-lg rounded-lg p-6 mb-4">
              <h3 className="text-xl font-semibold">{group.name}</h3>
              <p className="text-gray-700">{group.description}</p>
              <p className="text-gray-500">{group.privacy}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

export default CreateGroup;