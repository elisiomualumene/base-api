import Express from "express"
import {v4} from "uuid"

const App = Express();

App.get("/", (request, response) => {
    return response.status(200).json({message: "server is running ok"})
})

interface UserProps {
    id: string;
    name: string;
    created_at: Date
}

App.post("/user", (request, response) => {
    const users: UserProps[] = [];
    const {name} = request.body;
    users.push({id: v4(), name, created_at: new Date()});
    
    return response.status(201).json({data: users});
})

App.listen(3000, () => {
    console.log("server is running on port 3000")
})