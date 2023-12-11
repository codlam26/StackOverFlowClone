import React ,{useState, useEffect} from "react";
import axios from "axios";

function TagsForm({user, updatePage, editTag}){
    const [tags, setTags] = useState (editTag?.name.trim()||"");
    const [tagsList, setTagsList] = useState({});
    const [username, setUserName] = useState (user)
    const [tagError, setTagError] = useState(null);

    const handlePostTag = (event) => {
        event.preventDefault();
        const updatedTag = { name: tags.trim(), userId: user._id };
        axios.put(`http://localhost:8000/tags/editTag/${editTag._id}`, updatedTag)
            .then((response) => {
                if(response.data === "Error another user is using this tag"){
                    setTagError("Error another user is using this tag");
                    return;
                }
                if(response.data === "Error you are not the owner of this tag"){
                    setTagError("Error you are not the owner of this tag");
                    return;
                }
                fetchAllTags().then(() => {
                    updatePage('tagsList', tagsList);
                });
            })
            .catch(error => console.error('Error updating tag:', error));
        
        setTags('');
        setUserName('');
        setTagError(null);
    };
    
    const fetchAllTags = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/tags/byUser/${user._id}`);
            setTagsList(response.data);
        } catch (error) {
            console.error('Error fetching all tags:', error);
        }
    };
    
    useEffect(() => {
        fetchAllTags();
    }, []);

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