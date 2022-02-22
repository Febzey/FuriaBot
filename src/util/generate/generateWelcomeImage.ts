import { AllowedImageSize, GuildMember, MessageAttachment } from 'discord.js';
import Canvas from 'canvas';
import path from 'path';
import _dirname from '../dirname.js';

const generateImage = async (member: GuildMember):Promise<MessageAttachment> => {
    console.log(path.join(_dirname, "../../background.png"));
    const dim = {
        height: 675,
        width: 1200,
        margin: 50
    }

    const av: {
        size: AllowedImageSize,
        x: number,
        y: number
    } = {
        size: 256,
        x: 480,
        y: 170
    }

    let username = member.user.tag;
    let avatarURL = member.user.displayAvatarURL({ format: "png", dynamic: false, size: av.size });

    const canvas = Canvas.createCanvas(dim.width, dim.height)
    const ctx = canvas.getContext("2d")

    // draw in the background
    const backimg = await Canvas.loadImage(path.join(_dirname, "../../background.png"));
    ctx.drawImage(backimg, 0, 0)

    // draw black tinted box
    ctx.fillStyle = "rgba(0,0,0,0.8)"
    ctx.fillRect(dim.margin, dim.margin, dim.width - 2 * dim.margin, dim.height - 2 * dim.margin)

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
    ctx.fillText("Welcome", dim.width/2, dim.margin + 70)

    // draw in the username
    ctx.font = "60px Sans"
    ctx.fillText(username, dim.width/2, dim.height - dim.margin - 125)

     // draw in to the server
    // ctx.font = "40px Sans"
    // ctx.fillText("to the server", dim.width / 2, dim.height - dim.margin - 50)

    const attachment = new MessageAttachment(canvas.toBuffer(), "welcome.png")
    return attachment
}

export default generateImage;