import { AllowedImageSize, GuildMember, MessageAttachment } from 'discord.js';
import Canvas                                               from 'canvas';
import path                                                 from 'path';
import _dirname                                             from '../dirname.js';

declare type Av = {
    size: AllowedImageSize,
    x: number,
    y: number
}

declare type Dim = {
    height: number,
    width:  number,
    margin: number
}

const generateImage = async (member: GuildMember): Promise<MessageAttachment> => {
    
    const dim: Dim = { height: 675, width: 1200, margin: 50 }
    const av:  Av = { size: 256, x: 480, y: 170 }

    let username  = member.user.tag;
    let avatarURL = member.user.displayAvatarURL({ format: "png", dynamic: false, size: av.size });

    const canvas = Canvas.createCanvas(dim.width, dim.height)
    const ctx    = canvas.getContext("2d")

    const backimg = await Canvas.loadImage(path.join(_dirname, "../../background.png"));
    ctx.drawImage(backimg, 0, 0)

    const avimg = await Canvas.loadImage(avatarURL)
    ctx.save()

    ctx.beginPath()
    ctx.arc(av.x + av.size / 2, av.y + av.size / 2, av.size / 2, 0, Math.PI * 2, true)
    ctx.closePath()
    ctx.clip()

    ctx.drawImage(avimg, av.x, av.y)
    ctx.restore()

    // write in text
    ctx.fillStyle = "white"
    ctx.textAlign = "center"

    // draw in Welcome
    ctx.font = "50px Sans"
    ctx.fillText("Welcome", dim.width / 2, dim.margin + 70)

    // draw in the username
    ctx.font = "60px Sans"
    ctx.fillText(username, dim.width / 2, dim.height - dim.margin - 125)

    const attachment = new MessageAttachment(canvas.toBuffer(), "welcome.png")
    return attachment
}

export default generateImage;