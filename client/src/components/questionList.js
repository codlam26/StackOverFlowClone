import React, {useState, useEffect} from "react";
import axios from "axios";


function formatQuestionDate(askDate2){
    const months = ['January' , 'February', 'March', 'April', 'May', 'June',
         'July', 'August', 'September', 'October', 'November', 'December'];
         const currentDate = new Date();
         const askDate = new Date(askDate2);
       
         const timeDifference = Math.floor((currentDate - askDate) / 1000);
       
         if (timeDifference < 60) {
           return `${timeDifference} second${timeDifference > 1 ? 's' : ''} ago`;
         } 
         else if (timeDifference < 3600) {
           const minutes = Math.floor(timeDifference / 60);
           return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
         } 
         else if (timeDifference < (3600 * 24)) {
           const hours = Math.floor(timeDifference / 3600);
           return `${hours} hour${hours > 1 ? 's' : ''} ago`;
         } 
         else if (timeDifference < (3600 * 24 * 60)) {
           const day = askDate.getDate();
           const hours = askDate.getHours().toString().padStart(2, '0');
           const minutes = askDate.getMinutes().toString().padStart(2, '0');
           return `on ${months[askDate.getMonth()]} ${day} at ${hours}:${minutes}`;
         } else {
           const year = askDate.getFullYear();
           const month = months[askDate.getMonth()];
           const day = askDate.getDate();
           const hours = askDate.getHours().toString().padStart(2, '0');
           const minutes = askDate.getMinutes().toString().padStart(2, '0');
           return `${month} ${day}, ${year} at ${hours}:${minutes}`;
         }
       }

function QuestionList({Questions, updatePage, answerPage}){
    const [activeButton, setActiveButton] = useState('');
    const [tags, setTags] = useState([]);

    useEffect(() => {
      const fetchData = async () => {
        let response;
        if (activeButton === 'newest') {
          response = await axios.get('http://localhost:8000/questions/newest');
        }
        else if(activeButton === 'active'){
          response = await axios.get('http://localhost:8000/questions/active')
        } 
        else if (activeButton === 'unanswered') {
          response = await axios.get('http://localhost:8000/questions/unanswered');
        }
        if (response) {
          updatePage('questionList', response.data);
        }
      };

      const findTags = async () => {
        try{
          const tags = await axios.get(`http://localhost:8000/api/tags`)
          setTags(tags.data);
         }
         catch(error){
          console.error(error);
         }
      }
      fetchData();
      findTags();
    }, [activeButton, updatePage]);

    const getTagNames = (tagIds) => {
      return tagIds.map((tagId) => {
        const tag = tags.find((t) => t._id === tagId);
        return tag ? tag.name: ''
      });
    };

    return(
        <div>
            <div className="flex-container">
              <div><h2>All Questions</h2></div>
                <div><button id="askQuestionButton" onClick={() => {answerPage("questionForm", Questions)}}>Ask Question</button></div>
            </div>

            <div className="flex-container">
                <div id="question-counter"><h2>{Questions.length} Questions</h2></div>
                  <div className="sortingButtons">
                    <button onClick={() => setActiveButton('newest')}
                    className={activeButton === 'newest' ? 'activeButton2' : 'noneActiveButton'}>Newest</button>
                    
                    <button onClick={() => setActiveButton('active')}
                    className={activeButton === 'active' ? 'activeButton2' : 'noneActiveButton'}>Active</button>
                    
                    <button onClick= {() => setActiveButton('unanswered')}
                    className={activeButton === 'unanswered' ? 'activeunansweredButton' : 'unactiveunansweredButton'}>Unanswered</button>
                  </div>
              </div>

        <div className="question-list" >
              {Questions.length > 0 ? (
              Questions.map((questionEntry)=> (
          <div className="question-entry" key={questionEntry._id}>

          <div className="right-column2">
                <div className="question_stats">{questionEntry.views} views </div>
                <div className="question_stats">{questionEntry.answers.length} answers </div>
          </div>
    
          <div className="middle-column">
            <div className= "question_title"> <button 
            className="answersLink" 
            id= {questionEntry._id} 
            key={questionEntry._id}
            onClick = {async () => {await axios.patch('http://localhost:8000/questions/incrementViews/' + questionEntry._id);
            answerPage("answerList", questionEntry._id)
          }}
            >{questionEntry.title}</button></div>
            <div>
              {getTagNames(questionEntry.tags).map((tagName, index) => (
                  <span key={index} className="tag">{tagName}</span>
              ))}
            </div>
          </div>
          
          <div className="left-column2">
            <div className = "question_metadata">
              <span className ="askedBy">
              {questionEntry.asked_by}</span> asked {formatQuestionDate(questionEntry.ask_date_time)}
            </div>  
          </div>

          </div>
              ))
              ) : (
                  <div id="noQuestions">
                      <h1 className="noQuestionHeading">No Questions Found</h1>
                  </div>
              )}
          </div>
        </div>
    );
}

export default QuestionList;