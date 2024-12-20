# odin-members-only

-> Need database (members-only)
- users (id, first_name, last_name, username, email, password, membership_status)
- messages (id, title, text, timestamp, user_id(ref to users.id))

-> Fill database with data (once when need it for testing)

-> Sign-up form (confirm password) (sanitize and validate) with express-validator ('/signup') -> ('/')
-> Log-in form using passport.js ('/login') -> ('/')
-> When log-in give user create a new message link 
-> Create new message form ('/new-message') -> ('/')
-> Secure password with bcryptjs
-> Add a page may able to join the club with a secret passcode
-> Author and datetime of messages should only be visible to club members
-> Add admin to user model (make them able to delete messages (delete button should only be seen by admin))
-> Add a page make user admin with a secret passcode
-> Every visiter should be able to see messages (can create message)
-> Every user should be able to see and create messages (can't see author and time)
-> Every member of club should be able to see and create messages (including time and author of messages)
-> Every admin should be able to delete, create and see messages


REQUIRED NODE MODULES
-> express
-> ejs
-> pg or mongoose
-> express-session
-> express-validator
-> connect-pg-simple or connect-mongo
-> passport
-> passport-local or passport-jwt
-> bcryptjs or crypto