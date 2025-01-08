import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { MailConfig } from "src/core/interfaces/mail.interface";

@Injectable()
export class MailHandler {
    constructor(private readonly mailService:MailerService){}

    async sendMail(mailConfig:MailConfig){
        await this.mailService.sendMail({
            from:mailConfig.from,
            to:mailConfig.to,
            subject:mailConfig.subject,
            html:mailConfig.content
        })
    }
}