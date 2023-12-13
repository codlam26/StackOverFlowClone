import React, {useState, useEffect} from 'react'
import axios from 'axios';
import Comment from './comment';

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

function AnswerList({updatePage, question_id, isAuthQ, user, userId}){
    const [answers, setAnswers] = useState([]);
    const [question, setquestion] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [tags, setTags] = useState([]);
    const [usernames, setUsernames] = useState({});
    const [user2, setUser]= useState({});
    const [questionUsernames, setQuestionUsernames] = useState({});
    const [votes, setVotes] = useState({});
    const answersPerPage = 5;

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
      const indexOfLastAnswer = currentPage * answersPerPage;
      const indexOfFirstAnswer = indexOfLastAnswer - answersPerPage;
      const currentAnswers = answers.slice(indexOfFirstAnswer, indexOfLastAnswer);

    useEffect(()=>{
        axios.get(`http://localhost:8000/api/answers/${question_id}`).then((res) => {
            setAnswers(res.data);
        });
    }, [question_id])

    useEffect(() => {
        const fetchUsernames = async () => {
            const usernamesObj = {};
            const usernamesObj2 = {};
            for (let answer of answers) {
                try {
                    const response = await axios.get(`http://localhost:8000/users/${answer.ans_by}/username`);
                    usernamesObj[answer.ans_by] = response.data;
                    const response2 = await axios.get(`http://localhost:8000/users/${question.asked_by}/username`);
                    usernamesObj2[question.asked_by] = response2.data;
                } catch (error) {
                    console.error("Error fetching username:", error);
                }
            }
            setUsernames(usernamesObj);
            setQuestionUsernames(usernamesObj2);
        };
  
        fetchUsernames();
    }, [question, answers]);

    useEffect(() => {
        axios.get(`http://localhost:8000/users/getUser/${userId}`).then((response) => {
            console.log(response.data);
            setUser(response.data)
        });
    }, [userId]);

    useEffect( ()=>{
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

    const handleVote = async (answerId, voteType) => {
        try{
            const userId = user.userId;
            const response = await axios.patch(`http://localhost:8000/answers/incrementvotes/${answerId}`,{
            userId, voteType
            });
            if(response.data.success){
            setVotes((prevVotes) => ({
                ...prevVotes, [answerId]: response.data.answer.votes
            }));
            }
        }
        catch(error){
            console.error('Erorr during vote:', error);
        }
    }

    useEffect(async () => {
        const findTags = async () => {
            try{
              const Tags = await axios.get(`http://localhost:8000/api/tags`)
              setTags(Tags.data);
             }
             catch(error){
              console.error(error);
             }
          }
          findTags();
    },[question])

      const getTagNames = (tagIds) => {
        return tagIds.map((tagId) => {
          const tag = tags.find((t) => t._id === tagId);
          return tag ? tag.name: ''
        });
      };
    
      const handleDeleteClick = async (answerId) => {
        axios.delete(`http://localhost:8000/answers/deleteAnswer/${answerId}`).then(async (response) => {
            if(response.data === 'success'){
                const updatedanswerList = answers.filter((answer) => answer._id !== answerId);
                setAnswers(updatedanswerList); 
            }
        })
    }

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
                    {isAuthQ && <button id="askQuestionButtonForm" onClick = {() => {updatePage("questionForm", question_id)}}>Ask Question</button>}
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
                            {questionUsernames[question.asked_by]}
                        </span> asked {formatQuestionDate(question.ask_date_time)}
                    </div>
                </div>
            </div>

            <div className="flex-container">
                <div className="left-column2">
                    <div>{question.votes} votes</div>
                </div>

                <div className="middle-column">
                    <div>
                        {question.tags && getTagNames(question.tags).map((tagName, index) => (
                        <span key={index} className="tag">{tagName}</span>
                        ))}
                    </div>
                    <div>
                        {isAuthQ && <Comment questionID={question_id} user={user} commentType={'question'} isAthQ={false}/>}
                    </div>
                </div>

            </div>            
            </div>
            
            {currentAnswers.length !== 0 ? (currentAnswers.map((answerEntry) => (
                <div key={answerEntry.aid} className="answer-entry">
                    {isAuthQ && (<div className="left-column2">
                    
                    <button className="voteButton"  onClick={() => handleVote(answerEntry._id, 'upvote')}>⬆</button>
                    <br/>
                    <span>{votes[answerEntry._id] || answerEntry.votes} Votes</span>
                    <br/>
                    <button className="voteButton" onClick={() => handleVote(answerEntry._id, 'downvote')}>⬇</button>
                    </div>)}
                    
                    <div className="middle-column">
                        <div className='answerText'>
                            {renderTextWithHyperlinks(answerEntry.text)}
                        </div>
                        <Comment questionID={question_id} answerID={answerEntry._id} user={user} commentType={'answer'} updatePage={updatePage} isAthQ={isAuthQ}/>
                    </div>

                    <div className="right-column2">
                        <div className="question_metadata">
                            <span className="answeredBy">
                                {usernames[answerEntry.ans_by]}
                            </span> answered {formatQuestionDate(answerEntry.ans_date_time)}
                        </div>
                        {answerEntry.ans_by === user2._id && (
                            <span>
                                <button className='editButton' onClick = {() => {updatePage("answerForm", question_id, answerEntry)}}>Edit</button>
                                <button className='deleteButton' onClick = {() => {handleDeleteClick(answerEntry._id)}}>Delete</button>
                             </span>
                        )}
                        
                    
                    </div>
                </div>
            ))) : 
            <h1>No Answers Found</h1>}
            
            {isAuthQ && (<button id="answerQuestionButton" onClick = {() => {updatePage("answerForm", question_id)}}>Answer Question</button>)}
            
            <div className="pagination">
                <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
                Previous
                </button>
                
                <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === Math.ceil(answers.length / answersPerPage)}>
                Next
                </button>
                <span> Page: {currentPage}</span>
          </div>
        </div>
    );
}
export default AnswerList;