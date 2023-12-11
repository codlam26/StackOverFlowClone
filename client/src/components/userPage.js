import React, { useState, useEffect } from "react";
import axios from "axios";

function getTimeLength(date){
    const currentDate = new Date();
    const askDate = new Date(date);
    const timeDifference = Math.floor((currentDate - askDate) / 1000);

    
    if(timeDifference < 60){
        return `${timeDifference} seconds${timeDifference > 1 ? 's' : ''}`
    }
    else if (timeDifference < 3600) {
        const minutes = Math.floor(timeDifference / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    } 
    else if (timeDifference < (3600 * 24)) {
        const hours = Math.floor(timeDifference / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    else{
        const days = Math.floor(timeDifference/ (24 * 60 * 60))
        return `${days} day${days === 1 ? '' : 's'}`
    }
}

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

function UserPage({user, updatePage}){
    const [questions, setQuestions] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const questionsPerPage = 5;

    useEffect(() => {
        axios.get(`http://localhost:8000/questions/byUser/${user._id}`).then((response) => {
            setQuestions(response.data)
        })
    }, [user])

    const handleDeleteClick = (questionId) => {
        axios.delete(`http://localhost:8000/deleteQuestion/${questionId}`).then(async (response) => {
            if(response.data === 'success'){
                const updatedQuestionsList = questions.filter((question) => question._id !== questionId);
                setQuestions(updatedQuestionsList); 
            }
        })
    }

    const handleQuestionAnswer = async (userId) => {
        await axios.get(`http://localhost:8000/question/questionAnswered/${userId}`).then( async (response) =>{
            updatePage('questionList', response.data);
        })
    }

    const handleTags = async (userId) => {
        await axios.get(`http://localhost:8000/tags/byUser/${userId}`).then( async (response) =>{
            updatePage('tagsList', response.data);
        })
    }

    {console.log(user._id)}

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
      };
      const indexOfLastQuestion = currentPage * questionsPerPage;
      const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
      const currentQuestions = questions.slice(indexOfFirstQuestion, indexOfLastQuestion);

    return(
        <div>
            <h1>{user.username}'s Profile</h1>
            <div className="userStats">Member since: {getTimeLength(user.created_date)}</div>
            <div className="userStats">Reputation Score: {user.reputation} </div>
            <h2>{user.username}'s Questions: </h2>
            <div className="question-list">
            {currentQuestions.length > 0 ? (currentQuestions.map((questionEntry, index) => (
                    <div key={index} className="question-entry">
                        <div className="flex-container">
                            <div className='left-column2'>
                                <button className="userLink" onClick={() => {updatePage('questionForm', questionEntry._id, questionEntry)}}>{questionEntry.title}</button>
                            </div>
                            <div className="middle-column">
                                asked {formatQuestionDate(questionEntry.ask_date_time)}
                            </div>
                            <div className="right-column2">
                                <button className="deleteButton" onClick={() => {handleDeleteClick(questionEntry._id)}}> Delete </button>
                            </div>
                        </div>
                    </div>
                ))) : 
                (
                    <div id="noQuestions">
                        <h1 className="noQuestionHeading">No Questions Found</h1>
                    </div>
                )
                }
                <span>
                <button className="displayButton"
                    onClick={() => {handleTags(user._id)}}>All Tags Created by {user.username}</button>
                    <button className="displayButton"
                    onClick={() => {handleQuestionAnswer(user._id)}}>All Questions {user.username} Answered</button>
                </span>
                </div>
            
            <div className="pagination">
            <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
              Previous
            </button>
            
            <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === Math.ceil(questions.length / questionsPerPage)}>
              Next
            </button>
            <span> Page: {currentPage}</span>
          </div>
        </div>
    )
}

export default UserPage