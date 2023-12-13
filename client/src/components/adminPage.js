import React, { useEffect, useState } from "react";
import axios from "axios";


function getTimeLength(date){
    const currentDate = new Date();
    const askDate = new Date(date);
    const timeDifference = Math.floor((currentDate - askDate) / 1000);

    if(timeDifference < 60){
        return `${timeDifference} second${timeDifference > 1 ? 's' : ''}`
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

function AdminPage({user, updatePage}){
    const [userList, setuserList] = useState([]);
    const [showWarning, setShowWarning] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);

    useEffect(() => {
        axios.get("http://localhost:8000/api/users").then((response) => {
            setuserList(response.data)
        })
    }, [selectedUserId])

    const handleDeleteClick = (userId) => {
        setShowWarning(true);
        setSelectedUserId(userId);
    }

    const confirmDelete = async () => {
        axios.delete(`http://localhost:8000/users/deleteUser/${selectedUserId}`).then(async (response) => {
            if(response.data === "success"){
                const updatedUsersList = userList.filter((user) => user.userId !== selectedUserId);
                setuserList(updatedUsersList); 
            }
            setShowWarning(false);
            setSelectedUserId(null);
        })
    }

    const cancelDelete = () => {
        setShowWarning(false);
        setSelectedUserId(null);
      };

    return (
        <div>
            <h1>{user.username}'s Profile</h1>
            <div className="userStats">Member for {getTimeLength(user.created_date)}</div>
            <div className="userStats">Reputation Score: {user.reputation} </div>
            <div className="userStats">All Users: 
                <div className="flex-container">
                    <div className="middle-column2">
                    {userList.length !== 0 ? (userList.map((userEntry, index) => (
                    <div key={index}>
                        <div className="flex-container">
                            <div className="middle-column">
                                <button className='userLink' onClick={()=>{updatePage("userPage", userEntry._id)}}>
                                    {userEntry.username}
                                </button>
                            </div>
                            
                            <div className="left-column2">
                                <button className="deleteButton" disabled = {userEntry.isAdmin === true}  
                                onClick={()=>{handleDeleteClick(userEntry._id)}}> Delete </button>           
                            </div>  
                         </div>
                    </div>)
                )) :
                <div>
                    <h1>No Users Found</h1>
                </div>
                }
                            {showWarning && (
                                <div className="warningMessage">
                                    <p>Are you sure you want to delete this user?</p>
                                    <button className="confirmButton" onClick={() => {confirmDelete()}}>Confirm</button>
                                    <button className="deleteButton" onClick={() => {cancelDelete()}}>Cancel</button>
                                </div>     
                            )}  
                    </div>

                </div>
            </div>
        </div>
    )
}

export default AdminPage