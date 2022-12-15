import {
    db
} from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {  query, response} from "express";
import nodemailer from 'nodemailer'




let mailTransporter = nodemailer.createTransport({

    host: 'smtp.gmail.com',
    port: 465,
    secure: false,
    service:'gmail',
    auth: {
        user: "rrout.ee.2018@nist.edu",
        pass: "Ritick#Rout@12"
    }
})

// var mailTransporter = nodemailer.createTransport({
//     host: 'smtp.gmail.com',
//     port: 465,
//     secure: true, // use SSL
//     auth: {
//         user: 'user@gmail.com',
//         pass: 'pass'
//     }
// });









//verify the config of the nodemailer
mailTransporter.verify((err, success) => {
    if (err) console.error(err);
    console.log('Your mail config is correct');
});


//send and resend otp for verification of password change 
export const sendOtp = (req, res) => {
    var otp = Math.random();
    otp = otp * 1000000;
    otp = parseInt(otp);
    const q = 'SELECT * FROM Employee WHERE email =?'
    db.query(q, [req.body.email], (err, data) => {
        if (err) return res.json("error message", err);
        if (!data.length) return res.status(409).json("User Does Not Exists")
        if (data.length) {
            const q = "select * from otp where employee_ID = ?"
            db.query(q, [data[0].employee_ID], (err, arr) => {
                if (err) return res.json("error message1", err)
                if (arr.length) {
                    otp = arr[0].generatedOtp;
                    var mailOptions = {
                        from: "rrout.ee.2018@nist.edu",
                        to: req.body.email,
                        subject: "Otp for registration is: ",
                        html: "<h3>OTP for account Password Reset is </h3>" + "<h1 style='font-weight:bold;'>" + otp + "</h1>"
                    };

                    mailTransporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            return console.log("error message2", error);
                        }
                        console.log('Message sent: %s', info.messageId, arr[0].generatedOtp);
                        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                        res.status(200).json('otp sucessfully send 1');
                    });
                } else {
                    var mailOptions = {
                        from: "rrout.ee.2018@nist.edu",
                        to: req.body.email,
                        subject: "Otp for registration is: ",
                        html: "<h3>OTP for account Password Reset is </h3>" + "<h1 style='font-weight:bold;'>" + otp + "</h1>"
                    };
                    mailTransporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            return console.log("error message3", error);
                        }
                        console.log('Message sent: %s', info.messageId);
                        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                        let empId = parseInt(data[0].employee_ID);
                        const q = "INSERT INTO otp(`employee_ID`,`generatedOtp`) VALUES (?,?)"
                        console.log(data[0].employee_ID, otp)
                        db.query(q, [empId, otp], (err, data) => {
                            if (err) console.log("error", err)
                            res.json('otp sucessfully send2 ');
                        })
                    });
                }
            })


        }

    })
};



export const verify = (req, res) => {

    const q = 'SELECT * FROM Employee WHERE email =?'
    db.query(q, [req.body.email], (err, data) => {
        if (err) return response.send(409).json("error Occured", err)
        if (data) {
            const q = "select * from otp where employee_ID = ?"
            db.query(q, [data[0].employee_ID], (err, arr) => {
                if (err) return response.send(409).json("error Occured", err)
                if (req.body.otp == arr[0].generatedOtp) {
                    const passquery = "Update Employee   Set password =? Where employee_ID =?;                 "
                    const salt = bcrypt.genSaltSync(10);
                    const hash = bcrypt.hashSync(req.body.password, salt);
                    db.query(passquery, [hash, data[0].employee_ID], (err, pass) => {
                        if (err) return response.send(409).json("error Occured", err)
                        res.send("Otp has been successfully Verified");
                        db.query("DELETE FROM otp WHERE employee_ID=?", [data[0].employee_ID], (err, success) => {
                            if (err) rconsole.log("Error Occured", err)
                            console.log("succesfully deleted ")
                        })
                    })
                } else {
                    res.status(409).send("Otp is Incorrect")
                }
            })
        }
    })
};



export const addemployee = (req, res) => {
    const q = 'SELECT * FROM Employee WHERE email =?'
    db.query(q, [req.body.email], (err, data) => {
        if (err) return res.json(err);
        if (data.length) return res.status(409).json("User Already Exists!")

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);

        const q = 'INSERT INTO Employee(`Name`,`email`,`password`,`Address`,`Designation`,`Department`) VALUES(?) '
        const values = [
            req.body.Name,
            req.body.email,
            hash,
            req.body.Address,
            req.body.designation,
            req.body.department,
        ]
        db.query(q, [values], (err, data) => {
            if (err) return res.json(err);
          const q = `insert into Usertype(employee_ID,role) VALUES(?,"Employee")`

          db.query(q,[data.insertId],(err,data)=>{
            if(err) return res.json(err)
            return res.status(200).json("user has been Created " )
          })

           
        })
    })
}



export const login = (req, res) => {
    const query = 'SELECT * FROM Employee WHERE email = ?'

    db.query(query, [req.body.email], (err, data) => {
        if (err) return res.json(err)
        if (data.length == 0) return res.status(404).json("Wrong Email or password");

        const passwordCheck = bcrypt.compareSync(req.body.password, data[0].password);

        if (!passwordCheck) return res.status(400).json("Wrong username or password")
        const id = data[0].id;
        if (passwordCheck) {
            const token = jwt.sign({
                id
            }, "jwtkey");


            const {
                password,
                ...other
            } = data[0]

            const q = "SELECT role  FROM Usertype WHERE employee_ID =?"

            db.query(q, [data[0].employee_ID], (err, arr) => {
                if (err) return res.json("error", err)
                if (arr) {
                    // const {userType} = role
                    console.log(arr[0].role, "role")
                    other['role'] = arr[0].role
                    res.status(200).json({
                        token,
                        other
                    })
                }
            })



        }
    })
}