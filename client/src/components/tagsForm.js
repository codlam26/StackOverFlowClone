import React ,{useState} from "react";
import axios from "axios";

function TagsForm({user, updatePage, editTag, userId}){
    const [tags, setTags] = useState (editTag?.name||"");
    const [username, setUserName] = useState (user.userId)
    const [tagError, setTagError] = useState(null);
    
    const handlePostTag = async (event) => {
        event.preventDefault();
        const updatedTag = { name: tags, userId: username};
        await axios.put(`http://localhost:8000/tags/editTag/${editTag._id}`, updatedTag)
            .then((response) => {
                if(response.data === "Error another user is using this tag"){
                    setTagError("Error another user is using this tag");
                    return;
                }
                if(response.data === "Error you are not the owner of this tag"){
                    setTagError("Error you are not the owner of this tag");
                    return;
                }
                else{
                    setTags('');
                    setUserName('');
                    setTagError(null);
                }
            }).then(() => {
                axios.get(`http://localhost:8000/tags/byUser/${userId}`).then((response) => {
                    updatePage('tagsList', response.data);
                })
            })
    };

    return(
        <form id="tag-form" onSubmit={handlePostTag}>
            <div>
            <label htmlFor="tags">Tags*</label>
            <br/>
            <p className="questionReq">Edit the Tag </p>
            <input 
                type="text" 
                id="tags" 
                name="tags" 
                maxLength={50}
                value={tags}
                onChange={(e)=> setTags(e.target.value)}
                />
            <br/>
            </div>

            <div className="flex-container">
                <button type="submit" id="postAnswer" 
                >Post Tag</button>
                <p className="mandatoryField">*indicates mandatory fields</p>
                </div>
            <div id="errorMessage" style={{color: 'red'}}>{tagError === null ? '' : tagError}</div>
        </form> 
);
}

export default TagsForm;