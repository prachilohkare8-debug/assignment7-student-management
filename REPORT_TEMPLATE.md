# Assignment 7: Full-Stack Student Management System with MongoDB

**Student name:** [Enter your name]  
**PRN / Roll No.:** [Enter PRN]  
**Division / Batch:** [Enter division and batch]  
**Course:** Web Technology (2304362L)  
**Practical:** No. 7 — NoSQL Database (MongoDB)  
**Date:** [Enter date]

## 1. Aim
To design, develop and deploy a web application that interacts with a NoSQL database (MongoDB) from a Node.js application.

## 2. Problem statement
The Student Management System provides a single interface for maintaining student identity, contact and academic records. It supports creating, viewing, updating and deleting records, together with searching, filtering, sorting and pagination to make records easier to manage.

## 3. Design
### Technologies used
- HTML, CSS and browser JavaScript — frontend
- Node.js and Express — web server and REST API
- Mongoose — MongoDB object modelling and schema validation
- MongoDB Atlas — hosted NoSQL database

### Architecture
Browser (HTML/CSS/JavaScript) → Express REST API → Mongoose model/schema → MongoDB Atlas `students` collection. The API returns JSON responses to the browser.

### Schema design
Describe `fullName`, `prn`, `email`, `department`, `year`, `cgpa`, `_id`, `createdAt` and `updatedAt`. Mention required fields, unique PRN/email, valid email and CGPA range 0–10.

**[Insert screenshot: Student schema in `models/Student.js`]**

**[Insert screenshot: MongoDB Atlas `students` collection showing actual documents]**

## 4. Implementation
Explain the following modules in your own words:
1. `server.js`: Express setup, static frontend hosting, database connection and health route.
2. `models/Student.js`: Mongoose schema and field validation.
3. `routes/students.js`: REST endpoints for CRUD, search/filter, sort and pagination.
4. `public/index.html`, `public/styles.css`, `public/app.js`: interface, form validation and API requests.
5. Environment configuration: `MONGODB_URI` is stored in `.env`, which is excluded from Git and the submission ZIP.

## 5. Output and screenshots
Use your own screenshots, each with a short caption:
1. **Figure 1:** Application dashboard with database connected.
2. **Figure 2:** Add student form with valid details.
3. **Figure 3:** Student appears in directory after Create.
4. **Figure 4:** Student document visible in MongoDB Atlas.
5. **Figure 5:** Updated details after Update.
6. **Figure 6:** Delete confirmation and record absent after Delete.
7. **Figure 7:** Search/filter result.
8. **Figure 8:** Sorted CGPA result.
9. **Figure 9:** Invalid field/duplicate PRN or email rejected with an error message.
10. **Figure 10:** Pagination, if more than eight records have been inserted.
11. **Figure 11:** `/api/health` response and/or deployment logs.
12. **Figure 12:** Deployed application working in a browser.

## 6. Testing
| Test | Input/action | Expected result | Actual result |
|---|---|---|---|
| Create | Submit valid unique student | Record saved and shown | [Fill after testing] |
| Read | Load directory | Student details displayed | [Fill after testing] |
| Update | Change CGPA | New value displayed | [Fill after testing] |
| Delete | Confirm delete | Record removed | [Fill after testing] |
| Search/filter | Search name or select department | Matching records only | [Fill after testing] |
| Sort | Select CGPA high–low | Descending CGPA order | [Fill after testing] |
| Validation | Submit invalid email/CGPA | Request rejected with error | [Fill after testing] |
| Duplicate | Reuse PRN/email | Duplicate rejected | [Fill after testing] |

## 7. Conclusion and limitations
After testing, state which CRUD and query features worked. Mention that access to the deployed application depends on the hosting service and Atlas cluster remaining active. Do not claim a test passed unless you performed it.

## 8. AI use declaration
Complete truthfully, based on the AI tools used during this assignment.

| Required item | Declaration |
|---|---|
| AI tool and prompt used | [Name the tool and briefly describe the prompt actually used.] |
| One output checked and how | [Explain what you ran/tested or checked against the assignment requirements.] |
| One thing corrected or rejected, and why | [Describe a real correction/rejection and the reason.] |
