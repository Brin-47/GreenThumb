import { DependencyContainer } from "tsyringe";

import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { IDatabaseTables } from "@spt-aki/models/spt/server/IDatabaseTables";
import { LogTextColor } from "@spt-aki/models/spt/logging/LogTextColor";

class FasterPlanting implements IPostDBLoadMod
{
    private logger: ILogger;

    public preAkiLoad(container: DependencyContainer): void
    {
        this.logger = container.resolve<ILogger>("WinstonLogger");
    }

    public postDBLoad(container: DependencyContainer): void 
    {
        // get database from server
        const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
        this.logger = container.resolve<ILogger>("WinstonLogger");

        // Get all the in-memory json found in /assets/database
        const tables: IDatabaseTables = databaseServer.getTables();

        const quests = tables.templates.quests;

        for (const quest in quests) 
        {
            const conditionsPT = quests[quest].conditions.AvailableForFinish;

            if (conditionsPT !== undefined) 
            {
                for (const condition in conditionsPT)
                {
                    if (conditionsPT[condition]?.conditionType === "LeaveItemAtLocation" && conditionsPT[condition]?.plantTime > 0)
                    {
                        conditionsPT[condition].plantTime = 1;
                        this.logger.logWithColor(`${quests[quest].QuestName} Hide item time reduced.`, LogTextColor.MAGENTA);
                    },
					if (conditionsPT[condition]?.conditionType === "PlaceBeacon" && conditionsPT[condition]?.plantTime > 0)
                    {
                        conditionsPT[condition].plantTime = 1;
                        this.logger.logWithColor(`${quests[quest].QuestName} Plant beacon time reduced.`, LogTextColor.MAGENTA);
                    }
                }
            }
        }
    }
}

module.exports = { mod: new FasterPlanting() }
