import React, {useState, useEffect } from "react";
import axios from "axios";

function TagsList({newTags, updatePage, answerPage, isAuthQ, user}){
    const [tags, setTags] = useState(newTags);
    const [questionCounts, setQuestionCounts] = useState({});
    const [questions, setquestions] = useState({});

    const handleDeleteClick = async (tagId) => {
        try{
            console.log("New Tags prop in TagsList:", tags)
            const response = await axios.delete(`http://localhost:8000/tags/deleteTag/${tagId}?userId=${user.userId}`);
            if(response.data.success){
                const updatedTagList = tags.filter((tag) => tag._id !== tagId);
                setTags(updatedTagList);
            }
            else if(response.data === 'Error: Unauthorized to delete the tag'){
                alert('Error: Unauthorized to delete the tag');
                return;
            }
            else if(response.data === 'Error: Another user is using this tag'){
                alert('Error: Another user is using this tag');
                return;
            }
        }    
        catch(err){
            console.error('Error deleting tag:', err);
            if (err.response) {
            } else {
              alert('Error deleting tag');
            }
        }   
    }

    useEffect(() => {
        const fetchQuestionsCount = async () => {
            const counts = await Promise.all(newTags.map(async (tag) => {
                const response = await axios.get(`http://localhost:8000/tag_id/${tag._id}/questions`);
                return { [tag._id]: response.data.length };
            }));
            
            setQuestionCounts(counts.reduce((acc, curr) => ({ ...acc, ...curr }), {}));
        };

        fetchQuestionsCount();
    }, [tags]);


    const handleClick = async (tagId) => {
        try {
          const response = await axios.get(`http://localhost:8000/tag_id/${tagId}/questions`);
          const updatedQuestions = { ...questions };
    
          response.data.forEach((question) => {
            updatedQuestions[question._id] = question;
          });
          setquestions(updatedQuestions);
          updatePage("questionList", response.data);
        } catch (error) {
          console.error('Error fetching questions for tag:', error);
        }
      };    

    return(
        <div className="tagsPage">
            <div className="flex-container">
                <h2 id="tagsHeader">{newTags.length} Tags</h2>
                <h1>All Tags</h1>
                {isAuthQ ? (<button id="askQuestionButtonTag" onClick = {() => {answerPage("questionForm")}}>Ask Question</button>) : <div></div>}
            </div>

            <div id="tagList" className="tag-container">
                
                {tags.length !== 0 ? (tags.map((tagEntry) => (
                     <div className="tagBox" key={tagEntry._id}>
                        <button className="link-style-button" onClick={() => {handleClick(tagEntry._id)}}>
                        {tagEntry.name}
                </button>
                <div>{questionCounts[tagEntry._id]} Questions </div>
            
                {(tagEntry.created_by === (user ? user.userId : null) && isAuthQ) && 
                    (<div>
                        <button className='editButton' onClick={() => updatePage('tagsForm', null, tagEntry)}>Edit</button>
                        <button className='deleteButton' onClick={() => {handleDeleteClick(tagEntry._id)}}>Delete</button>
                    </div>)
                }
             </div>
                    
                ))) : 
                <h1>No Tags Found</h1>}
            </div>  
        </div>
    );
}

export default TagsList;