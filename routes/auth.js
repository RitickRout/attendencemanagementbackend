import express from 'express';
import {login,addemployee,verify,sendOtp} from '../controllers/auth.js'


const router = express.Router()
router.post('/sendotp',sendOtp)
router.post('/addemployee',addemployee)
router.post('/verify',verify)
router.post('/login',login)

export default router;