import React ,{useState} from "react";
import axios from "axios";

function TagsForm({user, updatePage, editTag}){
    const [tags, setTags] = useState (editTag?.name||"");
    const [username, setUserName] = useState (user)

    const handlePostTag = (event) => {
        event.preventDefault();

        const handleEditClick = async () => {
            const updatedTag = {name: tags, username};
              axios.put(`http://localhost:8000/answers/editTag/${editTag._id}`, updatedTag)
                .then(() => {
                  
            });
        }

        setTags('');
        setUserName('');
    }
    

    return(
        <form id="tag-form" onSubmit={handlePostTag}>
            <div>
            <label htmlFor="tags">Tags*</label>
            <br/>
            <p className="questionReq">Edit the Tag</p>
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
            {/* <div id="errorMessage" style={{color: 'red'}}>{tagError === null ? '' : tagError}</div> */}
        </form> 
);
}

export default TagsForm;