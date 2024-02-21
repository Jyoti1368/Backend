import "dotenv/config";
import express from "express"


const app = express();
const port = process.env.PORT || 4000

//middlewares
app.use(express.json())
app.use(express.urlencoded({extended:false}))


//import routes

import apiRoutes from "./routes/api.js"
app.use('/api',apiRoutes)

app.listen(port, ()=>{
    console.log(`app listening on port ${port}`)
})
