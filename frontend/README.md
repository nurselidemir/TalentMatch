# TalentMatch Frontend – React Interface

This is the frontend interface for **TalentMatch NLP**, a CV parsing and job matching system built with React and FastAPI.

##  Features

- Upload multiple CV files (`.pdf`, `.docx`)
- View uploaded CV list with details
- Submit job descriptions
- Match job descriptions with stored CVs
- Send emails to matched candidates
- Responsive and clean user interface

##  Project Structure

```
src/
├── App.js
├── components/
│   ├── CVUpload.js
│   ├── CVList.js
│   ├── CVDetails.js
│   ├── JobList.js
│   ├── JobMatchForm.js
│   └── JobMatch.js
```

##  Run Locally

```bash
cd frontend
npm install
npm start
```

> App will run at: [http://localhost:3000](http://localhost:3000)

## Dependencies

- React
- Axios
- React DOM
- Create React App

##  Connects to

- Backend API: `http://localhost:8000` (FastAPI)






