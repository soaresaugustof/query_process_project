import {buildAlgebraExpression} from "./ExpressionBuilder.js";

export function applyHeuristics(req, res){
    const verifiedQuery = req.body;

    const { tree, algebraExpression } = buildAlgebraExpression(verifiedQuery);

    return res.status(200).json({ tree, algebraExpression });
}