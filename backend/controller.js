import { createGraphService } from "./service";

export function createGraph(req, res){
    const { verifiedQuery } = req.body;

    const result = createGraphService(verifiedQuery);

    return res.status(200).json({ message: "Graph created successfully" });
}