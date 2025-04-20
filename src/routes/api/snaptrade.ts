import { NextApiRequest, NextApiResponse } from "next";
import { snapTradeService } from "../../services/snaptradeService";
import { getSnapTradeConfig } from "../../lib/snaptrade/config";

const config = getSnapTradeConfig();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { method, body, query } = req;

    switch (method) {
      case "GET":
        if (req.url?.includes("/status")) {
          const status = await snapTradeService.checkApiStatus();
          res.status(200).json(status);
        } else if (req.url?.includes("/connections")) {
          const connections =
            await snapTradeService.connections.listBrokerageAuthorizations({
              userId: query.userId as string,
              userSecret: query.userSecret as string,
            });
          res.status(200).json(connections);
        } else if (req.url?.includes("/accounts")) {
          if (req.url?.includes("/positions")) {
            const accountId = req.url.split("/")[4];
            const positions =
              await snapTradeService.accountInformation.getUserAccountPositions(
                {
                  userId: query.userId as string,
                  userSecret: query.userSecret as string,
                  accountId,
                }
              );
            res.status(200).json(positions);
          } else if (req.url?.includes("/balance")) {
            const accountId = req.url.split("/")[4];
            const balance =
              await snapTradeService.accountInformation.getUserAccountBalance({
                userId: query.userId as string,
                userSecret: query.userSecret as string,
                accountId,
              });
            res.status(200).json(balance);
          } else if (req.url?.includes("/orders")) {
            const accountId = req.url.split("/")[4];
            const orders =
              await snapTradeService.accountInformation.getUserAccountOrders({
                userId: query.userId as string,
                userSecret: query.userSecret as string,
                accountId,
              });
            res.status(200).json(orders);
          } else {
            const accounts =
              await snapTradeService.accountInformation.listUserAccounts({
                userId: query.userId as string,
                userSecret: query.userSecret as string,
              });
            res.status(200).json(accounts);
          }
        } else {
          res.status(404).json({ error: "Not Found" });
        }
        break;

      case "POST":
        const { userId } = body;
        const user = await snapTradeService.registerUser(userId);
        res.status(200).json(user);
        break;

      case "DELETE":
        const { userId: deleteUserId } = body;
        await snapTradeService.deleteUser(deleteUserId);
        res.status(200).json({ message: "User deleted successfully" });
        break;

      default:
        res.setHeader("Allow", ["GET", "POST", "DELETE"]);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error("Error in SnapTrade API route:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
