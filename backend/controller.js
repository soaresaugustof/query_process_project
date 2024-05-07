
export function createGraph(req, res){
    const { verifiedQuery } = req.body;

    console.log(verifiedQuery);

    return res.status(200).json({ message: "Graph created successfully" });
}