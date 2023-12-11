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

    useEffect(() => {
        axios.get("http://localhost:8000/api/users").then((response) => {
            setuserList(response.data)
        })
    }, [user])
       
    const handleDeleteClick = async (userId) => {
        axios.delete(`http://localhost:8000/users/deleteUser/${userId}`).then(async (response) => {
            if(response.data === 'success'){
                const updatedUsersList = userList.filter((user) => user._id !== userId);
                setuserList(updatedUsersList); 
            }
        })
    }

    return (
        <div>
            <h1>{user.username}'s Profile</h1>
            <div className="userStats">Member for {getTimeLength(user.created_date)}</div>
            <div className="userStats">Reputation Score: {user.reputation} </div>
            <div className="userStats">All Users: 
                <div className="flex-container">
                    <div className="middle-column2">
                    {userList.map((userEntry, index) => (
                    <div key={index}>
                        <div className="flex-container">
                            <div className="middle-column">
                                {console.log(userEntry)}
                                <button className='userLink' onClick={()=>{updatePage("userPage", userEntry)}}>
                                    {userEntry.username}
                                </button>
                            </div>
                            
                            <div className="left-column2">
                            
                                <button className="deleteButton" disabled = {userEntry.isAdmin === true}  
                                onClick={()=>{handleDeleteClick(userEntry.userId)}}> Delete </button>
                            </div>
                         </div>
                    </div>
                ))}
                    </div>

                </div>
            </div>
        </div>
    )
}

export default AdminPage