import React, {useState, useEffect } from "react";
import axios from "axios";

function TagsList({newTags, updatePage, answerPage, isAuthQ, user}){
    const [tags, setTags] = useState(newTags);
    const [questionCounts, setQuestionCounts] = useState({});
    const [questions, setquestions] = useState({});

    console.log(newTags);

    // useEffect(() => {
    //     axios.get('http://localhost:8000/questions/newest/').then((response) =>{
    //     setquestions(response.data.reduce((acc, question) => {
    //         acc[question._id] = question;
    //         return acc;
    //     }, {}));
    // })
    // },[])

    // useEffect(() => {
    //     QuestionCounts(tags);
    // },[tags])

    useEffect(() => {
        const fetchQuestionsCount = async () => {
            const counts = await Promise.all(newTags.map(async (tag) => {
                const response = await axios.get(`http://localhost:8000/tag_id/${tag._id}/questions`);
                return { [tag._id]: response.data.length };
            }));
            
            setQuestionCounts(counts.reduce((acc, curr) => ({ ...acc, ...curr }), {}));
        };

        fetchQuestionsCount();
    }, [newTags]);


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
      
      const handleDeleteClick = async (tagId) => {
        try{
            const response = await axios.delete(`http://localhost:8000/tags/deleteTag/${tagId}?userId=${user._id}`);
            if(response.data === 'success'){
                const updatedTagList = tags.filter((tag) => tag._id !== tagId);
                setTags(updatedTagList);
                console.log(response.data);
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
              // Handle errors sent back from the server
              alert(err.response.data.message);
            } else {
              alert('Error deleting tag');
            }
        }   
        
    }

    return(
        <div className="tagsPage">
            <div className="flex-container">
                <h2 id="tagsHeader">{newTags.length} Tags</h2>
                <h1>All Tags</h1>
                {isAuthQ ? (<button id="askQuestionButtonTag" onClick = {() => {answerPage("questionForm")}}>Ask Question</button>) : <div></div>}
            </div>

            <div id="tagList" className="tag-container">
                
                {newTags.map((tagEntry) =>
                     <div className="tagBox" key={tagEntry._id}>
                        <button className="link-style-button" onClick={() => {handleClick(tagEntry._id)}}>
                        {tagEntry.name}
                </button>
                <div>{questionCounts[tagEntry._id]} Questions </div>
            
                {(tagEntry.created_by === user._id || user.isAdmin ) && 
                    (<div>
                        <button className='editButton' onClick={() => updatePage('tagsForm', tags, tagEntry)}>Edit</button>
                        <button className='deleteButton' onClick={() => {handleDeleteClick(tagEntry._id)}}>Delete</button>
                    </div>)
                }
                
             </div>
                    
                )}
            </div>  
        </div>
    );
}

export default TagsList;