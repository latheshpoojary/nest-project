import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class NotificationService{
    @Cron(CronExpression.EVERY_10_SECONDS)
    notifyMe(){
        console.log("Notification from Scheduler");
        
    }
}