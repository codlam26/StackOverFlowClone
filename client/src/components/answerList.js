import React, {useState} from "react";
import Model from "../models/model";

const model = new Model;
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
function AnswerList({question, answers, displayForm, onAskQuestion}){
    return(
        <div className="answer-list" style={{display: displayForm ? 'block' : 'none'}}>
            <div className ="answerHeader">
                <div className="flex-container">
                    <div className="right-column2"></div>
                        <div><h4>{answers.length} answers</h4></div>
                

                <div className="middle-column">
                    <div><h2>{question.title}</h2></div>
                </div>

                <div className="left-column2">
                    <button id="askQuestionButtonForm" onClick={() => onAskQuestion('questionForm')}>Ask Question</button>
                </div>
                </div>
            

            <div className="flex-container">
                <div className="left-column2">
                    <div>{question.views} views</div>
                </div>

                <div className="middle-column">
                    <div><p>{question.text}</p></div>
                </div>

                <div className="right-column2">
                    <div className="question_metadata">
                        <span className="askedBy">
                            {question.askedBy}
                        </span> asked {formatQuestionDate(question.askDate)}
                    </div>
                </div>
            </div>
            </div>
            {console.log(answers)}
            {answers.map((answerEntry) => (
                <div key={answerEntry.aid} className="answer-entry">
                    <div className="middle-column">
                        <div>
                            {answerEntry.text}
                        </div>
                    </div>

                    <div className="right-column2">
                        <div className="question_metadata">
                            <span className="answeredBy">
                                {answerEntry.ansBy}
                            </span> answered {formatQuestionDate(answerEntry.ansDate)}
                        </div>
                    </div>
                </div>
            ))}
            
            <button id="answerQuestionButton" onClick={() => {onAskQuestion("answerForm", question)}}>Answer Question</button>
        </div>
    );
}
export default AnswerList;