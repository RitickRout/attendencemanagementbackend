// import {Auth,LoginCredentials} from "two-step-auth";

// async function login(emailId) {
//     try {
//       const res = await Auth(emailId, "Company Name");
//       console.log(res);
//       console.log(res.mail);
//       console.log(res.OTP);
//       console.log(res.success);
//     } catch (error) {
//       console.log( "error message ",error);
//     }
//   }

//   // This should have less secure apps enabled
// LoginCredentials.mailID = "rrout.ee.2018@nist.edu"; 
  
// // You can store them in your env variables and
// // access them, it will work fine
// LoginCredentials.password = "832401@Ritick"; 
// LoginCredentials.use = true;

// login("routritick6@gmail.com"); 
import express  from "express";
import bodyParser from "body-parser";
import authRoutes from './routes/auth.js';
import recordRoutes from './routes/record.js';
import {db} from './db.js'
import cors from 'cors'

const app = express()
const port = 8000;

app.use(bodyParser.json())
app.use(bodyParser.urlencoded(
    {extended:true}
))
app.use(cors())

db.connect(function (err) {
    if (err) {
        return console.error('error: ' + err.message);
    }
    console.log('Connected to the MySQL server.');
})

app.use('/api/auth',authRoutes)
app.use('/api/record',recordRoutes)


app.listen(port,()=>{
    console.log("connected in port  "+port)
})



