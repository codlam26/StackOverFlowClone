import React, {useState, useEffect } from "react";
import axios from "axios";

function TagsList({newTags, updatePage, answerPage, isAuthQ, user, editTag}){
    const [tags, setTags] = useState([]);
    const [questionCounts, setQuestionCounts] = useState({});
    const [questions, setquestions] = useState({});

    useEffect(() => {
        axios.get('http://localhost:8000/questions/newest/').then((response) =>{
        setquestions(response.data.reduce((acc, question) => {
            acc[question._id] = question;
            return acc;
        }, {}));
    })
    },[])

    useEffect(() => {
        axios.get('http://localhost:8000/api/tags/').then((response) =>{
        setTags(response.data);
        QuestionCounts(response.data);
    })
    },[])

    const QuestionCounts = (tags) => {
        const tagIds = tags.map((tag)=> tag._id);
        
        tagIds.forEach((tagId) => {
            axios.get(`http://localhost:8000/tag_id/${tagId}/questions`).then((response) => {
                setquestions((prevQuestions) => {
                    const updatedQuestions = {...prevQuestions};

                    response.data.forEach((question) => {
                        updatedQuestions[question._id] = question;
                    });
                    return updatedQuestions;
                });
                setQuestionCounts((prevCounts) => ({
                    ...prevCounts,
                    [tagId]: response.data.length,
                }));
            });
        });
    };

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
        axios.delete(`http://localhost:8000/tags/deleteTag/${tagId}`).then(async (response) => {
            if(response.data === 'success'){
                const updatedTagList = tags.filter((tag) => tag._id !== tagId);
                setTags(updatedTagList); 
            }
        })
    }

    return(
        <div className="tagsPage">
            <div className="flex-container">
                <h2 id="tagsHeader">{tags.length} Tags</h2>
                <h1>All Tags</h1>
                {isAuthQ ? (<button id="askQuestionButtonTag" onClick = {() => {answerPage("questionForm")}}>Ask Question</button>) : <div></div>}
            </div>

            <div id="tagList" className="tag-container">
                
                {tags.map((tagEntry) =>
                     <div className="tagBox" key={tagEntry._id}>
                        <button className="link-style-button" onClick={() => {handleClick(tagEntry._id)}}>
                        {tagEntry.name}
                </button>
                <div>{questionCounts[tagEntry._id]} Questions </div>
                {tagEntry.created_by === user || user.isAdmin && 
                    (<div>
                        <button className='editButton' onClick={() => updatePage('tagsForm', null, tagEntry)}>Edit</button>
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