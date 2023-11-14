import React, {useState, useEffect} from 'react'
import axios from 'axios';

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

function AnswerList({updatePage, question_id}){
    const [answers, setAnswers] = useState([]);
    const [question, setquestion] = useState([]);

    useEffect(()=>{
        axios.get(`http://localhost:8000/api/answers/${question_id}`).then((res) => {
            setAnswers(res.data);
        });
    }, [question_id])

    useEffect(()=>{
        axios.get(`http://localhost:8000/api/questions/${question_id}`).then((res) => {
            setquestion(res.data);
        });
    }, [question_id])

    const renderTextWithHyperlinks = (text) => {
        return text.split(/(\[.*?\]\(.*?\))/g).map((part, index) => {
            const match = /\[([^\]]+)]\((https?:\/\/[^)]+)\)/.exec(part);
            return match ? <a key={index} href={match[2]} target="_blank" rel="noopener noreferrer">{match[1]}</a> : part;
        });
    };
    
    return(
        
        <div className="answer-list">
            <div className ="answerHeader">
                <div className="flex-container">
                    <div className="right-column2"></div>
                        <div><h4>{answers.length} answers</h4></div>
                

                <div className="middle-column">
                    <div><h2>{question.title}</h2></div>
                </div>

                <div className="left-column2">
                    <button id="askQuestionButtonForm" onClick = {() => {updatePage("questionForm", question_id)}}>Ask Question</button>
                </div>
                </div>
            

            <div className="flex-container">
                <div className="left-column2">
                    <div>{question.views} views</div>
                </div>

                <div className="middle-column">
                    <div><p> {question && question.text ? renderTextWithHyperlinks(question.text) : null}</p></div>
                </div>

                <div className="right-column2">
                    <div className="question_metadata">
                        <span className="askedBy">
                            {question.asked_by}
                        </span> asked {formatQuestionDate(question.ask_date_time)}
                    </div>
                </div>
            </div>
            </div>
            
            {answers.map((answerEntry) => (
                <div key={answerEntry.aid} className="answer-entry">
                    <div className="middle-column">
                        <div>
                            {renderTextWithHyperlinks(answerEntry.text)}
                        </div>
                    </div>

                    <div className="right-column2">
                        <div className="question_metadata">
                            <span className="answeredBy">
                                {answerEntry.ans_by}
                            </span> answered {formatQuestionDate(answerEntry.ans_date_time)}
                        </div>
                    </div>
                </div>
            ))}
            
            <button id="answerQuestionButton" onClick = {() => {updatePage("answerForm", question_id)}}>Answer Question</button>
        </div>
    );
}
export default AnswerList;