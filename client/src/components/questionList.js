import React, {useState, useEffect} from "react";
import axios from "axios";

function formatQuestionDate(askDate){
    const months = ['January' , 'February', 'March', 'April', 'May', 'June',
         'July', 'August', 'September', 'October', 'November', 'December'];
        const currentDate = new Date();
        
        const SecDiff = currentDate.getSeconds() - askDate.getSeconds();
        const MinDiff = currentDate.getMinutes() - askDate.getMinutes();
        const HourDiff = askDate.getHours()  - currentDate.getHours();
    
        if(MinDiff <= 0 && currentDate.getDate() === askDate.getDate()
        && askDate.getFullYear() === currentDate.getFullYear() && askDate.getMonth() === currentDate.getMonth()){
          return  `${SecDiff} secs ago`;
        }
        else if(HourDiff <= 0 && currentDate.getDate() === askDate.getDate()
        && askDate.getFullYear() === currentDate.getFullYear() && askDate.getMonth() === currentDate.getMonth()){
          return `${MinDiff} mins ago`
        }
        else if(HourDiff < 24 && askDate.getFullYear() === currentDate.getFullYear() && askDate.getMonth() === currentDate.getMonth()){
          return `${HourDiff} hours ago`
        }
        else if(HourDiff > 24 ){
          const month = months[askDate.getMonth()];
          const day = askDate.getDate();
          var hours = askDate.getHours();
          var min = askDate.getMinutes();
          if(min < 10){
            min = '0' + min;
          }
          if(hours < 10){
            hours = '0' + hours;
          }
          return `${month} ${day} at ${hours}:${min}`
        }
        
        else{
          const year = askDate.getFullYear();
          const month = months[askDate.getMonth()];
          const day = askDate.getDate();
          var hours2 = askDate.getHours();
          var min2 = askDate.getMinutes();
          if(min2 < 10){
            min2 = '0' + min2;
          }
          if(hours2 < 10){
            hours2 = '0' + hours2;
          }
          return `${month} ${day}, ${year} at ${hours2}:${min2}`
        }
}

function QuestionList(){
    const [questions, setQuestions] = useState([]);
    useEffect(() =>{
        axios.get('https//localhost:8000/api/questions/').then((response) =>{
        setQuestions(response.data);
    })
    }, []);
    
    return(
        <div>
            <div className="flex-container">
              <div><h2>All Questions</h2></div>
                <div><button id="askQuestionButton">Ask Question</button></div>
            </div>

            <div className="flex-container">
              
                  <div className="sortingButtons">
                    <button>Newest</button>
                    
                    <button>Active</button>
                    
                    <button>Unanswered</button>
                  </div>
              </div>

        <div className="question-list" >
              {questions.length > 0 ? (
              questions.map((questionEntry)=> (
          <div className="question-entry" key={questionEntry.qid}>

          <div className="right-column2">
                <div className="question_stats">{questionEntry.views} views </div>
                <div className="question_stats">{questionEntry.ansIds.length} answers </div>
          </div>
    
          <div className="middle-column">
            <div className= "question_title"> <a 
            className="answersLink" 
            href="#"id= {questions.qid} 
            key={questions.qid}
            >{questionEntry.title}</a></div>
            
            <div>
              Tag
            </div>
          </div>
          
          <div className="left-column2">
            <div className = "question_metadata">
              <span className ="askedBy">
              {questionEntry.askedBy}</span> asked {formatQuestionDate(questionEntry.askDate)}
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