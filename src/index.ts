import * as dotenv from "dotenv"
import Express, {json} from "express"
import {v4} from "uuid"
import SwaggerUI from "swagger-ui-express"
import swaggerFile from "./docs/swagger.json"
import { PrismaClient } from "@prisma/client"
dotenv.config();

const App = Express();

App.use(json())


const database = new PrismaClient();

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

App.use('/api-docs', SwaggerUI.serve, SwaggerUI.setup(swaggerFile))

App.get("/", (request, response) => {
    return response.status(200).json({message: "V12 SERVER"})
})

App.post("/user", async (request, response) => {
    const {name, email, phone_number, adress, nif, description} = request.body;

    const user = await database.user.findFirst({where: {email}});

    if(user){
        throw new Error("user already exists!");
    }
    
    await database.user.create({
        data: {
            name,
            email,
            phone_number,
            adress,
            nif,
            description
        }
    })
    return response.status(200).json({status: true, message: "User was created", data: user})
})



App.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
