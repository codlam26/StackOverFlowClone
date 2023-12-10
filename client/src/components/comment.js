import React, { useState, useEffect } from "react";
import axios from "axios";

function Comment({questionID, answerID, commentType, user, updatePage, isAthQ}){
    const [commentList, setCommentList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [commentText, setCommentText] = useState('');
    const [votes, setVotes] = useState({});
    const [usernames, setUsernames] = useState({});
    const [textError, setTexterror] = useState(null);
    const commentsPerPage = 3;
    const handleVote = async (commentId, voteType) => {
        try{
            const userId = user;
            const response = await axios.patch(`http://localhost:8000/comments/incrementvotes/${commentId}`,{
            userId, voteType
            });
            if(response.data.success){
            setVotes((prevVotes) => ({
                ...prevVotes, [commentId]: response.data.comment.votes
            }));
            }
        }
        catch(error){
            console.error('Erorr during vote:', error);
        }
    }

    useEffect(() => {
        const fetchUsernames = async () => {
            const usernamesObj = {};
            for (let comment of commentList) {
                try {
                    const response = await axios.get(`http://localhost:8000/users/${comment.created_by}/username`);
                    usernamesObj[comment.created_by] = response.data;
                } catch (error) {
                    console.error("Error fetching username:", error);
                }
            }
            setUsernames(usernamesObj);
        };
  
        fetchUsernames();
    }, [commentList]);

    const handleInputChange = (e) => {
        setCommentText(e.target.value);
    }

    const postComment = async () => {
        if (commentText.trim() === ''){
            alert('Comment cannot be empty');
            return;
        }
        try{
            const response = await axios.post('http://localhost:8000/postComments/', {
                text: commentText,
                userId: user,
                id: commentType === 'question' ? questionID : answerID,
                commentType: commentType,
            });
            console.log("Post Comment Response", response.data);
            setCommentText('')
            fetchComments();
    }catch (error){
        console.error('Error posting comment:', error);
    }
        };

    const fetchComments = () => {
    const url = commentType === "answer" ? `http://localhost:8000/answer/${answerID}/comments` 
    : `http://localhost:8000/question/${questionID}/comments`;

    axios.get(url).then(response => {
        setCommentList(response.data);
    }).catch(error => {
        console.error('Error fetching comments:', error);
    });
}

useEffect(() => {
    fetchComments();
}, [answerID, questionID]);
    
    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleKeyPress = (e) => {
        if(e.key === 'Enter'){
            e.preventDefault();
            postComment();
        }
    }

    const indexOfLastComment = currentPage * commentsPerPage;
    const indexOfFirstComment = indexOfLastComment - commentsPerPage;
    const currentComments = commentList.slice(indexOfFirstComment, indexOfLastComment);

    return(
        <div>
            <div className = "flex-container">

            <div className="middle-column">
            {isAthQ && (
                 <input
                 className="commentInput"
                 size="50"
                 placeholder="Add a Comment... (Press Enter)"
                 value={commentText}
                 onChange={handleInputChange}
                 onKeyDown={handleKeyPress}
             />
            )}
            </div>
    
            <div className="pagination">
                <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
                Previous
                </button>
                
                <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === Math.ceil(commentList.length / commentsPerPage)}>
                Next
                </button>
                <span> Comments Page: {currentPage}</span>
            </div>
        </div>
        <div>
            {currentComments.map((commentEntry, index) => (
                    <div key={index} className="comment-section">
                        <div className="flex-container">
                            <div className="left-column2">
                                {isAthQ && (<button className = "voteButton" onClick={() => handleVote(commentEntry._id, 'upvote')}>⬆</button>)}
                                <div className="question_stats">
                                    {votes[commentEntry._id] || commentEntry.votes} votes
                                </div>
                            </div>
                            
                            <div className="middle-column">
                                {commentEntry.text}
                                
                            </div>

                            <div className="right-column2">
                                commented by
                                <div className="commentedBy">
                                    {usernames[commentEntry.created_by]}
                                    </div>
                            </div>
                         </div>
                    </div>
                ))}
        </div>
        </div>
        
    );
}

export default Comment;