import express from "express";
import {timein,timeout,status,currentrecord,recordcount,attendencebetween,attendenceinbetween,attendencerecordofuser,allemployees,Attendencereport} from "../controllers/record.js"

const router = express.Router()

router.post('/timein',timein)
router.post("/timeout",timeout)
router.post("/status",status)
router.post('/todayrecord',currentrecord)
router.post('/userattendence',attendencerecordofuser)
router.post('/allemployees',allemployees)
router.post('/Attendencereport',Attendencereport)
router.post("/attendencebetween",attendencebetween)
router.post('/attendenceinbetween',attendenceinbetween)
router.post('/recordcount',recordcount)

export default router