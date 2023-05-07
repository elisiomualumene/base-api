import * as dotenv from "dotenv"
import * as z from "zod"
import Express, {json, Response} from "express"
import SwaggerUI from "swagger-ui-express"
import swaggerFile from "./docs/swagger.json"
import multer from "multer"
import cors from "cors"
import { PrismaClient } from "@prisma/client"
import { hash, compare } from "bcrypt"
import {sign} from "jsonwebtoken"
import { authenticateToken } from "./middleware"
dotenv.config();

const upload = multer({dest: "uploads/"})

const App = Express();


App.use(json())
App.use(cors())

const database = new PrismaClient();

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

App.use('/api-docs', SwaggerUI.serve, SwaggerUI.setup(swaggerFile))

const IUserProps = z.object({
    name: z.string(),
    email: z.string().email(),
    phone_number: z.number(),
    adress: z.string(),
    nif: z.number(),
    description: z.string(),
    password: z.string()
})

const IArtigoProps = z.object({
    name: z.string(),
    isAvailable: z.boolean(),
    description: z.string()
})

const idReqProps = z.object({
    id: z.number()
})

const LoginReqPros = z.object({
    email: z.string().email(),
    password: z.string()
})

App.get("/", (request, response) => {
    return response.status(200).json({message: "V12 SERVER"})
})

App.post('/auth/login', async (request, response) => {
    const { email, password } = LoginReqPros.parse(request.body);
  
    try {
      // Verificar se o usuário existe no banco de dados
      const user = await database.user.findFirst({ where: { email } });
      if (!user) {
        return response.status(401).json({ message: 'Credenciais inválidas' });
      }
  
      // Verificar a senha usando o Bcrypt
      const isPasswordValid = await compare(password, user.password);
      if (!isPasswordValid) {
        return response.status(401).json({ message: 'Credenciais inválidas' });
      }
  
      // Gerar o token de autenticação usando o JWT
      const token = sign({ userId: user.id }, "v12gym");
  
      // Enviar o token como resposta
      response.json({ status: true, data: {token, user: user} });
    } catch (error) {
      console.error(error);
      response.status(500).json({ message: 'Erro no servidor' });
    }
  });

App.post("/user", upload.single('avatar') ,async (request, response) => {
    const {name, email, phone_number, adress, nif, description, password} = IUserProps.parse(request.body)
    const avatar = request.file?.path

    const hashPassword = await hash(password, 8)

    const user = await database.user.findFirst({where: {email}});

    if(user){
        return response.status(401).json({message: "User already exists!"})
    }
    
    await database.user.create({
        data: {
            name,
            email,
            phone_number,
            adress,
            nif,
            description,
            avatar,
            password: hashPassword
        }
    })
    return response.status(200).json({status: true, message: "User was created", data: user})
})

App.get("/user", async(request, response) =>{
    const user = await database.user.findMany();

    return response.status(200).json({status: true, message: "all user are there!", data: user})
})

App.delete("/user/:id", async(request, response) => {
    const {id} = idReqProps.parse(request.params);

    await database.user.delete({where: {id}});

    return response.status(200).json({status: true, message: "The user was deleted"});
})

App.put("/user/:id", async(request, response): Promise<Response> => {
    const {name, adress, description} = request.body;

    const {id} = idReqProps.parse(request.params)

    const user = await database.user.update({where: {id}, data: {name, adress, description}})

    return response.status(202).json({status: true, message: `The user was updated`, data: user})
})

App.get("/user/:id", async(request, response): Promise<Response> => {
    const {id} = idReqProps.parse(request.params)

    const user = await database.user.findFirst({where:{id}})

    return response.status(200).json({status: true, message: "User finded by id", data: user});
})

// MIDDLEWARE to autheticate token
//blocked routes
App.use(authenticateToken)

// ARTIGOS

App.post("/artigo", async (request, response) => {
    const {name, isAvailable, description} = IArtigoProps.parse(request.body)

    const artigo = await database.user.findFirst({where: {name}});

    if(artigo){
        return response.status(401).json({message: "Artigo already exists!"})
    }

    await database.artigos.create({data: {name, isAvailable, description}})
    
    
    return response.status(200).json({status: true, message: "Artigo was created", data: artigo})
})

App.get("/artigo", async(request, response) =>{
    const artigo = await database.artigos.findMany();

    return response.status(200).json({status: true, message: "all Artigo are there!", data: artigo})
})

App.delete("/artigo/:id", async(request, response) => {
    const {id} = idReqProps.parse(request.params);

    await database.artigos.delete({where: {id}});

    return response.status(200).json({status: true, message: "The Artigo was deleted"});
})

App.put("/artigo/:id", async(request, response): Promise<Response> => {
    const {name, isAvailable, description} = request.body;

    const {id} = idReqProps.parse(request.params)

    const artigo = await database.artigos.update({where: {id}, data: {name, isAvailable, description}})

    return response.status(202).json({status: true, message: `The Artigo was updated`, data: artigo})
})

App.get("/artigo/:id", async(request, response): Promise<Response> => {
    const {id} = idReqProps.parse(request.params)

    const artigo = await database.artigos.findFirst({where:{id}})

    return response.status(200).json({status: true, message: "Artigo finded by id", data: artigo});
})

App.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
