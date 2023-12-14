Add design docs in *images/*

## Instructions to setup and run project
First install all the dependencies for the project:
```
$npm install
# Both the client and the server directory
```

Initialize the database by running this command:
```
# Has to be in the server directory
$node init.js <admin_email> <password_of_admin>
```

Run the server by running this command:
```
# Has to be in the server directory
$npm start <secretKey>
# Example: npm start secretkey
```
The secretKey can be anything you want, Ex. npm start secret

Then on a seperate terminal run this command on the client directory:
```
# Has to be in the client directory
$npm start
```

Login Information
```
Email: user1@gmail.com
Password: password123

Email: user2@gmail.com
Password: password123

Email: user3@gmail.com
Password: password123

#You can look at the user stats on the client to see their reputations and other information

```
## Team Member 1 Contribution
```
Cody Lam:
- Created the init.js
- Created the admin and user Page
- Created the backend/frontend for the Users
- Created the backend/frontend for delete && put && get endpoints for Question, Tags, and Answers
- Created the backend/frontend of comments
```
## Team Member 2 Contribution
```
Shashwat Panigrahi:
- Welcome Page
- Sign In
- Sign Up
- Guest User 
- Sign Out
- Pagination 
- Cookies and Sessions
- Upvotes and Downvotes
```

