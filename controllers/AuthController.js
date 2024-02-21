import { LoginSchema, registerSchema } from "../Validation/AuthValidations.js";
import prisma from "../db/db.config.js";


import vine , {errors} from '@vinejs/vine'
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

class AuthController{
    static async register(req,res){
        try {
            const body = req.body
        const validator = vine.compile(registerSchema)
        const payload = await  validator.validate(body)

        //checking email as unique
        const findUser  = await prisma.users.findUnique({
            where:{
                email:payload.email
            }
        })

        if(findUser){
            return res.status(400).json({message:"error Use unique email" , errors:{ email:" Email already taken"}})
        }

        //Encrypt the password
            const salt = bcrypt.genSaltSync(10)
            payload.password = bcrypt.hashSync(payload.password,salt)

            const user = await prisma.users.create({
                data:payload
            })


        res.json({status:200, message:"data Created Successfully", user})

        } catch (error) {
            console.log("the error is ", error)
            if (error instanceof errors.E_VALIDATION_ERROR) {
               
                return res.status(400).json(error.messages)
            }
            else{
                return res.status(500).json({status:500, message:"Error server Break "})
            }
            
        }
        
    }
    static async login(req, res) {
        try {
          const body = req.body;
          const validator = vine.compile(LoginSchema);
          const payload = await validator.validate(body);
    
          // Find user with email
          const findUser = await prisma.users.findFirst({
            where: {
              email: payload.email
            }
          });
    
          if (!findUser) {
            return res.status(400).json({ errors: { email: "No user found" } });
          }
    
          // Compare passwords
          const passwordMatch = await bcrypt.compare(payload.password, findUser.password);
          if (!passwordMatch) {
            return res.status(400).json({ errors: { password: "Incorrect password" } });
          }
    
          // * Isuue token to user
          const payloadData = {
            id:findUser.id,
            name:findUser.name,
            email:findUser.email,
            profile:findUser.profile
          }
            const token = jwt.sign(payloadData,process.env.JWT_TOKEN,{expiresIn:"365d",
          })


          return res.json({ message: "Logged in", Login_TOken:`Bearer ${token} `});
        } catch (error) {
          console.log("The error is ", error);
          if (error instanceof errors.E_VALIDATION_ERROR) {
            return res.status(400).json(error.messages);
          } else {
            return res.status(500).json({ status: 500, message: "Internal server error" });
          }
        }
      }
    }

export default AuthController;
