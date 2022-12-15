import {
  db
} from "../db";
import {
  query,
  response
} from "express";





// export const timein = (req, res) => {

//   const q = "INSERT INTO `Employee_Attendence_Record`(employee_ID,status) VALUES (?,?) "
//   db.query(q, [req.body.id, "Timein"], (err, data) => {
//     if (err) return res.sendStatus(409).json(err) 
//     const q = "select * from `Duty Duration` where `date` = current_date() && employee_ID =?;"
//     db.query(q, [req.body.id], (err, data) => {
//       if (err) return res.sendStatus(409).json(err)
//       if (data.length) res.json("sucessfully Timein")
//       if (!data.length) {
//         let q = "insert into `Duty Duration`(employee_ID,duration,`date`) VALUES(?,0,curdate()) "
//         db.query(q, [req.body.id], (err, data) => {
//           if (err) return res.sendStatus(409).json(err)
//           res.json("successfully Timein")
//         })
//       }
//     })
//   })
// }



export const timein = (req, res) => {

 const q = "select * from `Employee_Attendence_Record` where employee_ID =? && date(timein) = curdate()"
 db.query(q,[req.body.id],(err,data)=>{
   if(err) return res.sendStatus(409).json(err)
   if(data.length) return res.json("already login today")
   const q = "INSERT INTO `Employee_Attendence_Record`(employee_ID,status) VALUES (?,?) "
   db.query(q, [req.body.id, "working"], (err, data) => {
    if (err) return res.sendStatus(409).json(err) 
     res.json('successfully time in')
 })
})
}


export const timeout = (req, res) => {
  const q = "select * from `Employee_Attendence_Record` where employee_ID = ?  && isnull(timeout)"

  db.query(q, [req.body.id], (err, data) => {
    if (err) return res.sendStatus(409).json(err)
    if (data.length) {
      const q = "Update `Employee_Attendence_Record` set timeout =current_timestamp,status=?  where id =?;"
      db.query(q, ["Present", data[0].id], (err, data) => {
        if (err) return res.sendStatus(409).json(err)
        res.json("sucessfully time out")
      })
    }
  })

}


export const status = (req, res) => {

  const q = "select * from `Employee_Attendence_Record` where employee_ID = ?  && isnull(timeout)"

  db.query(q, [req.body.id], (err, data) => {
    if (err) return res.sendStatus(409).json(err)
    if (data.length) return res.json("Timeout")
    else return res.json("Timein")
  })
}

export const currentrecord = (req, res) => {
  const q = "select status , time(timein) as timein , time(timeout) as timeout , SEC_TO_TIME( UNIX_TIMESTAMP(timeout) - UNIX_TIMESTAMP(timein)) as difference ,SEC_TO_TIME(sum( UNIX_TIMESTAMP(timeout) - UNIX_TIMESTAMP(timein) ) over ()) as  totaltime  from `Employee_Attendence_Record` where employee_ID =? AND DATE(timein) = curdate() "

  db.query(q, [req.body.id], (err, data) => {
    if (err) return res.sendStatus(409).json(err)
    if (data.length) return res.json(data)
    res.json("")
  })
}


export const attendencerecordofuser =(req,res)=>{
  const q ='select  DATE_FORMAT(timein, "%d-%m-%y") Date,  TIME_FORMAT(timein, "%H :%i :%s") Timein ,TIME_FORMAT(timeout, "%H: %i :%s") Timeout ,SEC_TO_TIME( UNIX_TIMESTAMP(timeout) - UNIX_TIMESTAMP(timein) ) as  Duration     from  `Employee_Attendence_Record` where employee_ID=?'
  db.query(q,[req.body.id],(err,data)=>{
    if(err) return res.sendStatus(409).json(err)
      if(data.length) return res.json(data)
      res.json("")

  })

}

export const allemployees = (req,res)=>{
  const q  = `SELECT Employee.Name,Employee.email,Employee.Address,Employee.Designation,Employee.Department from Employee  INNER JOIN Usertype ON Employee.employee_ID = Usertype.employee_ID where Usertype.role = "Employee"`
   
   db.query(q,(err,data)=>{
    if(err) return res.sendStatus(409).json(err)
    var num =data.slice(req.body.page?req.body.page*5 :0 , (req.body.page*5)+5)
    const obj ={
      data :num,
      len :Math.ceil(data.length/5) 
    }
     res.json(obj)
   }) 
}

export const Attendencereport = (req,res)=>{
  const q  ="select   Employee.employee_ID as employee_ID , Name , date(timein) as date , status ,time(timein) timein , time(timeout) timeout ,SEC_TO_TIME( UNIX_TIMESTAMP(timeout) - UNIX_TIMESTAMP(timein) ) as  Duration    from Employee  inner join  `Employee_Attendence_Record` on  `Employee_Attendence_Record`.employee_ID = Employee.employee_ID INNER JOIN Usertype ON Employee.employee_ID = Usertype.employee_ID  where Usertype.role = 'Employee' && date(timein) = curdate() union select  Employee.employee_ID ,Name ,   date(curdate()) as 'date',  'Absent' as status ,'' as timein , '' as timeout, '' as Duration from Employee  INNER JOIN Usertype ON Employee.employee_ID = Usertype.employee_ID  where Usertype.role = 'Employee' && Employee.employee_ID not in (select Employee.employee_ID from Employee left join  `Employee_Attendence_Record` on  `Employee_Attendence_Record`.employee_ID = Employee.employee_ID where date(timein) = curdate()) "
   db.query(q,(err,data)=>{
    if(err) return res.sendStatus(409).json(err)
    res.json(data)
   })
}


function datesinBetween(date1,date2){
  let result 
 var getDaysArray = function(start, end) {
  for(var arr=[],dt=new Date(start); dt<=new Date(end); dt.setDate(dt.getDate()+1)){
      arr.push(new Date(dt));
  }
  return arr;
};
var daylist = getDaysArray(new Date(date1),new Date(date2));
result =daylist.map((v)=>( v.toISOString().slice(0,10)))

return result
}


// export const attendenceinbetween = (req,res)=>{

//  const dateArr = datesinBetween(req.body.from,req.body.to)
 

//  const q = "select   Name , ? as date , status ,time(timein) timein , time(timeout) timeout ,SEC_TO_TIME( UNIX_TIMESTAMP(timeout) -  UNIX_TIMESTAMP(timein) ) as  Duration    from Employee  inner join  `Employee_Attendence_Record` on  `Employee_Attendence_Record`.employee_ID = Employee.employee_ID INNER JOIN Usertype ON Employee.employee_ID = Usertype.employee_ID  where Usertype.role = 'Employee' && date(timein) = DATE(?) && date(Employee.createdAt) <= ? union  select Name ,   date(?) as 'date',  'Absent' as status ,'' as timein , '' as timeout, '' as Duration from Employee  INNER JOIN Usertype ON Employee.employee_ID = Usertype.employee_ID  where Usertype.role = 'Employee' && Employee.employee_ID not in (select Employee.employee_ID from Employee left join  `Employee_Attendence_Record` on  `Employee_Attendence_Record`.employee_ID = Employee.employee_ID where date(timein) = ? && date(Employee.createdAt) <= ?) && date(Employee.createdAt) <= ?"

// let result =[]
//  for(let i =0 ; i < dateArr.length;i++){
//   const arr = Array(7).fill(dateArr[i]);
//   db.query(q,arr,(err,data)=>{
//     if(err) return res.json(err)
//     if(data.length){
//       result.push(data)
//     }
//   })
//  }
//  res.json(result)



// }

export const attendenceinbetween = (req,res)=>{
    const q = "select   Name , ? as date , status ,time(timein) timein , time(timeout) timeout ,SEC_TO_TIME( UNIX_TIMESTAMP(timeout) -  UNIX_TIMESTAMP(timein) ) as  Duration    from Employee  inner join  `Employee_Attendence_Record` on  `Employee_Attendence_Record`.employee_ID = Employee.employee_ID INNER JOIN Usertype ON Employee.employee_ID = Usertype.employee_ID  where Usertype.role = 'Employee' && date(timein) = DATE(?) && date(Employee.createdAt) <= ? union  select Name ,   date(?) as 'date',  'Absent' as status ,'' as timein , '' as timeout, '' as Duration from Employee  INNER JOIN Usertype ON Employee.employee_ID = Usertype.employee_ID  where Usertype.role = 'Employee' && Employee.employee_ID not in (select Employee.employee_ID from Employee left join  `Employee_Attendence_Record` on  `Employee_Attendence_Record`.employee_ID = Employee.employee_ID where date(timein) = ? && date(Employee.createdAt) <= ?) && date(Employee.createdAt) <= ?"
    const arr = Array(7).fill(req.body.date);
    db.query(q,arr,(err,data)=>{
       if(err) return res.json(err)
       if(data.length){
        res.json(data)
       }
     })
}



// export const attendenceinbetween = (req,res)=>{

//   const result = []
//   let dateArr = datesinBetween(req.body.from , req.body.to)

//     var response = [];
//     //doing something with rows
//     Promise.all(dateArr.map(function(item) {
//         var promise = new Promise(function(resolve,reject) {
//       const q = "select Name , ? as date , status ,time(timein) timein , time(timeout) timeout ,SEC_TO_TIME( UNIX_TIMESTAMP(timeout) -  UNIX_TIMESTAMP(timein) ) as  Duration    from Employee  inner join  `Employee_Attendence_Record` on  `Employee_Attendence_Record`.employee_ID = Employee.employee_ID INNER JOIN Usertype ON Employee.employee_ID = Usertype.employee_ID  where Usertype.role = 'Employee' && date(timein) = DATE(?) && date(Employee.createdAt) <= ? union  select Name ,   date(?) as 'date',  'Absent' as status ,'' as timein , '' as timeout, '' as Duration from Employee  INNER JOIN Usertype ON Employee.employee_ID = Usertype.employee_ID  where Usertype.role = 'Employee' && Employee.employee_ID not in (select Employee.employee_ID from Employee left join  `Employee_Attendence_Record` on  `Employee_Attendence_Record`.employee_ID = Employee.employee_ID where date(timein) = ? && date(Employee.createdAt) <= ?) && date(Employee.createdAt) <= ?"
//       const arr = Array(7).fill(item);
//             db.query(q,arr,function(err,rows) {
//                 //doing something
//                 result.push(rows);
//                 //and want to push it to an array
//                 resolve(result);
//             });
//         });
//         return promise.then(function(result) {
//             console.log(result); //ok
//             response.push(result) //ok
//         });
//     }).then(function () {
//         console.log(response); //not empty
//     }));






  
//   // dateArr.map((item)=>{
//   //     const q = "select Name , ? as date , status ,time(timein) timein , time(timeout) timeout ,SEC_TO_TIME( UNIX_TIMESTAMP(timeout) -  UNIX_TIMESTAMP(timein) ) as  Duration    from Employee  inner join  `Employee_Attendence_Record` on  `Employee_Attendence_Record`.employee_ID = Employee.employee_ID INNER JOIN Usertype ON Employee.employee_ID = Usertype.employee_ID  where Usertype.role = 'Employee' && date(timein) = DATE(?) && date(Employee.createdAt) <= ? union  select Name ,   date(?) as 'date',  'Absent' as status ,'' as timein , '' as timeout, '' as Duration from Employee  INNER JOIN Usertype ON Employee.employee_ID = Usertype.employee_ID  where Usertype.role = 'Employee' && Employee.employee_ID not in (select Employee.employee_ID from Employee left join  `Employee_Attendence_Record` on  `Employee_Attendence_Record`.employee_ID = Employee.employee_ID where date(timein) = ? && date(Employee.createdAt) <= ?) && date(Employee.createdAt) <= ?"
//   //     const arr = Array(7).fill(item);
    
//   //     db.query(q,arr,function(err,rows) {
//   //       var response = [];
//   //       Promise.all(rows.map(function(item) {
//   //           var promise = new Promise(function(resolve,reject) {
//   //                   //doing something
//   //                   console.log("item-----------",item)
//   //                   result.push(item) 
//   //                   //and want to push it to an array
//   //                   resolve(result);
//   //           });
//   //           return promise.then(function(result) {
//   //             console.log("result-----------",result)
//   //               console.log(result); //ok
//   //               response.push(result) //ok
//   //           });
//   //       }).then(function () {
//   //           console.log(response); //not empty
//   //       }));
//   //     })
  
//   //   }
//   //   );
  
  
//   }


export const attendencebetween = (req,res)=>{
  const q  = "select   Employee.employee_ID as employee_ID ,Name , Department , timein as date , status , time(timein) timein , time(timeout) timeout  ,SEC_TO_TIME( UNIX_TIMESTAMP(timeout) - UNIX_TIMESTAMP(timein) ) as  Duration    from Employee inner join  Employee_Attendence_Record on  Employee_Attendence_Record.employee_ID = Employee.employee_ID INNER JOIN Usertype ON Employee.employee_ID = Usertype.employee_ID where Usertype.role = 'Employee' &&   date(timein) >= date(?) AND date(timein) <= date(?)"
    db.query(q,[req.body.from,req.body.to],(err,data)=>{
     if(err)return res.sendStatus(409).json(err)
     res.json(data)
    })
}

export  const recordcount  =(req,res)=>{
  const q =" SELECT count(*) count from Employee_Attendence_Record where date(timein) = curdate() union SELECT count(*)  count  from Employee JOIN Usertype on Usertype.employee_ID = Employee.employee_ID where Usertype.role ='Employee'"
  db.query(q,(err,data)=>{
    if(err)return res.sendStatus(409).json(err)
    res.json(data)
   })
}