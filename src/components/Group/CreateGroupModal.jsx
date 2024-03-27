function CreateGroupModal({ onClose, onAddGroup }) {
    const handleSubmit = (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const groupData = {
        name: formData.get('groupName'),
        description: formData.get('groupDescription'),
        privacy: formData.get('privacy'),
      };
      onAddGroup(groupData);
    };
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4">Create a New Group</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="groupName">Group Name</label>
              <input id="groupName" name="groupName" type="text" className="form-input w-full" required />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="groupDescription">Description</label>
              <textarea id="groupDescription" name="groupDescription" className="form-textarea w-full" rows="3" required></textarea>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Privacy</label>
              <div className="flex gap-4">
                <div>
                  <input id="public" type="radio" name="privacy" value="Public" defaultChecked />
                  <label htmlFor="public" className="ml-2">Public</label>
                </div>
                <div>
                  <input id="private" type="radio" name="privacy" value="Private" />
                  <label htmlFor="private" className="ml-2">Private</label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <button type="button" className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={onClose}>Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Create</button>
            </div>
          </form>
        </div>
      </div>
    );
  }
  export default CreateGroupModal;